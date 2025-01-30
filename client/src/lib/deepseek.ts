interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Citation {
  text: string;
  page: number;
}

interface DeepSeekResponse {
  content: string;
  citations: Citation[];
}

export async function analyzeDocument(
  question: string,
  pdfText: string,
  previousMessages: Message[]
): Promise<DeepSeekResponse> {
  const messages = [
    {
      role: "system",
      content: `Tu es un assistant spécialisé dans l'analyse de documents PDF.
                Voici le contenu du PDF : ${pdfText}
                
                Règles à suivre :
                1. Utilise uniquement les informations du PDF fourni
                2. Si la réponse n'est pas dans le PDF, dis-le clairement
                3. Cite les passages pertinents du PDF en indiquant les numéros de page
                4. Format des citations : "page X: [texte cité]"`
    },
    ...previousMessages,
    {
      role: "user",
      content: question
    }
  ];

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.2,
      max_tokens: 1000,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la communication avec l\'API DeepSeek');
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
}
