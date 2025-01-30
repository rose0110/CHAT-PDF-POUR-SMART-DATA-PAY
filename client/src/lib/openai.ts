interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Citation {
  text: string;
  page: number;
}

interface OpenAIResponse {
  content: string;
  citations: Citation[];
}

export async function analyzeDocument(
  question: string,
  pdfText: string,
  previousMessages: Message[]
): Promise<OpenAIResponse> {
  const messages = [
    {
      role: "system",
      content: `Tu es un assistant spécialisé dans l'analyse de documents PDF.
                Voici le contenu du PDF : ${pdfText}

                Règles à suivre :
                1. Utilise uniquement les informations du PDF fourni
                2. Si la réponse n'est pas dans le PDF, dis-le clairement
                3. Cite les passages pertinents du PDF en indiquant les numéros de page
                4. Format des citations : "page X: [texte cité]"
                5. Sois concis et précis dans tes réponses`
    },
    ...previousMessages,
    {
      role: "user",
      content: question
    }
  ];

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API OpenAI n\'est pas configurée. Veuillez contacter l\'administrateur.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.2,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Réponse OpenAI:', errorText);

      if (response.status === 401) {
        throw new Error('La clé API OpenAI est invalide ou expirée. Veuillez vérifier votre configuration.');
      }

      throw new Error(`Erreur lors de la communication avec l'API OpenAI (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extraction des citations avec leurs numéros de page
    const citations: Citation[] = [];
    const citationRegex = /page\s*(\d+)\s*:\s*([^]*?)(?=page\s*\d+:|$)/gi;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      citations.push({
        page: parseInt(match[1]),
        text: match[2].trim()
      });
    }

    return {
      content: content,
      citations
    };
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Une erreur est survenue lors de la communication avec l'API"
    );
  }
}