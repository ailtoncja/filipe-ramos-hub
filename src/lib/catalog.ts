import { EXTRAS_CATALOGO } from '@/data/extras-catalogo';
import { ehFonteOficial } from '@/data/fontes';
import {
  type CampoIndexado,
  indexarCampoBusca,
  pontuarCampoBusca,
  prepararConsultaBusca,
} from './search';
import { normalizarTexto } from './text';
import type {
  Catalogo,
  FiltroCategoriaFonte,
  OrdemCatalogo,
  PlaylistCatalogo,
  TipoCatalogo,
  VideoCatalogo,
} from './types';

interface IndiceItemCatalogo {
  principal: CampoIndexado;
  completo: CampoIndexado;
}

const CACHE_INDICE_CATALOGO = new WeakMap<
  VideoCatalogo | PlaylistCatalogo,
  IndiceItemCatalogo
>();

function obterIndiceItem(
  item: VideoCatalogo | PlaylistCatalogo,
): IndiceItemCatalogo {
  let indice = CACHE_INDICE_CATALOGO.get(item);
  if (!indice) {
    const tituloECanal = `${item.titulo} ${item.canal}`;
    indice = {
      principal: indexarCampoBusca(tituloECanal),
      completo: indexarCampoBusca(`${tituloECanal} ${item.descricao}`),
    };
    CACHE_INDICE_CATALOGO.set(item, indice);
  }
  return indice;
}

export interface FiltroCatalogoParams {
  tipo: TipoCatalogo;
  busca: string;
  fonte: string;
  categoriaFonte?: FiltroCategoriaFonte;
  somenteOficiais?: boolean;
  ordem: OrdemCatalogo;
}

export function mesclarExtrasCatalogo(catalogo: Catalogo): Catalogo {
  const existentes = new Set(catalogo.videos.map((v) => v.id));
  const adicionais = EXTRAS_CATALOGO.filter((extra) => !existentes.has(extra.id));
  if (adicionais.length === 0) return catalogo;

  return {
    ...catalogo,
    videos: [...catalogo.videos, ...adicionais].sort((a, b) =>
      b.publicadoEm.localeCompare(a.publicadoEm),
    ),
  };
}

export function filtrarCatalogo(
  catalogo: Catalogo,
  params: FiltroCatalogoParams,
): (VideoCatalogo | PlaylistCatalogo)[] {
  const consulta = prepararConsultaBusca(params.busca);
  const temBusca = consulta.termos.length > 0;
  const fonte = params.fonte.trim();
  const categoriaEfetiva: FiltroCategoriaFonte =
    params.categoriaFonte ?? (params.somenteOficiais ? 'oficiais' : 'todos');
  const itens: (VideoCatalogo | PlaylistCatalogo)[] =
    params.tipo === 'playlists' ? catalogo.playlists : catalogo.videos;

  const pontuados: {
    item: VideoCatalogo | PlaylistCatalogo;
    noTitulo: number;
  }[] = [];

  for (const item of itens) {
    if (categoriaEfetiva === 'oficiais' && !ehFonteOficial(item.fontes)) {
      continue;
    }
    if (categoriaEfetiva === 'nao-oficiais' && ehFonteOficial(item.fontes)) {
      continue;
    }
    if (fonte && !item.fontes.includes(fonte)) {
      continue;
    }
    if (!temBusca) {
      pontuados.push({ item, noTitulo: 0 });
      continue;
    }

    const indice = obterIndiceItem(item);
    const pontosTitulo = pontuarCampoBusca(consulta, indice.principal);
    if (pontosTitulo > 0) {
      pontuados.push({ item, noTitulo: 1 });
      continue;
    }

    const pontosCompleto = pontuarCampoBusca(consulta, indice.completo);
    if (pontosCompleto > 0) {
      pontuados.push({ item, noTitulo: 0 });
    }
  }

  const ordemEfetiva: OrdemCatalogo =
    params.tipo === 'playlists' && params.ordem === 'vistos' ? 'recentes' : params.ordem;

  pontuados.sort((a, b) => {
    // Quando há busca ativa, vídeos cujo título/canal corresponde vêm antes dos que só mencionam na descrição.
    if (temBusca && b.noTitulo !== a.noTitulo) {
      return b.noTitulo - a.noTitulo;
    }
    if (ordemEfetiva === 'vistos') {
      return (
        (b.item.visualizacoes ?? -1) - (a.item.visualizacoes ?? -1) ||
        b.item.publicadoEm.localeCompare(a.item.publicadoEm)
      );
    }
    if (ordemEfetiva === 'antigos') {
      return a.item.publicadoEm.localeCompare(b.item.publicadoEm);
    }
    return b.item.publicadoEm.localeCompare(a.item.publicadoEm);
  });

  return pontuados.map((entrada) => entrada.item);
}

