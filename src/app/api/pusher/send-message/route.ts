import { getGeminiAnswer } from '@/app/services/geminiService';
import { competePrompt } from '@/app/utils/helper';
import { pusherServer } from '@/app/utils/pusher';
import { NextRequest, NextResponse } from 'next/server';

// In-memory store for textToType per room (can be replaced by a DB or cache for persistence)
const roomTextStore = new Map();

export async function POST(req: NextRequest) {
  try {
    const { roomId, message, username } = await req.json();

    let textToType = roomTextStore.get(roomId); // Check if the text already exists for the room
    
    // If textToType doesn't exist for this room, fetch it from Gemini
    if (!textToType) {
      const response = await getGeminiAnswer(competePrompt);
      console.log("Gemini response:", response);

      if (response) {
        textToType = response;
        roomTextStore.set(roomId, textToType); // Save the text to the room store
      }
    }

    // Trigger the 'text-update' event in the channel
    await pusherServer.trigger(`compete-channel-${roomId}`, 'on-text-update', {
      message,
      username,
    });

    // Trigger the 'ready' event to notify that the user is ready
    await pusherServer.trigger(`compete-channel-${roomId}`, 'on-ready', {
      username,
    });

    // Broadcast the textToType to all users in the room (whether the first or subsequent users)
    await pusherServer.trigger(`compete-channel-${roomId}`, 'on-text-to-type', {
      textToType, 
    });

    console.log('Event triggered successfully');
    return NextResponse.json({ status: 'Message sent' });
  } catch (error) {
    console.error('Error in Pusher route:', error);
    return NextResponse.json({ error: `Message failed to send: ${error}` }, { status: 500 });
  }
}
