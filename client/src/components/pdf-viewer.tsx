import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const { toast } = useToast();
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1.5);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let pdf: pdfjsLib.PDFDocumentProxy | null = null;

    async function renderPage(pageNum: number) {
      if (!pdf || !canvasRef.current) return;

      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
    }

    async function loadPDF() {
      try {
        setError(false);
        const loadingTask = pdfjsLib.getDocument(url);
        pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);
        await renderPage(currentPage);
      } catch (err) {
        setError(true);
        toast({
          title: "Erreur de chargement",
          description: "Impossible d'afficher le PDF dans le navigateur. Vous pouvez le télécharger pour le visualiser.",
          variant: "destructive"
        });
      }
    }

    loadPDF();

    return () => {
      pdf?.destroy();
    };
  }, [url, scale, currentPage, toast]);

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
        <div className="relative min-h-screen p-4">
          <div className="sticky top-4 right-4 flex justify-end gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setScale(prev => prev + 0.2)}
            >
              Zoom +
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
            >
              Zoom -
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={url} download>
                <FileDown className="h-4 w-4 mr-2" />
                Télécharger
              </a>
            </Button>
          </div>
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="shadow-lg" />
          </div>
          {numPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Page précédente
              </Button>
              <span className="py-2">
                Page {currentPage} sur {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
              >
                Page suivante
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}