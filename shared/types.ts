export interface ChatMessage {
  id: string;
  model: string;
  content: string;
  timestamp: Date;
  automations: AutomationAction[];
}

export interface AutomationAction {
  type: 'email' | 'task' | 'slack';
  message: string;
  icon: string;
}

export interface ChatRequest {
  message: string;
  model: 'auto' | 'gpt' | 'claude' | 'llama';
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  automations: AutomationAction[];
}
