import { NextResponse } from 'next/server';
import { getUsers } from '../../../services/userService';

export async function POST() {
    try {
        const result = await getUsers();
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error getting users in route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
    