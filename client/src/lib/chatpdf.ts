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
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.chatpdf.com/sources/add-file', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_CHATPDF_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'upload du fichier vers ChatPDF');
  }

  const data = await response.json();
  return data.sourceId;
}

export async function chatWithPDF(
  sourceId: string,
  question: string,
  previousMessages: Message[]
): Promise<{ content: string; citations: Citation[] }> {
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

  const response = await fetch('https://api.chatpdf.com/chats/message', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_CHATPDF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sourceId,
      messages,
      referenceSources: true // Activer les références aux pages
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur ChatPDF: ${error}`);
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
}

// Fonction utilitaire pour extraire le texte cité d'une page spécifique
function extractCitationText(content: string, pageNumber: number): string {
  const regex = new RegExp(`\\[P${pageNumber}\\]([^\\[]*)`);
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

// Nettoyer les ressources quand on a fini
export async function deletePdfFromChatPDF(sourceId: string): Promise<void> {
  await fetch('https://api.chatpdf.com/sources/delete', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_CHATPDF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sources: [sourceId]
    })
  });
}
