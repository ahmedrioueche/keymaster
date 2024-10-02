// Import Prisma Client
import { PrismaClient } from '@prisma/client';
import { User } from "../types/types";

// Initialize Prisma Client
const prisma = new PrismaClient();

export const insertUser = async (user: User) => {
  try {
    // Insert user into the database
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        rank: user.rank ?? null, // Optional field
        speed: user.speed ?? null, // Optional field
        lastEntryDate: user.lastEntryDate ? new Date(user.lastEntryDate) : null, // Optional field and converted to Date type
        typingStats: {
          create: user.typingStats?.map(stat => ({
            accuracy: stat.accuracy,
            speed: stat.speed
          })) || [] // Handle optional typingStats field
        }
      }
    });

    console.log('User inserted successfully:', newUser);
    return newUser;
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
};