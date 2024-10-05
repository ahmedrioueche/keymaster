import { apiPromptGemini } from "./apiHelper";

export const helperPromptGemini = async (textLength : number, language : string, topic : string) => {
    const prompt = `With no introductions nor conclusions, give a paragraph of exactly
                    ${textLength} letters (including spaces) if possible, 
                    or an offset of 30 characters max, this is important!
                    in a ${topic} topic in ${language} language, do not exceed the required length.`;
    const response = await apiPromptGemini(prompt);

    console.log("response:", response);
    return response;
}
