import { useEffect, useState } from 'react';
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
        <object
          data={url}
          type="application/pdf"
          className="w-full h-screen"
          onError={() => {
            setError(true);
            toast({
              title: "Erreur de chargement",
              description: "Impossible de charger le PDF. Veuillez réessayer.",
              variant: "destructive"
            });
          }}
        >
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            <p>Si le PDF ne s'affiche pas, <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary">cliquez ici pour l'ouvrir</a></p>
          </div>
        </object>
      </ScrollArea>
    </Card>
  );
}