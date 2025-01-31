import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Citation {
  text: string;
  page: number;
}

interface ChatPDFResponse {
  content: string;
  references?: Array<{ pageNumber: number }>;
}

// Fonction pour uploader un PDF à ChatPDF
export async function uploadPdfToChatPDF(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_CHATPDF_API_KEY;
  if (!apiKey) {
    throw new Error('Clé API ChatPDF non configurée. Veuillez contacter l\'administrateur.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://api.chatpdf.com/v1/sources/add-file', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur ChatPDF:', errorData);
      throw new Error(`Erreur lors de l'upload vers ChatPDF: ${response.status}`);
    }

    const data = await response.json();
    return data.sourceId;
  } catch (error) {
    console.error('Erreur complète:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Impossible de contacter le serveur ChatPDF. Vérifiez votre connexion.');
    }
    throw error;
  }
}

export async function chatWithPDF(
  sourceId: string,
  question: string,
  previousMessages: Message[]
): Promise<{ content: string; citations: Citation[] }> {
  const apiKey = import.meta.env.VITE_CHATPDF_API_KEY;
  if (!apiKey) {
    throw new Error('Clé API ChatPDF non configurée');
  }

  const messages = [
    ...previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user',
      content: question
    }
  ];

  try {
    const response = await fetch('https://api.chatpdf.com/v1/chats/message', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sourceId,
        messages,
        referenceSources: true // Activer les références aux pages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur ChatPDF:', errorData);
      throw new Error(`Erreur lors de la communication avec ChatPDF: ${response.status}`);
    }

    const data: ChatPDFResponse = await response.json();

    // Conversion du format ChatPDF vers notre format de citations
    const citations: Citation[] = data.references?.map(ref => ({
      page: ref.pageNumber,
      text: extractCitationText(data.content, ref.pageNumber)
    })) || [];

    return {
      content: data.content,
      citations
    };
  } catch (error) {
    console.error('Erreur complète:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Impossible de contacter le serveur ChatPDF. Vérifiez votre connexion.');
    }
    throw error;
  }
}

// Fonction utilitaire pour extraire le texte cité d'une page spécifique
function extractCitationText(content: string, pageNumber: number): string {
  const regex = new RegExp(`\\[P${pageNumber}\\]([^\\[]*)`);
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

// Nettoyer les ressources quand on a fini
export async function deletePdfFromChatPDF(sourceId: string): Promise<void> {
  const apiKey = import.meta.env.VITE_CHATPDF_API_KEY;
  if (!apiKey) {
    throw new Error('Clé API ChatPDF non configurée');
  }

  try {
    const response = await fetch('https://api.chatpdf.com/v1/sources/delete', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sources: [sourceId]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur ChatPDF:', errorData);
      throw new Error(`Erreur lors de la suppression du PDF: ${response.status}`);
    }
  } catch (error) {
    console.error('Erreur complète:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Impossible de contacter le serveur ChatPDF. Vérifiez votre connexion.');
    }
    throw error;
  }
}