import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { analyzeDocument, type Citation } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';
import type { PdfViewerRef } from './pdf-viewer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface ChatInterfaceProps {
  pdfText: string;
  enabled: boolean;
  pdfViewerRef: React.RefObject<PdfViewerRef>;
}

export default function ChatInterface({ pdfText, enabled, pdfViewerRef }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      return analyzeDocument(question, pdfText, messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { 
          role: 'assistant', 
          content: data.content,
          citations: data.citations
        }
      ]);
      setInput('');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !enabled || mutation.isPending) return;
    mutation.mutate(input);
  };

  const handleCitationClick = (page: number) => {
    if (pdfViewerRef.current) {
      pdfViewerRef.current.jumpToPage(page);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-screen flex flex-col">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">Chat avec le PDF</h2>
        <p className="text-sm text-muted-foreground">
          Posez des questions sur le contenu du document
        </p>
      </div>

      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4"
      >
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 text-sm space-y-1">
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      Sources :
                    </p>
                    {message.citations.map((citation, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCitationClick(citation.page)}
                        className="text-blue-500 hover:text-blue-700 underline cursor-pointer block text-left"
                      >
                        Voir la source (page {citation.page})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>L'assistant réfléchit...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={enabled ? "Posez votre question..." : "Chargez un PDF d'abord"}
            disabled={!enabled || mutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={!enabled || mutation.isPending}
            className="min-w-[40px]"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}