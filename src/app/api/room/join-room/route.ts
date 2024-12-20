import { joinRoom } from '@/services/roomService';
import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const { roomId, user } = await req.json();

    const joinResult = await joinRoom(roomId, user);

    if (joinResult.status === 'success') {
      const updatedRoom = joinResult.room;

      await pusherServer.trigger(`room-${roomId}`, 'on-join', {
        message: `${user.username} has joined the room.`,
        user: user,
        users: updatedRoom?.players, 
      });

    }

    return NextResponse.json({response: joinResult});
  } catch (error) {
    console.error('Error joining room route:', error);
    return NextResponse.json({ error: `Failed to join room: ${error}` }, { status: 500 });
  }
}
