import { NextRequest, NextResponse } from 'next/server';
import { handlePing } from '@/app/services/searchService'; // Import the service
import { User, SearchPrefs } from '@/app/types/types'; // Import from types

export async function POST(req: NextRequest) {
  try {
    const { user, searchPrefs }: { user: User; searchPrefs: SearchPrefs } = await req.json();

    // Handle the ping and try to find a match
    const match = await handlePing(user, searchPrefs);

    // If a match is found, respond with the room and opponent information
    if (match) {
      return NextResponse.json(match);
    }

    // If no match, simply wait for another ping, no response
    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Error processing ping request:', error);
    return NextResponse.json(
      { error: `Message search for opponent: ${error}` },
      { status: 500 }
    );
  }
}
