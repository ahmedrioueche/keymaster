import { findOpponent } from '@/app/services/searchService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { user, searchPrefs } = await req.json();

    const response = await findOpponent(user, searchPrefs);

    return NextResponse.json({response: response});
  } catch (error) {
    console.error('Error searching for opponent:', error);
    return NextResponse.json({ error: `Message search for opponent: ${error}` }, { status: 500 });
  }
}
