import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (url: string, text: string) => void;
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
      const url = URL.createObjectURL(file);
      // Pour l'instant, on envoie juste le texte vide car nous n'utilisons plus pdfjsLib ici
      onFileUpload(url, '');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le fichier PDF",
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