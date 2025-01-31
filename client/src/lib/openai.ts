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

function findRelevantParagraphs(question: string, paragraphs: Array<{ text: string; page: number }>, maxParagraphs = 5): Array<{ text: string; page: number }> {
  // Convertir la question en minuscules pour la comparaison
  const questionTerms = question.toLowerCase().split(/\s+/);

  // Calculer un score de pertinence pour chaque paragraphe
  const scoredParagraphs = paragraphs.map(paragraph => {
    const text = paragraph.text.toLowerCase();
    // Compter combien de termes de la question apparaissent dans le paragraphe
    const matchingTerms = questionTerms.filter(term => text.includes(term));
    return {
      ...paragraph,
      score: matchingTerms.length / questionTerms.length
    };
  });

  // Trier par score et prendre les N paragraphes les plus pertinents
  return scoredParagraphs
    .sort((a, b) => b.score - a.score)
    .slice(0, maxParagraphs)
    .map(({ text, page }) => ({ text, page }));
}

export async function analyzeDocument(
  question: string,
  pdfText: string,
  previousMessages: Message[],
  paragraphs: Array<{ text: string; page: number }>
): Promise<OpenAIResponse> {
  // Sélectionner les paragraphes les plus pertinents
  const relevantParagraphs = findRelevantParagraphs(question, paragraphs);

  const messages = [
    {
      role: "system",
      content: `Tu es un assistant spécialisé dans l'analyse de documents PDF.
                Voici les extraits pertinents du PDF pour répondre à la question :
                ${relevantParagraphs.map(p => `[Page ${p.page}] : ${p.text}`).join('\n\n')}

                Règles à suivre :
                1. Utilise uniquement les informations des extraits fournis
                2. Si la réponse n'est pas dans les extraits, dis-le clairement
                3. Cite les passages pertinents en indiquant les numéros de page
                4. Format des citations : "page X: [texte cité]"
                5. Sois concis et précis dans tes réponses`
    },
    ...previousMessages.slice(-3), // Garder seulement les 3 derniers messages pour le contexte
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
        model: "gpt-4",
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