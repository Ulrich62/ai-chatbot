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
    // First try to decode HTML entities
    const decodedText = decode(text);
    
    // Handle common special characters
    const processedText = decodedText
      .replace(/\\n/g, '\n')  // Handle newlines
      .replace(/\\r/g, '\r')  // Handle carriage returns
      .replace(/\\t/g, '\t')  // Handle tabs
      .replace(/\\"/g, '"')   // Handle quotes
      .replace(/\\\\/g, '\\') // Handle backslashes
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => 
        String.fromCharCode(Number.parseInt(code, 16))
      ); // Handle Unicode escape sequences

    return processedText;
  } catch (e) {
    console.error("Error parsing text:", e);
    return fallback ?? text;
  }
};