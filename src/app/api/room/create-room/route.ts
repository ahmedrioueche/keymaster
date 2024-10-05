import { createRoom } from '@/app/services/pusherService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { roomId } = await req.json();

    const response = await createRoom(roomId);

    return NextResponse.json({room: response, status: 'Room created successfully' });
  } catch (error) {
    console.error('Error in Pusher route:', error);
    return NextResponse.json({ error: `Message failed to send: ${error}` }, { status: 500 });
  }
}
