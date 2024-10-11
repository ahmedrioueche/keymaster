  import { User, SearchPrefs } from '@/app/services/types/types';
  import { PrismaClient } from '@prisma/client';

  const prisma = new PrismaClient();
  const searchQueue: { user: User; prefs: SearchPrefs; lastPing: number }[] = [];
  const PING_TIMEOUT = 2000; 

  export const handlePing = async (user: User, searchPrefs: SearchPrefs) => {
    const now = Date.now();

    // Ensure user.id is defined
    if (!user.id) {
      throw new Error('User ID is undefined');
    }

    // Clean up old players who haven't pinged within the PING_TIMEOUT
    cleanUpQueue(now);

    // Add or update the player in the queue
    const existingEntryIndex = searchQueue.findIndex((entry) => entry.user.id === user.id);
    if (existingEntryIndex !== -1) {
      // Update existing player's last ping time and preferences
      searchQueue[existingEntryIndex].lastPing = now;
      searchQueue[existingEntryIndex].prefs = searchPrefs;
    } else {
      // Add new player to the queue
      searchQueue.push({
        user,
        prefs: searchPrefs,
        lastPing: now,
      });

      // Save their search preferences in the database
      await prisma.search.upsert({
        where: { userId: user.id },  // Use user.id confidently
        update: {
          prefLanguage: searchPrefs.prefLanguage,
          prefTextMaxLength: searchPrefs.prefTextMaxLength,
        },
        create: {
          userId: user.id,  // Use user.id confidently
          prefLanguage: searchPrefs.prefLanguage,
          prefTextMaxLength: searchPrefs.prefTextMaxLength,
        },
      });
    }

    // Attempt to find a match
    return tryFindMatch(user, searchPrefs);
  };

  // Cleans up the search queue by removing users who haven't pinged in time
  const cleanUpQueue = (now: number) => {
    for (let i = searchQueue.length - 1; i >= 0; i--) {
      if (now - searchQueue[i].lastPing > PING_TIMEOUT) {
        searchQueue.splice(i, 1); // Remove player if they haven't pinged within PING_TIMEOUT
      }
    }
  };

  // Tries to find a match for the user based on their search preferences
  const tryFindMatch = async (user: User, searchPrefs: SearchPrefs) => {
    const matchIndex = searchQueue.findIndex(
      (entry) =>
        entry.user.id !== user.id &&
        entry.prefs.prefLanguage === searchPrefs.prefLanguage &&
        entry.prefs.prefTextMaxLength === searchPrefs.prefTextMaxLength
    );

    if (matchIndex !== -1) {
      const opponent = searchQueue[matchIndex].user;

      // Create consistent room ID
      const roomId = `room_${[user.id, opponent.id].sort().join('_')}`;

      // Check if the room already exists in the database
      const existingRoom = await prisma.room.findUnique({
        where: { roomId },
      });

      if (existingRoom) {
        return {
          status: 'success',
          room: existingRoom,
          opponent,
        };
      }

      // Create a new room if it doesn't exist
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

      // Remove both users from the queue
      searchQueue.splice(matchIndex, 1);
      searchQueue.splice(
        searchQueue.findIndex((entry) => entry.user.id === user.id),
        1
      );

      return {
        status: 'success',
        room,
        opponent,
      };
    }

    return null; // No match found yet
  };
