import { pdfjsLib } from './pdf-worker';

export async function extractTextFromPdf(url: string): Promise<{ text: string; pageTexts: string[] }> {
  const pdf = await pdfjsLib.getDocument(url).promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    pageTexts.push(pageText);
  }

  return {
    text: pageTexts.join(' '),
    pageTexts
  };
}

export function searchInText(query: string, pageTexts: string[]): { results: string[]; pages: number[] } {
  const results: string[] = [];
  const pages: number[] = [];
  
  const searchTerms = query.toLowerCase().split(' ');
  
  pageTexts.forEach((pageText, pageIndex) => {
    const pageTextLower = pageText.toLowerCase();
    if (searchTerms.every(term => pageTextLower.includes(term))) {
      // Trouver le contexte autour de la correspondance
      const startIndex = pageTextLower.indexOf(searchTerms[0]);
      const excerpt = pageText.slice(
        Math.max(0, startIndex - 50),
        Math.min(pageText.length, startIndex + 200)
      );
      results.push(excerpt.trim());
      pages.push(pageIndex + 1);
    }
  });

  return { results, pages };
}
