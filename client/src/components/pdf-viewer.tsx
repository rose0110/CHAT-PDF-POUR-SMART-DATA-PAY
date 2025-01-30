import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface PdfViewerProps {
  url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const { toast } = useToast();
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  if (error) {
    return (
      <Card className="flex-1 flex items-center justify-center text-destructive">
        Erreur lors du chargement du PDF
      </Card>
    );
  }

  return (
    <Card className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <iframe
          src={url}
          className="w-full h-screen border-0"
          onError={() => {
            setError(true);
            toast({
              title: "Erreur de chargement",
              description: "Impossible de charger le PDF. Veuillez réessayer.",
              variant: "destructive"
            });
          }}
        />
      </ScrollArea>
    </Card>
  );
}