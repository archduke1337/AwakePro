import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingDots } from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ChatRequest, ChatResponse } from "@shared/types";

export default function Home() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("auto");
  const [responses, setResponses] = useState<ChatResponse[]>([]);
  const { toast } = useToast();

  // Health check query to verify API connectivity
  const { data: healthCheck } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 30000,
    retry: false
  });

  const chatMutation = useMutation({
    mutationFn: async (request: ChatRequest): Promise<ChatResponse> => {
      const response = await apiRequest('POST', '/api/chat', request);
      return response.json();
    },
    onSuccess: (response) => {
      setResponses(prev => [response, ...prev]);
      setMessage("");
      toast({
        title: "Response received",
        description: `AI response from ${response.model.toUpperCase()} model`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!message.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    chatMutation.mutate({
      message: message.trim(),
      model: selectedModel as 'auto' | 'gpt' | 'claude' | 'llama'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return date.toLocaleTimeString();
  };

  const getModelBadgeColor = (model: string) => {
    switch (model) {
      case 'gpt': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'claude': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'llama': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getAutomationColors = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
      case 'task': return 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300';
      case 'slack': return 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card gradient-card slide-up">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-foreground tracking-tight fade-in">
              <span className="text-primary glow-pulse">AWAKE</span>{" "}
              <span className="text-muted-foreground font-normal">– Meta-AI OS Prototype</span>
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-sm mt-2 fade-in">
            Your unified AI assistant powered by multiple language models
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <Card className="mb-6 hover-lift gradient-card scale-in">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Model Selection */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <label htmlFor="model-select" className="text-sm font-medium text-foreground whitespace-nowrap">
                  AI Model:
                </label>
                <Select value={selectedModel} onValueChange={setSelectedModel} data-testid="select-model">
                  <SelectTrigger className="flex-1 hover-glow" data-testid="trigger-model-select">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto" data-testid="option-auto">Auto (Random Selection)</SelectItem>
                    <SelectItem value="gpt" data-testid="option-gpt">GPT</SelectItem>
                    <SelectItem value="claude" data-testid="option-claude">Claude</SelectItem>
                    <SelectItem value="llama" data-testid="option-llama">LLaMA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label htmlFor="user-input" className="text-sm font-medium text-foreground">
                  Ask anything:
                </label>
                <Textarea
                  id="user-input"
                  placeholder="What would you like to know? Type your question here..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  data-testid="input-message"
                  className="resize-none hover-glow focus:ring-2 focus:ring-primary transition-all duration-300"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit}
                  disabled={chatMutation.isPending || !message.trim()}
                  data-testid="button-submit"
                  className="px-6 py-2 btn-primary hover-scale"
                >
                  {chatMutation.isPending ? (
                    <LoadingDots />
                  ) : (
                    "Ask AWAKE"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Section */}
        <div className="space-y-4" data-testid="responses-container">
          {responses.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 fade-in" data-testid="empty-state">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 hover-scale glow-pulse">
                <span className="text-2xl text-muted-foreground">🤖</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Ready to assist you</h3>
              <p className="text-muted-foreground">Ask any question and let AWAKE's AI ensemble provide you with comprehensive answers.</p>
            </div>
          ) : (
            responses.map((response, index) => (
              <Card key={response.id} className="fade-in hover-lift gradient-card" data-testid={`response-${response.id}`} style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Response Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center glow-pulse hover-scale">
                          <span className="text-primary-foreground text-sm font-semibold">AI</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground" data-testid={`text-model-${response.id}`}>
                            {response.model.toUpperCase()} Response
                          </h3>
                          <p className="text-xs text-muted-foreground" data-testid={`text-timestamp-${response.id}`}>
                            Just now
                          </p>
                        </div>
                      </div>
                      <span 
                        className={`px-2 py-1 text-xs rounded-md font-medium hover-scale ${getModelBadgeColor(response.model)}`}
                        data-testid={`badge-model-${response.id}`}
                      >
                        {response.model.toUpperCase()}
                      </span>
                    </div>

                    {/* Response Content */}
                    <div className="prose prose-sm max-w-none text-foreground" data-testid={`text-content-${response.id}`}>
                      <div className="whitespace-pre-wrap">{response.content}</div>
                    </div>

                    {/* Automation Simulations */}
                    {response.automations.length > 0 && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-border">
                        <h4 className="text-sm font-medium text-foreground">Automated Actions</h4>
                        <div className="space-y-2">
                          {response.automations.map((automation, index) => (
                            <div 
                              key={index}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md hover-scale ${getAutomationColors(automation.type)}`}
                              data-testid={`automation-${automation.type}-${response.id}`}
                            >
                              <span className="text-lg">{automation.icon}</span>
                              <span className="text-sm">{automation.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8 slide-up">
          <Card className="text-center hover-lift gradient-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary" data-testid="stat-total-queries">{responses.length}</div>
              <div className="text-sm text-muted-foreground">Total Queries</div>
            </CardContent>
          </Card>
          <Card className="text-center hover-lift gradient-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary" data-testid="stat-automations">
                {responses.reduce((total, response) => total + response.automations.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Automations Triggered</div>
            </CardContent>
          </Card>
          <Card className="text-center hover-lift gradient-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary" data-testid="stat-models">4</div>
              <div className="text-sm text-muted-foreground">AI Models Available</div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card gradient-card mt-16 slide-up">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tagline */}
          <div className="text-center mb-6">
            <p className="text-lg text-muted-foreground italic">
              Powered by many AIs, fused into one — <span className="font-semibold text-primary">AWAKE</span>
            </p>
          </div>

          {/* Model Status Indicators */}
          <div className="flex justify-center items-center space-x-6 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full status-online ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">GPT Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full status-online ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">Claude Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full status-online ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">LLaMA Online</span>
            </div>
          </div>

          {/* Automation Hub Status */}
          <Card className="bg-muted hover-lift glass-effect">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-foreground mb-3 text-center">Automation Hub Status</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-lg">📧</div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">Active</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg">✅</div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">Active</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg">💬</div>
                  <div className="text-xs text-muted-foreground">Slack</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="text-center mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Built with React • Powered by OpenRouter API • Ready for Replit
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
