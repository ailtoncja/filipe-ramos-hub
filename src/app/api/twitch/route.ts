import { NextResponse } from 'next/server';
import { buscarStatusTransmissaoTwitch } from '@/lib/twitch.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await buscarStatusTransmissaoTwitch();
  return NextResponse.json(
    { status },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    },
  );
}
