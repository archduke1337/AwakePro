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
      <header className="py-6 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-normal text-foreground mb-2 fade-in">
            <span className="text-primary">AWAKE</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 fade-in">
            Meta-AI OS Prototype
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="mb-8">
          {/* Search Input */}
          <div className="relative mb-6">
            <Textarea
              id="user-input"
              placeholder="Ask me anything..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              data-testid="input-message"
              className="w-full text-lg py-4 px-6 border border-border rounded-full resize-none hover-glow focus:ring-2 focus:ring-primary transition-all duration-300 shadow-sm"
            />
          </div>

          {/* Model Selection and Submit */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Select value={selectedModel} onValueChange={setSelectedModel} data-testid="select-model">
              <SelectTrigger className="w-48 hover-glow" data-testid="trigger-model-select">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto" data-testid="option-auto">Auto</SelectItem>
                <SelectItem value="gpt" data-testid="option-gpt">GPT</SelectItem>
                <SelectItem value="claude" data-testid="option-claude">Claude</SelectItem>
                <SelectItem value="llama" data-testid="option-llama">LLaMA</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSubmit}
              disabled={chatMutation.isPending || !message.trim()}
              data-testid="button-submit"
              className="px-8 py-2 btn-primary hover-scale rounded-full"
            >
              {chatMutation.isPending ? (
                <LoadingDots />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>

        {/* Response Section */}
        <div className="space-y-6" data-testid="responses-container">
          {responses.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 fade-in" data-testid="empty-state">
              <p className="text-muted-foreground text-lg">Ask any question to get started</p>
            </div>
          ) : (
            responses.map((response, index) => (
              <Card key={response.id} className="fade-in hover-lift shadow-sm" data-testid={`response-${response.id}`} style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Response Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span 
                        className={`px-3 py-1 text-xs rounded-full font-medium ${getModelBadgeColor(response.model)}`}
                        data-testid={`badge-model-${response.id}`}
                      >
                        {response.model.toUpperCase()}
                      </span>
                      <p className="text-xs text-muted-foreground" data-testid={`text-timestamp-${response.id}`}>
                        Just now
                      </p>
                    </div>

                    {/* Response Content */}
                    <div className="text-foreground leading-relaxed" data-testid={`text-content-${response.id}`}>
                      <div className="whitespace-pre-wrap">{response.content}</div>
                    </div>

                    {/* Automation Simulations */}
                    {response.automations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex flex-wrap gap-2">
                          {response.automations.map((automation, index) => (
                            <div 
                              key={index}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getAutomationColors(automation.type)}`}
                              data-testid={`automation-${automation.type}-${response.id}`}
                            >
                              <span>{automation.icon}</span>
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
      <footer className="mt-16 py-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Powered by many AIs, fused into one — <span className="font-medium text-primary">AWAKE</span>
          </p>
          <div className="flex justify-center items-center space-x-4">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">GPT</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">Claude</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${healthCheck ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">LLaMA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
