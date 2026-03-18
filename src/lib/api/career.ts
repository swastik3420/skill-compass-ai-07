import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
 * Extract text from a PDF file using pdf.js for reliable parsing
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const textParts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }

  const fullText = textParts.join('\n\n').trim();
  
  if (fullText.length < 30) {
    throw new Error('Could not extract text from this PDF. It may be image-based or encrypted. Try a different file or paste your resume text.');
  }

  console.log(`Extracted ${fullText.length} characters from ${numPages} pages`);
  return fullText;
}

/**
 * Extract text from a plain text or markdown file
 */
export async function extractTextFromTextFile(file: File): Promise<string> {
  return await file.text();
}

/**
 * Determine file type and extract text accordingly
 */
export async function extractResumeText(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return extractTextFromPdf(file);
    case 'txt':
    case 'md':
      return extractTextFromTextFile(file);
    default:
      throw new Error(`Unsupported file format: .${extension}. Please upload a PDF or TXT file.`);
  }
}
