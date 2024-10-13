import { updateRoom } from '@/services/roomService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { roomId, userId, action } = await req.json();

    const response = await updateRoom(roomId, userId, action);

    return NextResponse.json({response: response});
  } catch (error) {
    console.error('Error updating room route:', error);
    return NextResponse.json({ error: `Failed to update room: ${error}` }, { status: 500 });
  }
}
