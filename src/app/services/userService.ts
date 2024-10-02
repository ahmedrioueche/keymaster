  import { User } from "../types/types";
  import prisma from "../utils/prisma";
  import bcrypt from 'bcrypt';

  export const insertUser = async (user: User) => {
   try {
    const hashedPassword = user.password? await bcrypt.hash(user.password, 10) : null; // Hash with 10 salt rounds
     // Insert user into the database
     const newUser = await prisma.user.create({
       data: {
         name: user.name,
         password: hashedPassword,
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
        name: data.name,
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
              userId: id, // Reference to the user being updated
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
  