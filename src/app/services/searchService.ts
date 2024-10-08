import { SearchPrefs } from '@/app/types/types';
import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

const searchQueue: { user: User; prefs: SearchPrefs; timestamp: number }[] = [];
const SEARCH_TIMEOUT = 30000; 

export const findOpponent = async (user: User, searchPrefs: SearchPrefs) => {
  try {
    // Step 1: Add user to the Search table
    await prisma.search.upsert({
      where: { userId: user.id },
      update: {
        prefLanguage: searchPrefs.prefLanguage,
        prefTextMaxLength: searchPrefs.prefTextMaxLength,
      },
      create: {
        userId: user.id,
        prefLanguage: searchPrefs.prefLanguage,
        prefTextMaxLength: searchPrefs.prefTextMaxLength,
      },
    });

    // Step 2: Clear old searchers
    const now = Date.now();
    while (searchQueue.length > 0 && now - searchQueue[0].timestamp > SEARCH_TIMEOUT) {
      searchQueue.shift(); // Remove oldest entry
    }

    // Step 3: Check if user is already in the search queue
    const existingEntryIndex = searchQueue.findIndex(entry => entry.user.id === user.id);
    if (existingEntryIndex !== -1) {
      // Update the timestamp for the existing entry
      searchQueue[existingEntryIndex].timestamp = now;
    } else {
      // Step 4: Add user to the search queue
      searchQueue.push({ user, prefs: searchPrefs, timestamp: now });
    }
    
    // Step 5: Attempt to find an opponent
    const opponentIndex = searchQueue.findIndex((entry) =>
      entry.user.id !== user.id &&
      entry.prefs.prefLanguage === searchPrefs.prefLanguage &&
      entry.prefs.prefTextMaxLength === searchPrefs.prefTextMaxLength
    );

    if (opponentIndex !== -1) {
      const opponentEntry = searchQueue[opponentIndex];
      const opponent = opponentEntry.user;

      // Step 6: Create a consistent room ID
      const roomId = `room_${[user.id, opponent.id].sort().join('_')}`; // Sort to ensure the same ID for both users

      // Step 7: Check if the room already exists
      const existingRoom = await prisma.room.findUnique({
        where: { roomId },
      });

      if (existingRoom) {
        // Return the existing room if it already exists
        return {
          status: 'success',
          room: existingRoom,
          opponent,
        };
      }

      // Create the room for the matched players
      const room = await prisma.room.create({
        data: {
          roomId,
          status: 'active',
          maxPlayers: 4,
          players: {
            connect: [{ id: user.id }, { id: opponent.id }],
          },
          settings: {
            create: {
              language: searchPrefs.prefLanguage,
              maxTextLength: searchPrefs.prefTextMaxLength,
            },
          },
        },
        include: { players: true, settings: true },
      });

      // Remove both users from the queue
      searchQueue.splice(opponentIndex, 1);
      searchQueue.splice(searchQueue.findIndex(entry => entry.user.id === user.id), 1);

      return {
        status: 'success',
        room,
        opponent,
      };
    }

    // If no opponent found, return waiting status
    return {
      status: 'waiting',
      message: 'No suitable opponent found. You will be matched soon.',
    };
  } catch (error) {
    console.error("Error finding opponent:", error);
    return {
      status: 'error',
      message: 'Failed to find an opponent.',
    };
  }
};
