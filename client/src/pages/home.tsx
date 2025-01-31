import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import PdfViewer, { PdfViewerRef } from "@/components/pdf-viewer";
import ChatInterface from "@/components/chat-interface";
import { useState, useRef, useEffect } from "react";
import FileUpload from "@/components/file-upload";
import { Card } from "@/components/ui/card";
import GDPRBanner from "@/components/gdpr-banner";
import { deletePdfFromChatPDF } from "@/lib/chatpdf";

interface Paragraph {
  text: string;
  page: number;
  index: number;
}

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [sourceId, setSourceId] = useState<string>("");
  const pdfViewerRef = useRef<PdfViewerRef>(null);

  // Nettoyer les ressources quand l'utilisateur quitte la page
  useEffect(() => {
    const cleanup = async () => {
      if (sourceId) {
        try {
          await deletePdfFromChatPDF(sourceId);
        } catch (error) {
          console.error('Erreur lors du nettoyage:', error);
        }
      }
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [sourceId]);

  // Nettoyer l'ancien PDF quand un nouveau est chargé
  const handleFileUpload = async (url: string, newSourceId: string, text: string, newParagraphs: Paragraph[]) => {
    if (sourceId) {
      try {
        await deletePdfFromChatPDF(sourceId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'ancien PDF:', error);
      }
    }

    setPdfUrl(url);
    setSourceId(newSourceId);
    setPdfText(text);
    setParagraphs(newParagraphs);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <GDPRBanner />
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 flex flex-col gap-4">
              <FileUpload onFileUpload={handleFileUpload} />
              {pdfUrl ? (
                <PdfViewer url={pdfUrl} ref={pdfViewerRef} />
              ) : (
                <Card className="flex-1 flex items-center justify-center text-muted-foreground">
                  Chargez un PDF pour commencer
                </Card>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <ChatInterface 
              sourceId={sourceId}
              enabled={!!pdfUrl}
              pdfViewerRef={pdfViewerRef}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}