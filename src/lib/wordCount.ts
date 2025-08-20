export function countWords(text: string): number {
    if (!text || !text.trim()) return 0;
    
    // Remove markdown syntax for more accurate word count
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
      .replace(/[#*_~`]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return cleanText ? cleanText.split(' ').length : 0;
  }