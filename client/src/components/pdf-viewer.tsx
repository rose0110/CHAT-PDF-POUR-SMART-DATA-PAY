import { useState, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export interface PdfViewerRef {
  jumpToPage: (pageNumber: number) => void;
}

interface PdfViewerProps {
  url: string;
}

export default forwardRef<PdfViewerRef, PdfViewerProps>(function PdfViewer({ url }, ref) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [error, setError] = useState(false);
  const [viewerInstance, setViewerInstance] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    jumpToPage: (pageNumber: number) => {
      if (viewerInstance) {
        viewerInstance.setCurrentPage(pageNumber - 1); // Les pages commencent à 0
      }
    }
  }));

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
    <Card className="flex-1">
      <div className="h-screen">
        <div className="absolute top-4 right-4 z-50">
          <Button asChild variant="outline" size="sm">
            <a href={url} download>
              <FileDown className="h-4 w-4 mr-2" />
              Télécharger
            </a>
          </Button>
        </div>
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
          <div style={{ height: '100%' }}>
            <Viewer
              fileUrl={url}
              plugins={[defaultLayoutPluginInstance]}
              onError={() => setError(true)}
              ref={(instance) => setViewerInstance(instance)}
            />
          </div>
        </Worker>
      </div>
    </Card>
  );
});