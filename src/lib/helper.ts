import { apiPromptGemini } from './apiHelper';
import { defaultLanguage, defaultTextLength } from './settings';

export const promptGemini = async (textLength: number, language: string, topic: string) => {
  const prompt = `With no introductions nor conclusions, give a paragraph of exactly
                    ${textLength} letters (including spaces) if possible, 
                    or an offset of 30 characters max, this is important!
                    in a ${topic} topic in ${language} language, do not exceed the required length.`;
  try {
    const response = await apiPromptGemini(prompt);
    return response;
  } catch (e) {
    console.log('Error prompting Gemini', e);
  }
};

export const getPrompt = (language: string | undefined | null, maxTextLength: number | undefined | null) => {
  const chosenLanguage = language ?? defaultLanguage;
  const chosenTextLength = maxTextLength ?? defaultTextLength;

  const competePrompt = `With no introductions nor conclusions, give a paragraph of a maximum of
        ${chosenTextLength} letters (including spaces) if possible, 
        or an offset of 30 characters max, this is important!
        in a general topic in ${chosenLanguage} language, do not exceed the required length.`;

  return competePrompt;
};

export const competePrompt = `With no introductions nor conclusions, give a paragraph of a maximum of
            ${defaultTextLength} letters (including spaces) if possible, 
            or an offset of 30 characters max, this is important!
            in a general topic in ${defaultLanguage} language, do not exceed the required length.`;

export const cleanTextToType = (text: string | null) => {
  const cleanedText = text && text?.trimEnd() ? text?.trimEnd() : null;

  if (!cleanedText) return null;

  // Replace multiple spaces with a single space and return the cleaned text
  return cleanedText.replace(/\s+/g, ' ');
};
