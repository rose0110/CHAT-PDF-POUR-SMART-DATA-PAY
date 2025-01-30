import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';

interface FileUploadProps {
  onFileUpload: (url: string, text: string) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const pdf = await pdfjsLib.getDocument(url).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + ' ';
      }

      onFileUpload(url, fullText);
    } catch (error) {
      toast({
        title: "Error loading PDF",
        description: "There was an error loading your PDF file",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <Button asChild>
        <label className="cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Upload PDF
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </label>
      </Button>
    </div>
  );
}
