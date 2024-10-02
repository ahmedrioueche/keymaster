import { NextResponse } from 'next/server';
import { updateUser } from '../../../services/userService';

export async function POST(request: Request) {
    try {
        const { id, data } = await request.json();

        const result = await updateUser(id, data);
        
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error updating user in route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
