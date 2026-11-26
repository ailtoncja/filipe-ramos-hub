import { CatalogExplorer } from '@/components/catalog-explorer';
import { CARE_PACKAGES } from '@/data/care-packages';
import { ehFonteOficial, FONTES } from '@/data/fontes';
import { filtrarCatalogo } from '@/lib/catalog';
import { carregarCatalogoServidor } from '@/lib/catalog.server';
import type {
  FiltroCategoriaFonte,
  OrdemCatalogo,
  TipoCatalogo,
} from '@/lib/types';

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function primeiroValor(val: string | string[] | undefined): string {
  return Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [params, catalogo] = await Promise.all([
    searchParams,
    carregarCatalogoServidor(),
  ]);

  const tipoRaw = primeiroValor(params.tipo);
  const tipo: TipoCatalogo = tipoRaw === 'playlists' ? 'playlists' : 'videos';
  const busca = primeiroValor(params.q);
  const fonte = primeiroValor(params.fonte);
  const canaisRaw = primeiroValor(params.canais);
  const categoriaFonte: FiltroCategoriaFonte =
    canaisRaw === 'oficiais' || primeiroValor(params.oficiais) === '1'
      ? 'oficiais'
      : canaisRaw === 'nao-oficiais'
        ? 'nao-oficiais'
        : 'todos';
  const ordemRaw = primeiroValor(params.ordem);
  const ordem: OrdemCatalogo =
    ordemRaw === 'antigos' || (ordemRaw === 'vistos' && tipo === 'videos')
      ? ordemRaw
      : 'recentes';
  const playId = primeiroValor(params.play);

  const filtrados = filtrarCatalogo(catalogo, {
    tipo,
    busca,
    fonte,
    categoriaFonte,
    ordem,
  });
  const initialItems = filtrados.slice(0, 25);
  const listaBase = tipo === 'playlists' ? catalogo.playlists : catalogo.videos;
  const initialPlayItem = playId
    ? (listaBase.find((item) => item.id === playId) ?? null)
    : null;

  const spotlightVideo =
    catalogo.videos.find((v) => ehFonteOficial(v.fontes)) ??
    catalogo.videos[0] ??
    null;

  return (
    <CatalogExplorer
      initialItems={initialItems}
      initialTotal={filtrados.length}
      spotlightVideo={spotlightVideo}
      totalVideos={catalogo.videos.length}
      totalPlaylists={catalogo.playlists.length}
      totalFontes={FONTES.length}
      totalCarePackages={CARE_PACKAGES.length}
      atualizadoEm={catalogo.atualizadoEm}
      initialTipo={tipo}
      initialBusca={busca}
      initialFonte={fonte}
      initialCategoriaFonte={categoriaFonte}
      initialOrdem={ordem}
      initialPlayItem={initialPlayItem}
    />
  );
}
