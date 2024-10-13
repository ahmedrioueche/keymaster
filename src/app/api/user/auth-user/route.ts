import { NextResponse } from 'next/server';
import { authenticateUser } from '../../../../services/userService';

export async function POST(request: Request) {
    try {
        const { user } = await request.json();

        const userData = await authenticateUser(user);
        
        return NextResponse.json({userData : userData}, { status: 200 });
    } catch (error) {
        console.error('Error authenticating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
