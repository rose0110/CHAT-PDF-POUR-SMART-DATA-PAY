import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import PdfViewer, { PdfViewerRef } from "@/components/pdf-viewer";
import ChatInterface from "@/components/chat-interface";
import { useState, useRef } from "react";
import FileUpload from "@/components/file-upload";
import { Card } from "@/components/ui/card";

interface Paragraph {
  text: string;
  page: number;
  index: number;
}

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const pdfViewerRef = useRef<PdfViewerRef>(null);

  return (
    <div className="h-screen w-full bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-screen p-4 flex flex-col gap-4">
            <FileUpload onFileUpload={(url, text, newParagraphs) => {
              setPdfUrl(url);
              setPdfText(text);
              setParagraphs(newParagraphs);
            }} />
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
            pdfText={pdfText} 
            paragraphs={paragraphs}
            enabled={!!pdfUrl}
            pdfViewerRef={pdfViewerRef}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}