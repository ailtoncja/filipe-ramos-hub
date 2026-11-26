import { NextResponse } from 'next/server';
import { carregarCatalogoAoVivo } from '@/lib/catalog.server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forcar = searchParams.get('refresh') === '1';

  const catalogo = await carregarCatalogoAoVivo(forcar);

  return NextResponse.json(catalogo, {
    headers: {
      'Cache-Control': forcar
        ? 'no-store'
        : 'public, s-maxage=180, stale-while-revalidate=600',
    },
  });
}
