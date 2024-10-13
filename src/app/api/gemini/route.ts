import { NextResponse } from 'next/server';
import { getGeminiAnswer } from '../../../services/geminiService';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        const result = await getGeminiAnswer(prompt);
        
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error prompting Gemini:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
