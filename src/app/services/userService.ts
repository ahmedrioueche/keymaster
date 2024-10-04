  import { Settings, User } from "../types/types";
  import prisma from "../utils/prisma";
  import bcrypt from 'bcrypt';
import { defaultTextLength } from "../utils/settings";

  export const insertUser = async (user: User) => {
    try {
      const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : null;
  
      // Insert user into the database
      const newUser = await prisma.user.create({
        data: {
          username: user.username,
          password: hashedPassword,
          rank: user.rank ?? null,
          speed: user.speed ?? null,
          lastEntryDate: user.lastEntryDate ? new Date(user.lastEntryDate) : null,
          typingStats: {
            create: user.typingStats?.map(stat => ({
              accuracy: stat.accuracy,
              speed: stat.speed,
            })) || [],
          },
          settings: {
            create: {
              language: "en",
              mode: "manual",
              textLength: defaultTextLength,
              soundEffects: true,
              difficultyLevel: "intermediate",
            },
          },
        },
      });
  
      // Now fetch the user along with the settings to return everything
      const insertedUserWithSettings = await prisma.user.findUnique({
        where: {
          id: newUser.id, // Use the newly inserted user's ID
        },
        include: {
          settings: true, // Include settings relation in the return
        },
      });
  
      console.log('User and settings inserted successfully:', insertedUserWithSettings);
      return insertedUserWithSettings;
    } catch (error) {
      console.error('Error inserting user:', error);
      throw error;
    }
  };
  

  export const getUsers = async () => {
    try {
      const users = await prisma.user.findMany({
        include: {
          settings: true, 
        },
      });
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  };
  
  export const getUserById = async (id: number) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id }, // Find user by id
        include: { typingStats: true }, // Optionally include related typingStats
      });

      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }

      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  };

  export const updateUser = async (id: number, data: Partial<User>) => {
    try {
      const updateData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
        username: data.username,
        password: data.password,
        speed: data.speed,
        rank: data.rank,
      };
  
      // Convert lastEntryDate to ISO-8601 if present
      if (data.lastEntryDate) {
        const date = new Date(data.lastEntryDate);
        updateData.lastEntryDate = date.toISOString(); // Convert to ISO-8601
      }
  
      // Handle updating typingStats separately
      if (data.typingStats) {
        updateData.typingStats = {
          upsert: data.typingStats.map((stat) => ({
            where: { id: stat.id || -1 }, // Ensure id exists or provide a fallback
            create: {
              accuracy: stat.accuracy,
              speed: stat.speed,
            },
            update: {
              accuracy: stat.accuracy,
              speed: stat.speed,
            },
          })),
        };
      }
  
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
  
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
  
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  export const authenticateUser = async (user: User) => {
    try {
      // Fetch the user from the database
      const existingUser = await prisma.user.findUnique({
        where: {
          username: user.username, 
        },
        include: {
          settings: true,
        }
      });
  
      // Check if the user exists
      if (!existingUser) {
        throw new Error('User not found');
      }
  
      // Compare the provided password with the hashed password in the database
      const isPasswordValid = (user.password &&  existingUser.password)? await bcrypt.compare(user.password, existingUser.password) : null;
      
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
  
      // If authentication is successful, return the user data (omit password for security)
      const { password, ...userData } = existingUser; //eslint-disable-line @typescript-eslint/no-unused-vars
      return userData;
  
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error; // Rethrow the error to be handled by the calling function
    } 
  };
  
  export const setSettings = async (id: number, settings: Partial<Settings>) => {
    try {
      const updateData: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  
      // Build update data based on provided settings
      if (settings.language) updateData.language = settings.language;
      if (settings.mode) updateData.mode = settings.mode;
      if (settings.textLength) updateData.textLength = settings.textLength;
      if (settings.soundEffects !== undefined) updateData.soundEffects = settings.soundEffects; // boolean can be false
      if (settings.difficultyLevel) updateData.difficultyLevel = settings.difficultyLevel;
  
      // Use upsert to either update or create settings in the database
      const upsertedSettings = await prisma.settings.upsert({
        where: { userId: id }, // Assuming userId is the foreign key in settings
        update: updateData,
        create: {
          userId: id, // Ensure the userId is set when creating a new record
          ...updateData, // Spread the updateData to include other settings
        },
      });
  
      console.log('Settings updated or created successfully:', upsertedSettings);
      return upsertedSettings;
    } catch (error) {
      console.error('Error setting settings:', error);
      throw error;
    }
  };
  