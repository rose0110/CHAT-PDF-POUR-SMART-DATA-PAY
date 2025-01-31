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

function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findRelevantParagraphs(
  question: string,
  paragraphs: Array<{ text: string; page: number }>,
): Array<{ text: string; page: number }> {
  // Normaliser la question
  const normalizedQuestion = normalizeText(question);
  const questionWords = normalizedQuestion.split(/\s+/)
    .filter(word => word.length > 2); // Ignorer les mots très courts

  // Phase 1: Identifier les paragraphes directement pertinents
  const primaryMatches = paragraphs
    .map((paragraph, index) => ({
      ...paragraph,
      index,
      matches: questionWords.filter(word => 
        normalizeText(paragraph.text).includes(word)
      ).length
    }))
    .filter(p => p.matches > 0)
    .sort((a, b) => b.matches - a.matches);

  if (primaryMatches.length === 0) {
    // Si aucun match direct, retourner un petit échantillon du début du document
    return paragraphs.slice(0, 3);
  }

  // Phase 2: Sélectionner les paragraphes les plus pertinents et leur contexte
  const selectedIndexes = new Set<number>();

  // Ajouter les meilleurs matches (max 3)
  primaryMatches.slice(0, 3).forEach(match => {
    selectedIndexes.add(match.index);
    // Ajouter un paragraphe avant et après pour le contexte
    if (match.index > 0) selectedIndexes.add(match.index - 1);
    if (match.index < paragraphs.length - 1) selectedIndexes.add(match.index + 1);
  });

  // Convertir les indices en paragraphes, en préservant l'ordre original
  return Array.from(selectedIndexes)
    .sort((a, b) => a - b)
    .map(index => paragraphs[index]);
}

export async function analyzeDocument(
  question: string,
  pdfText: string,
  previousMessages: Message[],
  paragraphs: Array<{ text: string; page: number }>
): Promise<OpenAIResponse> {
  // Sélectionner les paragraphes pertinents avec leur contexte
  const relevantParagraphs = findRelevantParagraphs(question, paragraphs);

  const messages = [
    {
      role: "system",
      content: `Tu es un assistant spécialisé dans l'analyse approfondie de documents PDF.
                Voici les extraits pertinents du PDF à analyser :
                ${relevantParagraphs.map(p => `[Page ${p.page}] : ${p.text}`).join('\n\n')}

                Règles à suivre :
                1. Analyse en profondeur le contexte fourni pour donner une réponse complète
                2. Synthétise l'information de manière claire et concise
                3. Cite les passages pertinents en indiquant les numéros de page
                4. Format des citations : "page X: [texte cité]"
                5. Si la réponse n'est pas complètement dans les extraits, indique-le`
    },
    ...previousMessages.slice(-2), // Réduire le contexte historique
    {
      role: "user",
      content: question
    }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
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
      content,
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

function getWordSimilarity(word1: string, word2: string): number {
  const w1 = normalizeText(word1);
  const w2 = normalizeText(word2);

  // Correspondance exacte
  if (w1 === w2) return 1;

  // L'un contient l'autre
  if (w1.includes(w2) || w2.includes(w1)) return 0.8;

  // Distance de Levenshtein simple pour les fautes de frappe
  const distance = levenshteinDistance(w1, w2);
  const maxLength = Math.max(w1.length, w2.length);
  const similarity = 1 - distance / maxLength;

  return similarity > 0.8 ? similarity : 0;
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}