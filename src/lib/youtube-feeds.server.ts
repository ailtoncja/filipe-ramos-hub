import { FONTES } from '@/data/fontes';
import type { PlaylistCatalogo, VideoCatalogo } from './types';
import {
  parseYoutubeAtomFeed,
  parseYoutubeChannelPlaylistsHtml,
  type ResultadoSyncFeeds,
  urlFeedDaFonte,
} from './youtube-feeds';

const VIDEO_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos para vídeos
const PLAYLIST_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos para descoberta/contagem de playlists dos canais
const FORCE_COOLDOWN_MS = 30 * 1000; // 30s de proteção contra cliques repetidos
const FEED_TIMEOUT_MS = 4000;
const PLAYLIST_PAGE_TIMEOUT_MS = 4500;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

let cacheSync: {
  dados: ResultadoSyncFeeds;
  expiraEm: number;
  buscadoEm: number;
} | null = null;
let cachePlaylistsCanais: {
  playlists: PlaylistCatalogo[];
  expiraEm: number;
} | null = null;
let syncEmAndamento: Promise<ResultadoSyncFeeds> | null = null;

async function buscarPlaylistsDosCanais(
  forcar: boolean,
  agoraIso: string,
): Promise<PlaylistCatalogo[]> {
  const agora = Date.now();
  if (!forcar && cachePlaylistsCanais && agora < cachePlaylistsCanais.expiraEm) {
    return cachePlaylistsCanais.playlists;
  }

  const canais = FONTES.filter((f) => Boolean(f.channelId));
  const resultados = await Promise.allSettled(
    canais.map(async (fonte) => {
      const res = await fetch(
        `https://www.youtube.com/channel/${encodeURIComponent(fonte.channelId!)}/playlists`,
        {
          signal: AbortSignal.timeout(PLAYLIST_PAGE_TIMEOUT_MS),
          cache: 'no-store',
          headers: BROWSER_HEADERS,
        },
      );
      if (!res.ok) throw new Error(`Playlists HTTP ${res.status}`);
      const html = await res.text();
      return parseYoutubeChannelPlaylistsHtml(html, fonte, agoraIso);
    }),
  );

  const playlists: PlaylistCatalogo[] = [];
  for (const res of resultados) {
    if (res.status === 'fulfilled') {
      playlists.push(...res.value);
    }
  }

  if (playlists.length > 0) {
    cachePlaylistsCanais = {
      playlists,
      expiraEm: Date.now() + PLAYLIST_CACHE_TTL_MS,
    };
  }

  return playlists;
}

async function buscarFeedsEmParalelo(
  forcar: boolean,
): Promise<ResultadoSyncFeeds> {
  const agoraIso = new Date().toISOString();
  const alvos = FONTES.map((fonte) => ({ fonte, url: urlFeedDaFonte(fonte) })).filter(
    (item): item is { fonte: (typeof FONTES)[number]; url: string } =>
      Boolean(item.url),
  );

  const [resultadosFeeds, playlistsCanais] = await Promise.all([
    Promise.allSettled(
      alvos.map(async ({ fonte, url }) => {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
          cache: 'no-store',
          headers: { Accept: 'application/atom+xml, application/xml, text/xml' },
        });
        if (!response.ok) throw new Error(`Feed HTTP ${response.status}`);
        const xml = await response.text();
        return { fonte, parsed: parseYoutubeAtomFeed(xml, fonte.nome) };
      }),
    ),
    buscarPlaylistsDosCanais(forcar, agoraIso),
  ]);

  const videos: VideoCatalogo[] = [];
  const playlistsAtualizadas: PlaylistCatalogo[] = [...playlistsCanais];
  let fontesComSucesso = playlistsCanais.length > 0 ? 1 : 0;

  for (const res of resultadosFeeds) {
    if (res.status !== 'fulfilled') continue;
    fontesComSucesso++;
    const { fonte, parsed } = res.value;
    videos.push(...parsed.videos);

    if (fonte.playlistId && parsed.videos.length > 0) {
      playlistsAtualizadas.push({
        id: fonte.playlistId,
        titulo: parsed.tituloFeed || fonte.nomeExibicao,
        descricao: fonte.descricao,
        canal: fonte.nomeExibicao,
        fontes: [fonte.nome],
        publicadoEm: parsed.publicadoEmFeed ?? parsed.videos[0].publicadoEm,
        miniatura: parsed.videos[0].miniatura,
        quantidadeVideos: parsed.videos.length,
      });
    }
  }

  return {
    videos,
    playlistsAtualizadas,
    sincronizadoEm: agoraIso,
    fontesComSucesso,
  };
}

export async function buscarNovidadesFeedsAoVivo(
  forcar = false,
): Promise<ResultadoSyncFeeds> {
  const agora = Date.now();
  if (cacheSync) {
    const dentroDoCache = agora < cacheSync.expiraEm;
    const dentroDoCooldown = agora - cacheSync.buscadoEm < FORCE_COOLDOWN_MS;
    if ((!forcar && dentroDoCache) || (forcar && dentroDoCooldown)) {
      return cacheSync.dados;
    }
  }

  if (!syncEmAndamento) {
    syncEmAndamento = buscarFeedsEmParalelo(forcar)
      .then((dados) => {
        const ts = Date.now();
        if (dados.fontesComSucesso > 0) {
          cacheSync = {
            dados,
            buscadoEm: ts,
            expiraEm: ts + VIDEO_CACHE_TTL_MS,
          };
        }
        return dados;
      })
      .finally(() => {
        syncEmAndamento = null;
      });
  }

  return syncEmAndamento;
}
