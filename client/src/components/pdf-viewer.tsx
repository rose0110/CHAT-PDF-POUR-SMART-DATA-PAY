import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface PdfViewerProps {
  url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const { toast } = useToast();
  const [error, setError] = useState(false);

  if (error) {
    return (
      <Card className="flex-1 flex items-center justify-center flex-col gap-4 p-4">
        <p className="text-destructive">Erreur lors du chargement du PDF</p>
        <Button asChild variant="outline">
          <a href={url} download>
            <FileDown className="h-4 w-4 mr-2" />
            Télécharger le PDF
          </a>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="relative min-h-screen">
          <div className="sticky top-4 right-4 flex justify-end gap-2 p-4 bg-background/80 backdrop-blur z-10">
            <Button asChild variant="outline" size="sm">
              <a href={url} download>
                <FileDown className="h-4 w-4 mr-2" />
                Télécharger
              </a>
            </Button>
          </div>
          <object
            data={url}
            type="application/pdf"
            className="w-full h-screen"
            onError={() => {
              setError(true);
              toast({
                title: "Erreur de chargement",
                description: "Impossible d'afficher le PDF dans le navigateur. Vous pouvez le télécharger pour le visualiser.",
                variant: "destructive"
              });
            }}
          >
            <p>Votre navigateur ne peut pas afficher le PDF directement. 
              <Button asChild variant="link" className="px-2">
                <a href={url} download>Cliquez ici pour le télécharger</a>
              </Button>
            </p>
          </object>
        </div>
      </ScrollArea>
    </Card>
  );
}