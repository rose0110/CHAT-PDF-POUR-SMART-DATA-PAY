interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  content: string;
  citations: string[];
}

export async function askQuestion(
  question: string,
  pdfText: string,
  previousMessages: Message[]
): Promise<PerplexityResponse> {
  const messages = [
    {
      role: "system",
      content: `You are an AI assistant helping to answer questions about a PDF document. 
                Here is the content of the PDF: ${pdfText}
                
                When answering:
                1. Only use information from the provided PDF
                2. If the answer isn't in the PDF, say so
                3. Cite relevant sections from the PDF`
    },
    ...previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: "user",
      content: question
    }
  ];

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages,
      temperature: 0.2,
      max_tokens: 500,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get response from AI');
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    citations: data.citations || []
  };
}
