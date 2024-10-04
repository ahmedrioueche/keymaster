// app/api/migrate/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Example: Add a new column or make schema changes
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`; // Enable extension if needed
    // await prisma.$executeRaw`ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "new_column" text;`; // Adjust as per your changes

    // You can also run any migrations or setup scripts here
    
    return NextResponse.json({ message: 'Migration executed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
