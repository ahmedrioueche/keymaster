import { getGeminiAnswer } from '@/app/services/geminiService';
import { getRoomById } from '@/app/services/roomService';
import { getPrompt } from '@/app/utils/helper';
import { pusherServer } from '@/app/utils/pusher';
import { RoomSettings } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// In-memory store for textToType per room (can be replaced by a DB or cache for persistence)
const roomTextStore = new Map();
let roomSettings : RoomSettings | undefined | null;
let geminiPrompted = false;
export async function POST(req: NextRequest) {
  try {
    const { roomId, event, message, user } = await req.json();
    let textToType = roomTextStore.get(roomId); // Check if the text already exists for the room
    // If textToType doesn't exist for this room, fetch it from Gemini
    

    switch(event){
      case "on-ready": 
        if (!textToType) {
          const result = await getRoomById(roomId);
          roomSettings = result?.room?.settings;
          const response = await getGeminiAnswer(getPrompt(roomSettings?.language, roomSettings?.maxTextLength));
    
          if (response) {
            textToType = response;
            roomTextStore.set(roomId, textToType); // Save the text to the room store
          }
        }
        // Trigger the 'ready' event to notify that the user is ready
        await pusherServer.trigger(`room-${roomId}`, 'on-ready', {
          user,
        });
        geminiPrompted = false; ///for next round
      break;

      case "on-text-update":
        // Trigger the 'text-update' event in the channel
        await pusherServer.trigger(`room-${roomId}`, 'on-text-update', {
          message,
          user,
        });
      break;

      case "on-win":
        const { speed, time } = JSON.parse(message);
        await pusherServer.trigger(`room-${roomId}`, 'on-win', {
          speed,
          time,
          user, 
        });
        break;  
      case "on-leave": 
        await pusherServer.trigger(`room-${roomId}`, 'on-leave', {
          user, 
        });   
      break;
      case "on-play-again": 
      if (!geminiPrompted) {
        const response = await getGeminiAnswer(getPrompt(roomSettings?.language, roomSettings?.maxTextLength));
        if (response) {
          textToType = response;
          roomTextStore.set(roomId, textToType);
        }
        geminiPrompted = true;
      }
        await pusherServer.trigger(`room-${roomId}`, 'on-play-again', {
          user, 
        });   
      break;
    }
  
    // Broadcast the textToType to all users in the room (whether the first or subsequent users)
    await pusherServer.trigger(`room-${roomId}`, 'on-text-to-type', {
      textToType, 
    });

    return NextResponse.json({ status: 'Message sent' });
  } catch (error) {
    console.error('Error in Pusher route:', error);
    return NextResponse.json({ error: `Message failed to send: ${error}` }, { status: 500 });
  }
}
