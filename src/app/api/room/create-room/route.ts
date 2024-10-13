import { createRoom } from '@/services/roomService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { roomId, user } = await req.json();

    const response = await createRoom(roomId, user);

    return NextResponse.json({response: response});
  } catch (error) {
    console.error('Error creating room route:', error);
    return NextResponse.json({ error: `Failed to create room: ${error}` }, { status: 500 });
  }
}
