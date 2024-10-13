import { pusherServer } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

// Add this new endpoint for Pusher channel authentication
export async function GET(req: NextRequest) {
    const { socket_id, channel_name } = Object.fromEntries(new URL(req.url).searchParams);
  
    try {
      // Dummy user ID and information
      const dummyUserId = 'dummy_user_id'; // This should be unique for each user
      const dummyUserInfo = { name: 'Dummy User' }; // Any information you want to attach
  
      // Authorize the channel with the dummy user
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
  