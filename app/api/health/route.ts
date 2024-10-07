import { NextResponse } from 'next/server';
import { fetchMedeMapData } from '../../../lib/features/medemap/medeMapSlice';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const probe = searchParams.get('probe');

  switch (probe) {
    case 'readiness':
      try {
        const data = await fetchMedeMapData();
        const supplyData = data.supply_side;
        if (supplyData && supplyData.some(item => 'local_media' in item)) {
          return NextResponse.json({ status: 'ready' }, { status: 200 });
        } else {
          return NextResponse.json({ status: 'not ready' }, { status: 503 });
        }
      } catch (error) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
      }

    case 'liveness':
      // assume the app is alive if this endpoint is reachable
      return NextResponse.json({ status: 'alive' }, { status: 200 });

    case 'startup':
      // check if the server is running, which it is if this endpoint is reachable
      return NextResponse.json({ status: 'started' }, { status: 200 });

    default:
      return NextResponse.json({ error: 'Invalid probe type' }, { status: 400 });
  }
}