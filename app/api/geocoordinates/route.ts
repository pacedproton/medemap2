// app/api/geo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/server-reldb'; 

export async function GET(req: NextRequest) {
    console.log('[debug] globeData.ts: GET() called');

    if (req.method !== 'GET') {
        return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        const db = await connectToDatabase();
        const { rows } = await db.query('SELECT * FROM medemap_aug.geocoordinates');
        return new NextResponse(JSON.stringify(rows), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching globe data:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch globe data' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
