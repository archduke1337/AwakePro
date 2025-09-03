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
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  const chatMutation = useMutation({
    mutationFn: async (request: ChatRequest): Promise<ChatResponse> => {
      try {
        const response = await apiRequest('POST', '/api/chat', request);
        const data = await response.json();
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }
        return data;
      } catch (error) {
        console.error('Chat mutation error:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      if (response && response.content) {
        setResponses(prev => [response, ...prev]);
        setMessage("");
        toast({
          title: "Response received",
          description: `AI response from ${(response.model || 'AI').toUpperCase()} model`,
        });
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    try {
      if (!message?.trim()) {
        toast({
          title: "Error", 
          description: "Please enter a message",
          variant: "destructive",
        });
        return;
      }

      if (!selectedModel) {
        toast({
          title: "Error", 
          description: "Please select an AI model",
          variant: "destructive",
        });
        return;
      }

      chatMutation.mutate({
        message: message.trim(),
        model: selectedModel as 'auto' | 'gpt' | 'claude' | 'llama'
      });
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    }
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
      case 'gpt': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'claude': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'llama': return 'bg-green-50 text-green-700 border border-green-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getAutomationColors = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'task': return 'bg-green-50 text-green-700 border border-green-200';
      case 'slack': return 'bg-purple-50 text-purple-700 border border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-light text-foreground mb-3 slide-down">
            <span className="text-primary float">AWAKE</span>
          </h1>
          <p className="text-muted-foreground text-xl mb-12 fade-in" style={{animationDelay: '0.3s'}}>
            Meta-AI OS Prototype
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="mb-8 scale-in" style={{animationDelay: '0.5s'}}>
          {/* Search Input */}
          <div className="relative mb-6">
            <Textarea
              id="user-input"
              placeholder="Ask me anything..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              data-testid="input-message"
              className="w-full text-lg py-5 px-6 border border-border rounded-full resize-none hover-glow focus:ring-2 focus:ring-primary transition-all duration-500 shadow-sm"
            />
          </div>

          {/* Model Selection and Submit */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            <Select value={selectedModel} onValueChange={setSelectedModel} data-testid="select-model">
              <SelectTrigger className="w-52 hover-glow hover-scale" data-testid="trigger-model-select">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto" data-testid="option-auto">🎲 Auto</SelectItem>
                <SelectItem value="gpt" data-testid="option-gpt">🧠 GPT</SelectItem>
                <SelectItem value="claude" data-testid="option-claude">🤖 Claude</SelectItem>
                <SelectItem value="llama" data-testid="option-llama">🦙 LLaMA</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSubmit}
              disabled={chatMutation.isPending || !message.trim()}
              data-testid="button-submit"
              className="px-10 py-3 btn-primary hover-bounce rounded-full text-lg font-medium"
            >
              {chatMutation.isPending ? (
                <LoadingDots />
              ) : (
                "✨ Search"
              )}
            </Button>
          </div>
        </div>

        {/* Response Section */}
        <div className="space-y-6" data-testid="responses-container">
          {responses.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bounce-in" data-testid="empty-state" style={{animationDelay: '0.8s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 pulse-ring">
                <span className="text-2xl">🤔</span>
              </div>
              <p className="text-muted-foreground text-xl mb-2">Ready when you are!</p>
              <p className="text-muted-foreground text-sm">Ask any question to get started</p>
            </div>
          ) : (
            responses.map((response, index) => (
              <Card key={response.id} className="fade-in hover-lift shadow-lg border-0 bg-gradient-to-br from-white to-gray-50" data-testid={`response-${response.id}`} style={{animationDelay: `${index * 0.2}s`}}>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Response Header */}
                    <div className="flex items-center justify-between mb-6 slide-down">
                      <span 
                        className={`px-4 py-2 text-sm rounded-full font-medium hover-scale ${getModelBadgeColor(response.model)}`}
                        data-testid={`badge-model-${response.id}`}
                      >
                        {response.model.toUpperCase()}
                      </span>
                      <p className="text-sm text-muted-foreground" data-testid={`text-timestamp-${response.id}`}>
                        • Just now
                      </p>
                    </div>

                    {/* Response Content */}
                    <div className="text-foreground leading-relaxed text-lg fade-in" data-testid={`text-content-${response.id}`} style={{animationDelay: '0.2s'}}>
                      <div className="whitespace-pre-wrap">{response.content}</div>
                    </div>

                    {/* Automation Simulations */}
                    {response.automations.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Automated Actions</h4>
                        <div className="flex flex-wrap gap-3">
                          {response.automations.map((automation, index) => (
                            <div 
                              key={index}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover-bounce ${getAutomationColors(automation.type)}`}
                              data-testid={`automation-${automation.type}-${response.id}`}
                              style={{animationDelay: `${index * 0.1 + 0.4}s`}}
                            >
                              <span className="text-lg">{automation.icon}</span>
                              <span>{automation.message}</span>
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

      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 fade-in" style={{animationDelay: '1s'}}>
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Powered by many AIs, fused into one — <span className="font-semibold text-primary glow">AWAKE</span>
          </p>
          <div className="flex justify-center items-center space-x-6 mb-4">
            <div className="flex items-center gap-2 hover-scale">
              <div className={`w-3 h-3 rounded-full pulse-ring ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground font-medium">GPT Online</span>
            </div>
            <div className="flex items-center gap-2 hover-scale">
              <div className={`w-3 h-3 rounded-full pulse-ring ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground font-medium">Claude Online</span>
            </div>
            <div className="flex items-center gap-2 hover-scale">
              <div className={`w-3 h-3 rounded-full pulse-ring ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground font-medium">LLaMA Online</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            🚀 Ready for deployment • ⚡ Powered by OpenRouter
          </div>
        </div>
      </footer>
    </div>
  );
}
