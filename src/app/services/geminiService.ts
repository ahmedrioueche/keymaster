const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY: string | undefined = process.env.GEMINI_KEY;
console.log("api_key", API_KEY);
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getGeminiAnswer = async (prompt : string) => {
    console.log("prompt", prompt)
    const result = await model.generateContent(prompt);

    return result.response.text();
}

