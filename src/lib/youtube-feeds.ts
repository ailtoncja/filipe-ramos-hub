import { PLAYLISTS_OCULTAS_SET, VIDEOS_OCULTOS_SET } from '@/data/ocultos';
import type { Catalogo, Fonte, PlaylistCatalogo, VideoCatalogo } from './types';

const ENTRY_RE = /<entry>([\s\S]*?)<\/entry>/g;
const VIDEO_ID_RE = /<yt:videoId>([^<]+)<\/yt:videoId>/;
const TITLE_RE = /<title>([^<]*)<\/title>/;
const DESC_RE = /<media:description>([\s\S]*?)<\/media:description>/;
const AUTHOR_RE = /<author>\s*<name>([^<]*)<\/name>/;
const PUBLISHED_RE = /<published>([^<]+)<\/published>/;
const VIEWS_RE = /<media:statistics[^>]*views="(\d+)"/;

function decodeXmlEntities(texto: string): string {
  return texto
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function parseYoutubeAtomFeed(
  xml: string,
  fonteNome: string,
): {
  tituloFeed: string;
  publicadoEmFeed: string | null;
  videos: VideoCatalogo[];
} {
  const tituloFeed = decodeXmlEntities(xml.match(TITLE_RE)?.[1] ?? '');
  const rawFeedPub = xml.match(PUBLISHED_RE)?.[1];
  const publicadoEmFeed = rawFeedPub
    ? new Date(rawFeedPub).toISOString().replace('.000Z', 'Z')
    : null;

  const videos: VideoCatalogo[] = [];
  for (const match of xml.matchAll(ENTRY_RE)) {
    const block = match[1];
    const id = block.match(VIDEO_ID_RE)?.[1]?.trim();
    if (!id) continue;

    const titulo = decodeXmlEntities(block.match(TITLE_RE)?.[1] ?? '').trim();
    if (!titulo || titulo === 'Private video' || titulo === 'Deleted video') {
      continue;
    }

    const descricao = decodeXmlEntities(block.match(DESC_RE)?.[1] ?? '');
    const canal = decodeXmlEntities(block.match(AUTHOR_RE)?.[1] ?? fonteNome);
    const rawPublished = block.match(PUBLISHED_RE)?.[1];
    const parsedDate = rawPublished ? new Date(rawPublished) : null;
    const publicadoEm =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString().replace('.000Z', 'Z')
        : new Date().toISOString().replace('.000Z', 'Z');

    const viewsRaw = block.match(VIEWS_RE)?.[1];
    const visualizacoes =
      viewsRaw && Number.isSafeInteger(Number(viewsRaw))
        ? Number(viewsRaw)
        : undefined;

    videos.push({
      id,
      titulo,
      descricao,
      canal,
      fontes: [fonteNome],
      publicadoEm,
      miniatura: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      ...(visualizacoes !== undefined ? { visualizacoes } : {}),
    });
  }

  return { tituloFeed, publicadoEmFeed, videos };
}

export interface AlvoFeedFonte {
  fonte: Fonte;
  url: string;
  playlistId?: string;
}

export function urlFeedDaFonte(fonte: Fonte): string | null {
  if (fonte.playlistId) {
    return `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(fonte.playlistId)}`;
  }
  if (fonte.channelId) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(fonte.channelId)}`;
  }
  return null;
}

export function urlsFeedDaFonte(fonte: Fonte): AlvoFeedFonte[] {
  if (fonte.playlistIds?.length) {
    return fonte.playlistIds.map((playlistId) => ({
      fonte,
      playlistId,
      url: `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`,
    }));
  }
  const url = urlFeedDaFonte(fonte);
  if (!url) return [];
  return [{ fonte, url, ...(fonte.playlistId ? { playlistId: fonte.playlistId } : {}) }];
}

export interface ResultadoSyncFeeds {
  videos: VideoCatalogo[];
  playlistsAtualizadas: PlaylistCatalogo[];
  sincronizadoEm: string;
  fontesComSucesso: number;
}

const YT_INITIAL_DATA_RE = /var ytInitialData = (\{[\s\S]*?\});<\/script>/;
const PLAYLIST_COUNT_RE = /"text":"(\d[\d.,]*)\s*(?:v[ií]deo|video)/i;

function extrairNumero(texto: string | undefined): number {
  if (!texto) return 0;
  const digitos = texto.replace(/\D/g, '');
  const n = Number(digitos);
  return Number.isSafeInteger(n) ? n : 0;
}

/**
 * Extrai playlists públicas da página `/channel/<id>/playlists` (sem API key),
 * capturando playlists novas e a contagem atualizada de vídeos das playlists existentes.
 */
export function parseYoutubeChannelPlaylistsHtml(
  html: string,
  fonte: Fonte,
  fallbackIso: string,
): PlaylistCatalogo[] {
  const match = html.match(YT_INITIAL_DATA_RE);
  if (!match) return [];

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(match[1]) as Record<string, unknown>;
  } catch {
    return [];
  }

  const encontrados = new Map<string, PlaylistCatalogo>();

  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    const rec = node as Record<string, unknown>;

    if (rec.lockupViewModel && typeof rec.lockupViewModel === 'object') {
      const lm = rec.lockupViewModel as Record<string, unknown>;
      if (lm.contentType === 'LOCKUP_CONTENT_TYPE_PLAYLIST') {
        const id = typeof lm.contentId === 'string' ? lm.contentId : '';
        const meta = lm.metadata as
          | { lockupMetadataViewModel?: { title?: { content?: string } } }
          | undefined;
        const titulo = meta?.lockupMetadataViewModel?.title?.content?.trim() ?? '';
        const contentImg = lm.contentImage as
          | {
              collectionThumbnailViewModel?: {
                primaryThumbnail?: {
                  thumbnailViewModel?: {
                    image?: { sources?: { url?: string }[] };
                  };
                };
              };
            }
          | undefined;
        const miniatura =
          contentImg?.collectionThumbnailViewModel?.primaryThumbnail
            ?.thumbnailViewModel?.image?.sources?.[0]?.url ?? '';
        const badgeMatch = JSON.stringify(lm.contentImage ?? {}).match(
          PLAYLIST_COUNT_RE,
        );
        const quantidadeVideos = extrairNumero(badgeMatch?.[1]);

        if (id && titulo && !encontrados.has(id)) {
          encontrados.set(id, {
            id,
            titulo,
            descricao: '',
            canal: fonte.nomeExibicao,
            fontes: [fonte.nome],
            publicadoEm: fallbackIso,
            miniatura,
            quantidadeVideos,
          });
        }
      }
    }

    if (rec.gridPlaylistRenderer && typeof rec.gridPlaylistRenderer === 'object') {
      const r = rec.gridPlaylistRenderer as {
        playlistId?: string;
        title?: { runs?: { text?: string }[]; simpleText?: string };
        videoCountShortText?: { simpleText?: string };
        videoCountText?: { runs?: { text?: string }[] };
        thumbnail?: { thumbnails?: { url?: string }[] };
      };
      const id = r.playlistId ?? '';
      const titulo = (r.title?.runs?.[0]?.text ?? r.title?.simpleText ?? '').trim();
      const quantidadeVideos = extrairNumero(
        r.videoCountShortText?.simpleText ?? r.videoCountText?.runs?.[0]?.text,
      );
      const miniatura = r.thumbnail?.thumbnails?.[0]?.url ?? '';

      if (id && titulo && !encontrados.has(id)) {
        encontrados.set(id, {
          id,
          titulo,
          descricao: '',
          canal: fonte.nomeExibicao,
          fontes: [fonte.nome],
          publicadoEm: fallbackIso,
          miniatura,
          quantidadeVideos,
        });
      }
    }

    for (const val of Object.values(rec)) walk(val);
  };

  walk(data.contents);
  return [...encontrados.values()];
}

export function mesclarNovidadesNoCatalogo(
  base: Catalogo,
  sync: ResultadoSyncFeeds,
): Catalogo {
  if (sync.fontesComSucesso === 0) return base;

  const videosPorId = new Map<string, VideoCatalogo>(
    base.videos
      .filter((v) => !VIDEOS_OCULTOS_SET.has(v.id))
      .map((v) => [v.id, { ...v, fontes: [...v.fontes] }]),
  );

  for (const novo of sync.videos) {
    if (VIDEOS_OCULTOS_SET.has(novo.id)) continue;
    const existente = videosPorId.get(novo.id);
    if (existente) {
      for (const f of novo.fontes) {
        if (!existente.fontes.includes(f)) existente.fontes.push(f);
      }
      if (
        novo.visualizacoes != null &&
        (existente.visualizacoes == null ||
          novo.visualizacoes > existente.visualizacoes)
      ) {
        existente.visualizacoes = novo.visualizacoes;
      }
      if (!existente.descricao && novo.descricao) {
        existente.descricao = novo.descricao;
      }
    } else {
      videosPorId.set(novo.id, novo);
    }
  }

  const playlistsPorId = new Map<string, PlaylistCatalogo>(
    base.playlists
      .filter((p) => !PLAYLISTS_OCULTAS_SET.has(p.id))
      .map((p) => [p.id, { ...p, fontes: [...p.fontes] }]),
  );

  for (const pl of sync.playlistsAtualizadas) {
    if (PLAYLISTS_OCULTAS_SET.has(pl.id)) continue;
    const existente = playlistsPorId.get(pl.id);
    if (existente) {
      for (const f of pl.fontes) {
        if (!existente.fontes.includes(f)) existente.fontes.push(f);
      }
      if (pl.quantidadeVideos > 0) {
        existente.quantidadeVideos = pl.quantidadeVideos;
      }
      if (pl.titulo) {
        existente.titulo = pl.titulo;
      }
      if (pl.miniatura) {
        existente.miniatura = pl.miniatura;
      }
    } else {
      playlistsPorId.set(pl.id, pl);
    }
  }

  return {
    atualizadoEm: sync.sincronizadoEm,
    videos: [...videosPorId.values()].toSorted((a, b) =>
      b.publicadoEm.localeCompare(a.publicadoEm),
    ),
    playlists: [...playlistsPorId.values()].toSorted((a, b) =>
      b.publicadoEm.localeCompare(a.publicadoEm),
    ),
  };
}
