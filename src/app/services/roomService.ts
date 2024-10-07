import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const createRoom = async (roomId: string, user: User) => {
  try {
    const room = await prisma.room.create({
      data: {
        roomId: roomId,
        status: 'active',
        maxPlayers: 2,
        players: {
          connect: { id: user.id },
        },
      },
      include: {
        players: true,
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

export const joinRoom = async (roomId: string, user: User) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: roomId },
      include: { players: true },
    });

    if (!room) {
      return {
        status: 'error',
        message: 'Room not found.',
      };
    }

    if (room.players.length >= room.maxPlayers) {
      return {
        status: 'error',
        message: 'Room is full',
      };
    }

    const updatedRoom = await prisma.room.update({
      where: { roomId },
      data: {
        players: {
          connect: { id: user.id },
        },
      },
      include: { players: true },
    });

    return {
      status: 'success',
      room: updatedRoom,
    };
  } catch (error) {
    console.error("Error joining room:", error);
    return {
      status: 'error',
      message: 'Failed to join room.',
    };
  }
};

export const getRoomPlayers = async (roomId: string) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: roomId },
      include: { players: true },
    });

    if (!room) {
      return {
        status: 'error',
        message: 'Room not found.',
      };
    }

    return {
      status: 'success',
      players: room.players,
    };
  } catch (error) {
    console.error("Error getting room players:", error);
    return {
      status: 'error',
      message: 'Failed to get room players.',
    };
  }
};

export const getRoomById = async (roomId: string) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId },
      include: { players: true, settings: true },
    });

    if (!room) {
      return { status: 'error', message: 'Room not found.' };
    }

    return { status: 'success', room };
  } catch (error) {
    console.error("Error retrieving room:", error);
    return { status: 'error', message: 'Failed to retrieve room.' };
  }
};

export const removePlayer = async (roomId: string, user: User) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: roomId },
      include: { players: true },
    });

    if (!room) {
      return {
        status: 'error',
        message: 'Room not found.',
      };
    }

    // Remove the player from the room
    const updatedRoom = await prisma.room.update({
      where: { roomId },
      data: {
        players: {
          disconnect: { id: user.id },
        },
      },
      include: { players: true },
    });

    // Check if room is empty
    if (updatedRoom.players.length === 0) {
      console.log(`Room ${roomId} is empty. Setting up auto-deletion timer.`);
      
      // Set a timer to delete the room after 1 minute if no players join
      setTimeout(async () => {
        const currentRoom = await prisma.room.findUnique({
          where: { roomId: roomId },
          include: { players: true },
        });

        if (currentRoom && currentRoom.players.length === 0) {
          await deleteRoom(roomId); // Call the deleteRoom function if no players
          console.log(`Room ${roomId} has been deleted after 1 minute of inactivity.`);
        }
      }, 60000); // 60000 ms = 1 minute
    }

    return {
      status: 'success',
      room: updatedRoom,
      message: `Player ${user.username} removed from room ${roomId}.`,
    };
  } catch (error) {
    console.error("Error removing player from room:", error);
    return {
      status: 'error',
      message: `Failed to remove player: ${error}`,
    };
  }
};

export const deleteRoom = async (roomId: string) => {
  try {
    const room = await prisma.room.findUnique({
      where: { roomId: roomId },
      include: { players: true },
    });

    if (!room) {
      return {
        status: 'error',
        message: 'Room not found.',
      };
    }

    await prisma.room.delete({
      where: { roomId: roomId },
    });

    return {
      status: 'success',
      message: `Room ${roomId} and all associated players removed.`,
    };
  } catch (error) {
    console.error("Error deleting room:", error);
    return {
      status: 'error',
      message: `Failed to delete room: ${error}`,
    };
  }
};
