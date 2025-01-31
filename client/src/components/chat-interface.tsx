import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { chatWithPDF, type Citation } from '@/lib/chatpdf';
import { useToast } from '@/hooks/use-toast';
import type { PdfViewerRef } from './pdf-viewer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

interface Paragraph {
  text: string;
  page: number;
  index: number;
}

interface ChatInterfaceProps {
  sourceId: string;
  enabled: boolean;
  pdfViewerRef: React.RefObject<PdfViewerRef>;
}

export default function ChatInterface({ sourceId, enabled, pdfViewerRef }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      return chatWithPDF(
        sourceId,
        question,
        messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      );
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

  const handleParagraphClick = (pageNumber: number) => {
    if (pdfViewerRef.current) {
      pdfViewerRef.current.jumpToPage(pageNumber);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-screen flex flex-col">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold" style={{ color: '#42D80F' }}>Chat avec le PDF</h2>
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
                    ? 'bg-[#42D80F] text-white'
                    : 'bg-muted'
                }`}
              >
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => {
                      if (href?.startsWith('#p-')) {
                        const pageNumber = parseInt(href.replace('#p-', ''));
                        if (!isNaN(pageNumber)) {
                          return (
                            <button
                              onClick={() => handleParagraphClick(pageNumber)}
                              className="text-blue-500 hover:text-blue-700 underline cursor-pointer inline-flex items-center gap-1"
                            >
                              {children}
                            </button>
                          );
                        }
                      }
                      return <a href={href}>{children}</a>;
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-[#42D80F]/20 pl-4 italic my-2">
                        {children}
                      </blockquote>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#42D80F' }} />
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
            className="focus-visible:ring-[#42D80F]"
          />
          <Button 
            type="submit" 
            disabled={!enabled || mutation.isPending}
            className="min-w-[40px] bg-[#42D80F] hover:bg-[#42D80F]/90"
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