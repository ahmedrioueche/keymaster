import { pusherServer } from '@/app/utils/pusher';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { roomId, message, user } = await req.json();

    console.log(`Attempting to trigger event for user: ${user}, message: ${message}`);

    // Trigger the 'text-update' event in the channel
    await pusherServer.trigger(`compete-channel-${roomId}`, 'text-update', {
      message,
      user,
    });

    console.log('Event triggered successfully');
    return NextResponse.json({ status: 'Message sent' });
  } catch (error) {
    console.error('Error in Pusher route:', error);
    return NextResponse.json({ error: `Message failed to send: ${error}` }, { status: 500 });
  }
}
