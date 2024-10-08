import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY: string | undefined = process.env.GEMINI_KEY;
const genAI = API_KEY? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const getGeminiAnswer = async (prompt: string) => {
    
    const result = await model?.generateContent(prompt);
    
    return result?.response.text();
};
