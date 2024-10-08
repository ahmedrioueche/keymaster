import { SearchPrefs } from '@/app/types/types';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Structure for holding users in search
let searchQueue: { user: User; prefs: SearchPrefs; timestamp: number; isSelected: boolean }[] = [];
const SEARCH_TIMEOUT = 6000;
let isCreatingRoom = false; // Lock to prevent concurrent room creation

// Function to find an opponent for the user
export const findOpponent = async (user: User, searchPrefs: SearchPrefs) => {
  try {
    const now = Date.now();
    console.log("searchQueue on top:", searchQueue);

    // Step 2: Clean up old entries in the search queue (timeout-based)
    searchQueue = searchQueue.filter(entry => now - entry.timestamp <= SEARCH_TIMEOUT && !entry.isSelected);

    // Step 3: Check if the user is already in the search queue
    let existingEntryIndex = searchQueue.findIndex(entry => entry.user.id === user.id);

    if (existingEntryIndex !== -1) {
      // Update the timestamp if the user is already in the queue
      searchQueue[existingEntryIndex].timestamp = now;
    } else {
      // Step 4: Add the user to the queue if they're not already there
      searchQueue.push({ user, prefs: searchPrefs, timestamp: now, isSelected: false });
      existingEntryIndex = searchQueue.length - 1; // Update the index to point to the newly added user
    }

    // Step 5: Attempt to find an opponent
    const opponentIndex = searchQueue.findIndex(entry =>
      entry.user.id !== user.id &&
      entry.prefs.prefLanguage === searchPrefs.prefLanguage &&
      entry.prefs.prefTextMaxLength === searchPrefs.prefTextMaxLength &&
      !entry.isSelected
    );

    if (opponentIndex !== -1) {
      const opponentEntry = searchQueue[opponentIndex];
      const opponent = opponentEntry.user;

      // Step 6: Create a consistent room ID (sorted to avoid ordering mismatch)
      const roomId = `room_${[user.id, opponent.id].sort().join('_')}`;

      // Step 7: Check if the room already exists
      const existingRoom = await prisma.room.findUnique({ where: { roomId } });
      console.log("existingRoom", existingRoom);

      // Locking mechanism to prevent race condition
      if (existingRoom || isCreatingRoom) {
        // If a room already exists or a room is being created, mark both users as selected
        if (existingRoom) {
          searchQueue[opponentIndex].isSelected = true;
          searchQueue[existingEntryIndex].isSelected = true;

          console.log(`Existing room found: ${roomId}`);
          return {
            status: 'success',
            room: existingRoom,
            opponent,
          };
        }
        console.log("A room is currently being created. Please try again later.");
        return {
          status: 'waiting',
          message: 'A room is currently being created. Please try again later.',
        };
      }

      // Lock the room creation process
      isCreatingRoom = true;

      // Step 8: Create the room if it doesn't exist
      try {
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

        // Step 9: Mark both users as selected
        searchQueue[opponentIndex].isSelected = true;
        searchQueue[existingEntryIndex].isSelected = true;

        console.log(`Room created: ${roomId} with users: ${user.username} and ${opponent.username}`);

        return {
          status: 'success',
          room,
          opponent,
        };
      } finally {
        // Unlock the room creation process
        isCreatingRoom = false;
      }
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
