import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configurer le worker PDF.js
const pdfWorkerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface PdfViewerProps {
  url: string;
}

interface PageContent {
  text: string;
  pageNumber: number;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const { toast } = useToast();
  const [error, setError] = useState(false);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPDF() {
      try {
        setLoading(true);
        setError(false);

        // Charger le PDF
        const loadingTask = pdfjsLib.getDocument({
          url: url,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        const pagesContent: PageContent[] = [];

        // Extraire le texte de chaque page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');

          pagesContent.push({
            text: pageText,
            pageNumber: i
          });
        }

        setPages(pagesContent);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(true);
        setLoading(false);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger le contenu du PDF. Vous pouvez le télécharger pour le visualiser.",
          variant: "destructive"
        });
      }
    }

    loadPDF();
  }, [url, toast]);

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

  if (loading) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <p>Chargement du PDF...</p>
      </Card>
    );
  }

  return (
    <Card className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="relative">
          <div className="sticky top-4 right-4 flex justify-end gap-2 p-4 bg-background/80 backdrop-blur z-10">
            <Button asChild variant="outline" size="sm">
              <a href={url} download>
                <FileDown className="h-4 w-4 mr-2" />
                Télécharger
              </a>
            </Button>
          </div>
          <div className="p-6 space-y-8">
            {pages.map((page) => (
              <div key={page.pageNumber} className="prose max-w-none">
                <h2 className="text-lg font-semibold mb-4">Page {page.pageNumber}</h2>
                <div className="whitespace-pre-wrap">{page.text}</div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}