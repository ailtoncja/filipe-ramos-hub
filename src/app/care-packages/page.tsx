import type { Metadata } from 'next';
import { CarePackagesDirectory } from '@/components/care-packages-directory';
import { CARE_PACKAGES } from '@/data/care-packages';
import { FILTROS_CARE_PACKAGES } from '@/lib/care-packages';
import { encontrarPlaylistsDoJogo } from '@/lib/catalog';
import { carregarCatalogoServidor } from '@/lib/catalog.server';
import type { TipoRecursoChave } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Care Packages',
  description:
    'Mods, mapas, retexturas, guias de instalação e lives/playlists organizadas por jogo do Filipe Ramos.',
};

interface CarePackagesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CHAVES_VALIDAS = new Set<string>(FILTROS_CARE_PACKAGES.map((f) => f.chave));

function primeiroValor(val: string | string[] | undefined): string {
  return Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
}

export default async function CarePackagesPage({
  searchParams,
}: CarePackagesPageProps) {
  const [params, catalogo] = await Promise.all([
    searchParams,
    carregarCatalogoServidor(),
  ]);

  const initialBusca = primeiroValor(params.q);
  const filtrosRaw = primeiroValor(params.filtros);
  const initialFiltros = filtrosRaw
    .split(',')
    .map((f) => f.trim())
    .filter((f): f is TipoRecursoChave => CHAVES_VALIDAS.has(f));

  const playlistsCountPorSlug: Record<string, number> = {};
  for (const cp of CARE_PACKAGES) {
    const urlsCuradas = [
      ...(cp.lives?.fontes.map((f) => f.url) ?? []),
      ...(cp.videosOficiais?.fontes.map((f) => f.url) ?? []),
    ];
    playlistsCountPorSlug[cp.slug] = encontrarPlaylistsDoJogo(
      cp.jogo,
      catalogo.playlists,
      urlsCuradas,
    ).length;
  }

  return (
    <CarePackagesDirectory
      initialBusca={initialBusca}
      initialFiltros={initialFiltros}
      playlistsCountPorSlug={playlistsCountPorSlug}
    />
  );
}
