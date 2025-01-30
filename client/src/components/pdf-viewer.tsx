import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea } from '@/components/ui/scroll-area';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (!canvasRef.current) return;

      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const container = canvasRef.current;
        container.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

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
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [url]);

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
