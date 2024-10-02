  import { User } from "../types/types";
  import prisma from "../utils/prisma";

  export const insertUser = async (user: User) => {
    console.log("user", user);
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

  export const getUsers = async () => {
      try {
        const users = await prisma.user.findMany(); // Use findMany to get all users
        return users;
      } catch (error) {
        console.error('Error getting users:', error);
        throw error;
      }
  };

    // Get a user by their ID
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

    