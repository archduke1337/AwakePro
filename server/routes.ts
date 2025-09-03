import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { OpenRouterService } from "./services/openrouter";
import type { ChatRequest, ChatResponse, AutomationAction } from "@shared/types";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  let openRouterService: OpenRouterService;
  
  try {
    openRouterService = new OpenRouterService();
    console.log('✅ OpenRouter service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize OpenRouter service:', error);
    // Create a fallback service that returns error messages
    openRouterService = {
      chat: async (message: string, model: string) => {
        console.log('Using fallback service for message:', message);
        return {
          content: `Service temporarily unavailable. Please check your API configuration. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          modelUsed: 'fallback'
        };
      }
    } as any;
    console.log('⚠️ Using fallback OpenRouter service');
  }

  // Global error handler for unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  // Helper function to detect automation keywords and generate actions
  function detectAutomations(message: string): AutomationAction[] {
    const automations: AutomationAction[] = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('email')) {
      automations.push({
        type: 'email',
        message: 'Action simulated: Email sent!',
        icon: '📧'
      });
    }

    if (lowerMessage.includes('task')) {
      automations.push({
        type: 'task', 
        message: 'Action simulated: Jira task created!',
        icon: '✅'
      });
    }

    if (lowerMessage.includes('slack')) {
      automations.push({
        type: 'slack',
        message: 'Action simulated: Slack message posted!',
        icon: '💬'
      });
    }

    return automations;
  }

  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      console.log('Chat request received:', { 
        body: req.body, 
        headers: req.headers,
        timestamp: new Date().toISOString()
      });

      const { message, model }: ChatRequest = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!model || !['auto', 'gpt', 'claude', 'llama'].includes(model)) {
        return res.status(400).json({ error: 'Valid model selection is required' });
      }

      console.log('Processing chat request:', { message, model });

      // Get AI response from OpenRouter
      const { content, modelUsed } = await openRouterService.chat(message, model);
      
      // Detect automations based on user input
      const automations = detectAutomations(message);

      const response: ChatResponse = {
        id: randomUUID(),
        content,
        model: modelUsed,
        automations
      };

      console.log('Chat response generated:', { 
        modelUsed, 
        contentLength: content.length,
        automationsCount: automations.length
      });

      res.json(response);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process chat request';
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    try {
      const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        openRouterAvailable: openRouterService && typeof openRouterService.chat === 'function',
        uptime: process.uptime()
      };
      res.json(healthStatus);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ 
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Simple test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Server is running!',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'unknown'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
