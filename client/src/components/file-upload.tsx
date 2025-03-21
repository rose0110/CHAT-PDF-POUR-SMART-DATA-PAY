import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromPdf } from '@/lib/pdf-utils';
import { uploadPdfToChatPDF } from '@/lib/chatpdf';

interface FileUploadProps {
  onFileUpload: (url: string, sourceId: string, text: string, paragraphs: Array<{ text: string; page: number; index: number }>) => void;
}

// Taille maximale du fichier en Mo
const MAX_FILE_SIZE = 5;

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (file.type !== 'application/pdf') {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez télécharger un fichier PDF",
        variant: "destructive"
      });
      return;
    }

    // Vérification de la taille du fichier
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > MAX_FILE_SIZE) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille du fichier doit être inférieure à ${MAX_FILE_SIZE} Mo`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload le fichier pour la visualisation
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const data = await response.json();

      // Upload vers ChatPDF
      const sourceId = await uploadPdfToChatPDF(file);

      // Extraction du texte pour la visualisation
      const { text, paragraphs } = await extractTextFromPdf(data.url);

      onFileUpload(data.url, sourceId, text, paragraphs);

      toast({
        title: "PDF téléchargé avec succès",
        description: "Le document est prêt pour l'analyse",
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger ou d'extraire le texte du PDF",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <Button asChild>
        <label className="cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Télécharger un PDF (max {MAX_FILE_SIZE} Mo)
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