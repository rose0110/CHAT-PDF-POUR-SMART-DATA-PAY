import { pdfjsLib } from './pdf-worker';

export async function extractTextFromPdf(url: string): Promise<{ text: string; paragraphs: Array<{ text: string; page: number; index: number }> }> {
  const pdf = await pdfjsLib.getDocument(url).promise;
  const numPages = pdf.numPages;
  const paragraphs: Array<{ text: string; page: number; index: number }> = [];
  let fullText = '';
  let paragraphIndex = 0;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let currentParagraph = '';

    content.items.forEach((item: any, idx: number) => {
      const text = item.str.trim();
      if (text) {
        currentParagraph += (currentParagraph ? ' ' : '') + text;

        // Détection de fin de paragraphe
        const nextItem = content.items[idx + 1];
        if (!nextItem || 
            (nextItem.transform[5] !== item.transform[5] && 
             Math.abs(nextItem.transform[5] - item.transform[5]) > 5)) {
          if (currentParagraph.length > 0) {
            paragraphs.push({
              text: currentParagraph,
              page: i,
              index: paragraphIndex++
            });
            fullText += currentParagraph + '\n\n';
            currentParagraph = '';
          }
        }
      }
    });

    // Ajouter le dernier paragraphe de la page s'il existe
    if (currentParagraph.length > 0) {
      paragraphs.push({
        text: currentParagraph,
        page: i,
        index: paragraphIndex++
      });
      fullText += currentParagraph + '\n\n';
    }
  }

  return {
    text: fullText.trim(),
    paragraphs
  };
}

export function searchInParagraphs(query: string, paragraphs: Array<{ text: string; page: number; index: number }>): Array<{ text: string; page: number; index: number }> {
  const searchTerms = query.toLowerCase().split(' ');

  return paragraphs.filter(paragraph => {
    const paragraphText = paragraph.text.toLowerCase();
    return searchTerms.every(term => paragraphText.includes(term));
  });
}