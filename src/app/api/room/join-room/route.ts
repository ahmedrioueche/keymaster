import { joinRoom } from '@/app/services/roomService';
import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/app/utils/pusher';

export async function POST(req: NextRequest) {
  try {
    const { roomId, user } = await req.json();

    const joinResult = await joinRoom(roomId, user);
    console.log("joinResult.status", joinResult.status)

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
    console.error('Error in Pusher route:', error);
    return NextResponse.json({ error: `Message failed to send: ${error}` }, { status: 500 });
  }
}