const ALIASES_JOGO: Record<string, string[]> = {
  'Resident Evil 4 (Clássico)': ['resident evil 4', 're4'],
  'Resident Evil 4 Remake': ['resident evil 4 remake', 're4 remake'],
  'GTA IV': ['gta iv', 'gta 4'],
  'GTA: San Andreas': ['gta san andreas', 'san andreas'],
  'GTA San Andreas: Enhanced Edition': ['gta san andreas', 'san andreas'],
  'Lightning Returns: Final Fantasy XIII': ['lightning returns', 'final fantasy xiii-3', 'ffxiii-3'],
  'Final Fantasy XIII': ['final fantasy xiii', 'ffxiii'],
  'Final Fantasy XII': ['final fantasy xii', 'ffxii'],
  'The Witcher 3: Wild Hunt': ['the witcher 3', 'witcher 3'],
  'Watch Dogs': ['watch dogs', 'watch_dogs'],
  'S.T.A.L.K.E.R.: Call of Pripyat': ['call of pripyat', 'stalker'],
  'S.T.A.L.K.E.R.: Clear Sky': ['clear sky', 'stalker'],
  'S.T.A.L.K.E.R.: Shadow of Chernobyl': ['shadow of chernobyl', 'stalker'],
  'The Elder Scrolls IV: Oblivion Remastered': ['oblivion'],
  "Baldur's Gate 3": ['baldurs gate 3', "baldur's gate 3", 'bg3'],
  'Need for Speed: Most Wanted': ['most wanted'],
  'Need for Speed: Underground 2': ['underground 2'],
  'Need for Speed (2015)': ['need for speed 2015', 'nfs 2015'],
  'Midnight Club 3: DUB Edition Remix': ['midnight club 3'],
  'Monster Hunter: World': ['monster hunter world', 'monster hunter: world'],
  'Yu-Gi-Oh! Forbidden Memories': ['forbidden memories'],
  'Yu-Gi-Oh! GX Tag Force': ['tag force'],
  'Yu-Gi-Oh! Capsule Monster Coliseum': ['capsule monster'],
};

/** Encontra playlists do Catálogo relacionadas a um jogo de Care Package sem duplicar URLs já curadas. */
export function encontrarPlaylistsDoJogo(
  jogo: string,
  playlists: PlaylistCatalogo[],
  urlsJaCuradas: Iterable<string> = [],
): PlaylistCatalogo[] {
  const idsCurados = new Set<string>();
  for (const url of urlsJaCuradas) {
    try {
      const listId = new URL(url).searchParams.get('list');
      if (listId) idsCurados.add(listId);
    } catch {
      // ignora URLs malformadas
    }
  }

  const termosPrincipais = ALIASES_JOGO[jogo] ?? [jogo];
  const alvosNormalizados = termosPrincipais.map((t) =>
    normalizarTexto(t).replace(/[^a-z0-9]+/g, ' ').trim(),
  );

  return playlists.filter((playlist) => {
    if (idsCurados.has(playlist.id)) return false;
    const titulo = normalizarTexto(playlist.titulo).replace(/[^a-z0-9]+/g, ' ').trim();
    const desc = normalizarTexto(playlist.descricao).replace(/[^a-z0-9]+/g, ' ').trim();
    return alvosNormalizados.some(
      (alvo) => alvo.length >= 3 && (titulo.includes(alvo) || desc.includes(alvo)),
    );
  });
}
