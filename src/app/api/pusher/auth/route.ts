import { pusherServer } from '@/lib/pusher';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { socket_id, channel_name } = Object.fromEntries(new URL(req.url).searchParams);

  try {
    const dummyUserId = 'dummy_user_id';
    const dummyUserInfo = { name: 'Dummy User' };

    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
      user_id: dummyUserId,
      user_info: dummyUserInfo,
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Error in Pusher auth:', error);
    return NextResponse.json({ error: 'Pusher auth failed' }, { status: 403 });
  }
}
