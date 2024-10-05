import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRoom = async (roomId: string) => {
  try {
    // Create a new room
    const room = await prisma.room.create({
      data: {
        roomId: roomId,
        status: 'active',  
        maxPlayers: 4, 
      },
    });
    return {
      status: 'success',
      room: room,
    };
  } catch (error) {
    console.error("Error creating room:", error);
    return {
      status: 'error',
      message: 'Failed to create room.',
    };
  }
};

export const joinRoom = async (roomId: string) => {
    try {
      // Fetch the room by roomId
      const room = await prisma.room.findUnique({
        where: {
          roomId: roomId,
        },
      });
  
      if (!room) {
        return {
          status: 'error',
          message: 'Room not found.',
        };
      }
  
      // You can add additional logic here if needed, e.g., check if room is full
      return {
        status: 'success',
        room: room,
      };
    } catch (error) {
      console.error("Error joining room:", error);
      return {
        status: 'error',
        message: 'Failed to join room.',
      };
    }
  };
  