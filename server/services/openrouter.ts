interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  model: string;
}

const MODEL_MAPPINGS = {
  gpt: 'openai/gpt-4o',
  claude: 'anthropic/claude-3.5-sonnet',
  llama: 'meta-llama/llama-3.1-70b-instruct',
};

const AVAILABLE_MODELS = Object.keys(MODEL_MAPPINGS) as Array<keyof typeof MODEL_MAPPINGS>;

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    // Check for the correct environment variable
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    
    if (!this.apiKey) {
      console.error('OpenRouter API key not found. Available env vars:', {
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL ? 'YES' : 'NO'
      });
      throw new Error('OpenRouter API key is required. Please check your environment variables.');
    }
    
    console.log('OpenRouter service initialized successfully');
  }

  async chat(message: string, model: string): Promise<{ content: string; modelUsed: string }> {
    try {
      let selectedModel = model;
      
      // Handle auto selection
      if (model === 'auto') {
        const randomIndex = Math.floor(Math.random() * AVAILABLE_MODELS.length);
        selectedModel = AVAILABLE_MODELS[randomIndex];
      }

      const openRouterModel = MODEL_MAPPINGS[selectedModel as keyof typeof MODEL_MAPPINGS];
      
      if (!openRouterModel) {
        throw new Error(`Unsupported model: ${selectedModel}`);
      }

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
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        modelUsed: selectedModel
      };
      
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
