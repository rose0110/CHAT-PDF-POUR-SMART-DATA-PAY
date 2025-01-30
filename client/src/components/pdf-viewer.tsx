import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Configuration du worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js';

interface PdfViewerProps {
  url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPdf = async () => {
      if (!canvasRef.current) return;

      try {
        console.log('Chargement du PDF:', url);
        const loadingTask = pdfjsLib.getDocument(url);

        loadingTask.onProgress = (progress) => {
          console.log('Progression:', Math.round(progress.loaded / progress.total * 100), '%');
        };

        const pdf = await loadingTask.promise;
        console.log('PDF chargé avec succès, nombre de pages:', pdf.numPages);

        const container = canvasRef.current;
        container.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            console.error('Impossible d\'obtenir le contexte 2D pour la page', pageNum);
            continue;
          }

          const viewport = page.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.marginBottom = '20px';

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          container.appendChild(canvas);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du PDF:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger le PDF. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    };

    loadPdf();
  }, [url, toast]);

  return (
    <Card className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4">
          <div ref={canvasRef} className="flex flex-col items-center" />
        </div>
      </ScrollArea>
    </Card>
  );
}