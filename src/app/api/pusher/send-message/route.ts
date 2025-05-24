import { getGeminiAnswer } from '@/services/geminiService';
import { getRoomById } from '@/services/roomService';
import { getPrompt } from '@/lib/helper';
import { pusherServer } from '@/lib/pusher';
import { RoomSettings } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// In-memory store for textToType per room
const roomTextStore = new Map();
let roomSettings: RoomSettings | undefined | null;
// Mutex implementation
const textGenerationLocks = new Map(); // Store locks per room
const roomWinners = new Map();
let textGenerated = false;
// Helper function to ensure text generation works with room settings re-fetch
const generateTextForRoom = async (roomId: string) => {
  let textToType = roomTextStore.get(roomId);

  // If no text generated and lock is not set
  if (!textGenerationLocks.get(roomId)) {
    try {
      textGenerationLocks.set(roomId, true); // Lock the room for text generation

      // Fetch room settings each time
      const result = await getRoomById(roomId);
      roomSettings = result?.room?.settings;

      // Generate new text based on room settings
      const response = await getGeminiAnswer(getPrompt(roomSettings?.language, roomSettings?.maxTextLength));

      if (response) {
        textToType = response;
        roomTextStore.set(roomId, textToType); // Save the text to the room store
      }
    } catch (error) {
      console.error('Error generating Gemini prompt:', error);
    } finally {
      // Ensure lock is cleared regardless of success/failure
      textGenerationLocks.delete(roomId);
    }
  } else {
    // Wait if generation is already in progress
    while (textGenerationLocks.get(roomId)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    textToType = roomTextStore.get(roomId);
  }

  return textToType;
};

export async function POST(req: NextRequest) {
  try {
    const { roomId, event, message, user } = await req.json();
    let textToType = roomTextStore.get(roomId);

    switch (event) {
      case 'on-ready':
        console.log('on ready');
        await pusherServer.trigger(`room-${roomId}`, 'on-ready', { user });
        if (!textGenerated) {
          textToType = await generateTextForRoom(roomId);
          console.log('textToType', textToType);
          textGenerated = true;
          await pusherServer.trigger(`room-${roomId}`, 'on-text-to-type', { textToType });
        }
        break;

      case 'on-play-again':
        await pusherServer.trigger(`room-${roomId}`, 'on-play-again', { user });
        textGenerated = false;
        break;

      case 'on-restart':
        await pusherServer.trigger(`room-${roomId}`, 'on-restart', { user });
        textGenerated = false;
        break;

      case 'on-text-update':
        await pusherServer.trigger(`room-${roomId}`, 'on-text-update', { message, user });
        break;

      case 'on-win':
        const { speed, time } = JSON.parse(message);
        if (!roomWinners.has(roomId)) {
          roomWinners.set(roomId, { speed, time, user });
          await pusherServer.trigger(`room-${roomId}`, 'on-win', { speed, time, user });
        }
        textGenerationLocks.set(roomId, false); // Unlock after win
        textGenerated = false;
        break;

      case 'on-leave':
        await pusherServer.trigger(`room-${roomId}`, 'on-leave', { user });
        textGenerated = false;
        break;
    }

    if (textToType) {
      await pusherServer.trigger(`room-${roomId}`, 'on-text-to-type', { textToType });
      return NextResponse.json({ status: 'Message sent' });
    }
  } catch (error) {
    console.error('Error in Pusher route:', error);
    return NextResponse.json({ error: `Message failed to send: ${error}` }, { status: 500 });
  }
}
