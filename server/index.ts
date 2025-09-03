import express, { type Request, Response, NextFunction } from "express";

// Vercel deployment fix - simplified server without complex imports
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// OpenRouter AI Service (simplified)
class SimpleOpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.error('OpenRouter API key not found');
    } else {
      console.log('OpenRouter service initialized');
    }
  }

  async chat(message: string, model: string): Promise<{ content: string; modelUsed: string }> {
    if (!this.apiKey) {
      return {
        content: 'API key not configured. Please check your environment variables.',
        modelUsed: 'error'
      };
    }

    try {
      const modelMapping: Record<string, string> = {
        'gpt': 'openai/gpt-4o',
        'claude': 'anthropic/claude-3.5-sonnet',
        'llama': 'meta-llama/llama-3.1-70b-instruct',
        'auto': 'openai/gpt-4o'
      };

      const openRouterModel = modelMapping[model] || modelMapping['auto'];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000',
          'X-Title': 'AWAKE Meta-AI OS'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices?.[0]?.message?.content || 'No response generated',
        modelUsed: model
      };
    } catch (error) {
      console.error('OpenRouter error:', error);
      return {
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get AI response'}`,
        modelUsed: model
      };
    }
  }
}

// Initialize AI service
const aiService = new SimpleOpenRouterService();

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    vercel: process.env.VERCEL ? 'yes' : 'no',
    openRouterAvailable: !!process.env.OPENROUTER_API_KEY
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// AI Chat endpoint with OpenRouter
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Chat request:', { message, model });

    // Get AI response
    const { content, modelUsed } = await aiService.chat(message, model || 'auto');

    // Detect automations based on keywords
    const automations = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('email')) {
      automations.push({ type: 'email', message: 'Action simulated: Email sent!', icon: '📧' });
    }
    if (lowerMessage.includes('task')) {
      automations.push({ type: 'task', message: 'Action simulated: Jira task created!', icon: '✅' });
    }
    if (lowerMessage.includes('slack')) {
      automations.push({ type: 'slack', message: 'Action simulated: Slack message posted!', icon: '💬' });
    }

    const response = {
      id: Date.now().toString(),
      content,
      model: modelUsed,
      automations
    };

    console.log('Chat response:', { modelUsed, contentLength: content.length });
    res.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = parseInt(process.env.PORT || '5000', 10);
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server started on port ${port}`);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? 'YES' : 'NO',
    PORT: port,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET'
  });
});
