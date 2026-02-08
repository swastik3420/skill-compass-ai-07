import { supabase } from "@/integrations/supabase/client";

export interface ParsedSkill {
  name: string;
  category: string;
  proficiencyHint?: string;
}

export interface ParsedResume {
  skills: ParsedSkill[];
  experienceLevel: string;
  jobTitles: string[];
  industries: string[];
  summary: string;
}

export interface Question {
  id: number;
  skill: string;
  difficulty: "Basic" | "Intermediate" | "Advanced";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Parse resume text using AI to extract skills and profile information
 */
export async function parseResume(resumeText: string): Promise<ApiResponse<ParsedResume>> {
  try {
    const { data, error } = await supabase.functions.invoke('parse-resume', {
      body: { resumeText }
    });

    if (error) {
      console.error('Error parsing resume:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Failed to parse resume' };
    }

    return { success: true, data: data.data };
  } catch (err) {
    console.error('Error in parseResume:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Generate assessment questions based on extracted skills
 */
export async function generateQuestions(
  skills: ParsedSkill[],
  experienceLevel: string
): Promise<ApiResponse<Question[]>> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { skills, experienceLevel }
    });

    if (error) {
      console.error('Error generating questions:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Failed to generate questions' };
    }

    return { success: true, data: data.questions };
  } catch (err) {
    console.error('Error in generateQuestions:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Extract text from a PDF file using the browser's PDF.js library
 * Note: For production, consider using a dedicated PDF parsing library
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Basic text extraction from PDF - looks for text patterns
        // This is a simplified approach; for production use pdf.js or similar
        const bytes = new Uint8Array(arrayBuffer);
        let text = '';
        
        // Convert to string and try to extract readable text
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(bytes);
        
        // Extract text between stream markers (simplified PDF text extraction)
        const streamMatches = rawText.match(/stream[\s\S]*?endstream/g) || [];
        
        for (const stream of streamMatches) {
          // Look for text patterns - parentheses often contain text in PDFs
          const textMatches = stream.match(/\(([^)]+)\)/g) || [];
          for (const match of textMatches) {
            const extracted = match.slice(1, -1);
            // Filter out binary/garbage content
            if (/^[\x20-\x7E\s]+$/.test(extracted) && extracted.length > 1) {
              text += extracted + ' ';
            }
          }
        }
        
        // Also try to extract text from common PDF text operators
        const tjMatches = rawText.match(/\[([^\]]+)\]\s*TJ/g) || [];
        for (const match of tjMatches) {
          const textParts = match.match(/\(([^)]+)\)/g) || [];
          for (const part of textParts) {
            const extracted = part.slice(1, -1);
            if (/^[\x20-\x7E\s]+$/.test(extracted)) {
              text += extracted;
            }
          }
        }

        // Clean up the text
        text = text
          .replace(/\s+/g, ' ')
          .replace(/[^\x20-\x7E\n]/g, '')
          .trim();

        if (text.length < 50) {
          // If we couldn't extract enough text, return a message for the AI
          text = `[PDF file uploaded: ${file.name}. The text could not be fully extracted. Please provide resume details manually or try a different file format.]`;
        }

        console.log('Extracted text length:', text.length);
        resolve(text);
      } catch (error) {
        console.error('Error extracting PDF text:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
