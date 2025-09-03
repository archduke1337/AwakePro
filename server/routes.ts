import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { OpenRouterService } from "./services/openrouter";
import type { ChatRequest, ChatResponse, AutomationAction } from "@shared/types";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const openRouterService = new OpenRouterService();

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
      const { message, model }: ChatRequest = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!model || !['auto', 'gpt', 'claude', 'llama'].includes(model)) {
        return res.status(400).json({ error: 'Valid model selection is required' });
      }

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

      res.json(response);
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to process chat request'
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
