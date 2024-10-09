import { getGeminiAnswer } from '@/app/services/geminiService';
import { getRoomById } from '@/app/services/roomService';
import { getPrompt } from '@/app/utils/helper';
import { pusherServer } from '@/app/utils/pusher';
import { RoomSettings } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// In-memory store for textToType per room (can be replaced by a DB or cache for persistence)
const roomTextStore = new Map();
let roomSettings: RoomSettings | undefined | null;
// Mutex implementation
const textGenerationLocks: Map<string, boolean> = new Map();
const textGenerationOnRestartLocks: Map<string, boolean> = new Map();
const roomWinners = new Map();

export async function POST(req: NextRequest) {
  try {
    const { roomId, event, message, user } = await req.json();
    let textToType = roomTextStore.get(roomId); // Check if the text already exists for the room

    const generatePrompt = async (Locks : Map<string, boolean>) => {
        
      if (!Locks.get(roomId)) {
        Locks.set(roomId, true); // Lock the room for text generation

        if (!textToType) {
          const result = await getRoomById(roomId);
          roomSettings = result?.room?.settings;
          const response = await getGeminiAnswer(getPrompt(roomSettings?.language, roomSettings?.maxTextLength));

          if (response) {
            textToType = response;
            roomTextStore.set(roomId, textToType); // Save the text to the room store
          }
        }

        // Unlock the room after text generation
        Locks.delete(roomId);
      } else {
        // Wait for the existing generation to finish
        while (Locks.get(roomId)) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Simple polling mechanism
        }
        // Refresh the textToType after waiting
        textToType = roomTextStore.get(roomId);
      }
    }

    switch (event) {
      case "on-ready": 
        // Locking mechanism
         await generatePrompt(textGenerationLocks)
        // Trigger the 'ready' event to notify that the user is ready
        await pusherServer.trigger(`room-${roomId}`, 'on-ready', {
          user,
        });
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
          if (!roomWinners.has(roomId)) {
            roomWinners.set(roomId, { speed, time, user }); // Set the winner
            // Trigger the 'win' event to notify all clients
            await pusherServer.trigger(`room-${roomId}`, 'on-win', {
              speed,
              time,
              user,
            });
          }
          textGenerationLocks.set(roomId, false);
          break;  
        case "on-leave": 
          await pusherServer.trigger(`room-${roomId}`, 'on-leave', {
            user, 
          });   
        break;
        case "on-play-again": 
          await generatePrompt(textGenerationLocks);
          await pusherServer.trigger(`room-${roomId}`, 'on-play-again', {
            user, 
          });   
        break;
        case "on-restart":
          await generatePrompt(textGenerationOnRestartLocks);
          await pusherServer.trigger(`room-${roomId}`, 'on-restart', {
            user, 
          });   
        break;
      }

      // Broadcast the textToType to all users in the room (whether the first or subsequent users)
      if (textToType) {
        await pusherServer.trigger(`room-${roomId}`, 'on-text-to-type', {
          textToType, 
        });

      return NextResponse.json({ status: 'Message sent' });
    }
  } catch (error) {
    console.error('Error in Pusher route:', error);
    return NextResponse.json({ error: `Message failed to send: ${error}` }, { status: 500 });
  }
}
