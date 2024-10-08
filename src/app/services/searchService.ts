import { SearchPrefs } from '@/app/types/types';
import { PrismaClient, User } from '@prisma/client';
const prisma = new PrismaClient();

// Structure for holding users in search
let searchQueue: { user: User; prefs: SearchPrefs; timestamp: number }[] = [];
const SEARCH_TIMEOUT = 3000; // 3 seconds timeout

// Function to find an opponent for the user
export const findOpponent = async (user: User, searchPrefs: SearchPrefs) => {
  console.log("Starting findOpponent for user:", user.username);
  
  try {
    const now = Date.now();

    // Step 1: Add or update the user's search preferences in the database
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

    // Step 2: Clean up old entries in the search queue (timeout-based)
    // Remove any users whose search has timed out
    searchQueue = searchQueue.filter(entry => now - entry.timestamp <= SEARCH_TIMEOUT);
    
    // Step 3: Check if the user is already in the search queue
    const existingEntryIndex = searchQueue.findIndex(entry => entry.user.id === user.id);

    if (existingEntryIndex !== -1) {
      // Update the timestamp if the user is already in the queue
      searchQueue[existingEntryIndex].timestamp = now;
    } else {
      // Step 4: Add the user to the queue if they're not already there
      searchQueue.push({ user, prefs: searchPrefs, timestamp: now });
    }

    console.log("Updated searchQueue after cleanup and adding user:", searchQueue);

    // Step 5: Attempt to find an opponent
    const opponentIndex = searchQueue.findIndex(entry =>
      entry.user.id !== user.id &&
      entry.prefs.prefLanguage === searchPrefs.prefLanguage &&
      entry.prefs.prefTextMaxLength === searchPrefs.prefTextMaxLength
    );

    if (opponentIndex !== -1) {
      const opponentEntry = searchQueue[opponentIndex];
      const opponent = opponentEntry.user;

      // Step 6: Create a consistent room ID (sorted to avoid ordering mismatch)
      const roomId = `room_${[user.id, opponent.id].sort().join('_')}`;

      // Step 7: Check if the room already exists
      const existingRoom = await prisma.room.findUnique({ where: { roomId } });

      if (existingRoom) {
        // Return the existing room if it already exists
        console.log(`Existing room found: ${roomId}`);
        return {
          status: 'success',
          room: existingRoom,
          opponent,
        };
      }

      // Step 8: Create the room if it doesn't exist
      const room = await prisma.room.create({
        data: {
          roomId,
          status: 'active',
          maxPlayers: 2, 
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

      // Step 9: Remove both users from the queue once they are matched
      searchQueue.splice(opponentIndex, 1);  // Remove opponent
      searchQueue.splice(searchQueue.findIndex(entry => entry.user.id === user.id), 1);  // Remove user

      console.log(`Room created: ${roomId} with users: ${user.username} and ${opponent.username}`);

      return {
        status: 'success',
        room,
        opponent,
      };
    }

    // No opponent found, return waiting status
    console.log("No suitable opponent found. User will continue searching.");
    return {
      status: 'waiting',
      message: 'No suitable opponent found. You will be matched soon.',
    };

  } catch (error) {
    // Log the error for debugging
    console.error("Error finding opponent:", error);
    return {
      status: 'error',
      message: 'Failed to find an opponent.',
    };
  }
};
