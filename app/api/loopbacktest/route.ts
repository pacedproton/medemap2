// app/api/loopbacktest/route.ts

import { NextResponse } from 'next/server';

export async function GET(request) {
    console.log('[debug] nested route.ts: GET() called')
    return NextResponse.json({ message: 'nested route.ts: GET() called' }, { status: 200 });
}
