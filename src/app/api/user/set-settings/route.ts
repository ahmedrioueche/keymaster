import { NextResponse } from 'next/server';
import { setSettings } from '../../../../services/userService';

export async function POST(request: Request) {
    try {
        const { id, settings } = await request.json();

        const result = await setSettings(id, settings);
        
        return NextResponse.json({userData: result}, { status: 200 });
    } catch (error) {
        console.error('Error setting user settings in route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
