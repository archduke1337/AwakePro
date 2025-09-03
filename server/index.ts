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

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    vercel: process.env.VERCEL ? 'yes' : 'no'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple chat endpoint (without OpenRouter for now)
app.post('/api/chat', (req, res) => {
  try {
    const { message, model } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Return a simple response for now
    res.json({
      id: Date.now().toString(),
      content: `Echo: ${message}`,
      model: model || 'echo',
      automations: []
    });
  } catch (error) {
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
    PORT: port
  });
});
