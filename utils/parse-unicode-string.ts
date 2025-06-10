import { decode } from 'he';

/**
 * Parse a string that may contain escaped Unicode characters
 * @param text The text to parse
 * @param fallback Optional fallback value if parsing fails (defaults to the original text)
 * @returns The parsed text with proper Unicode characters
 */
export const parseUnicodeString = (text: string, fallback?: string): string => {
    if (!text) return text;
    
      try {
      // Escape special characters and prepare string for JSON parsing
      const escapedText = text
        .replace(/\n/g, "\\n")  // Handle newlines
        .replace(/\r/g, "\\r")  // Handle carriage returns
        .replace(/\t/g, "\\t")  // Handle tabs
        .replace(/"/g, '\\"')  // Escape quotes
        .replace(/\s+/g, ' ').trim();
  
  
      // Parse the escaped text
      const parsedText = JSON.parse(`"${escapedText}"`);
  
      // texte.encode('utf-8').decode('unicode_escape')
      
      return decode(parsedText);
    } catch (e) {
      console.error("error", e);
      return fallback ?? text;
    }
  };