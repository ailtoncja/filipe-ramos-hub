import { normalizarParaBusca } from './search';
import type { VideoCatalogo } from './types';

export const MAX_VIDEOS_MARATONA = 50;

const VIDEO_ID_VALIDO_RE = /^[A-Za-z0-9_-]{6,20}$/;

const EPISODIO_PADROES = [
  /#\s*(\d{1,3})\b/i,
  /\b(?:pt|parte|ep|episodio|live)\.?\s*(\d{1,3})\b/i,
];

const SUBPARTE_RE = /\b(\d{1,2})\s*\/\s*(\d{1,2})\b/;
const PARTE_SECUNDARIA_RE = /\b(?:parte|pt)\.?\s*(\d{1,2})\b/i;

export interface InfoEpisodio {
  chaveBase: string;
  episodio: number | null;
  subparte: number | null;
}

/**
 * Extrai número de episódio, sub-parte (ex.: "1/2", "Parte 2") e título-base normalizado
 * para agrupar episódios da mesma Sequência dentro de uma mesma Fonte.
 */
export function extrairInfoEpisodio(titulo: string): InfoEpisodio {
  let episodio: number | null = null;
  let subparte: number | null = null;

  const semAcento = titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const re of EPISODIO_PADROES) {
    const m = semAcento.match(re);
    if (m) {
      episodio = Number.parseInt(m[1], 10);
      break;
    }
  }

  const subMatch = semAcento.match(SUBPARTE_RE);
  if (subMatch) {
    subparte = Number.parseInt(subMatch[1], 10);
  } else if (/#\s*\d+/.test(semAcento)) {
    const ptSec = semAcento.match(PARTE_SECUNDARIA_RE);
    if (ptSec) {
      subparte = Number.parseInt(ptSec[1], 10);
    }
  }

  // Remove numeração de episódio, sub-partes e sufixos comuns de live para gerar chave-base limpa
  const limpo = semAcento
    .replace(/\(\s*#\s*\d{1,3}\s*\)/gi, ' ')
    .replace(/#\s*\d{1,3}\b/gi, ' ')
    .replace(/\b(?:pt|parte|ep|episodio)\.?\s*\d{1,3}\b/gi, ' ')
    .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, ' ')
    .replace(/\(\s*live\s+do\s+filipe\s+ramos\s*\)/gi, ' ')
    .replace(/\bfinal\b/gi, ' ');

  const chaveBase = normalizarParaBusca(limpo);
  return { chaveBase, episodio, subparte };
}

function compararOrdemEpisodios(
  a: { video: VideoCatalogo; info: InfoEpisodio },
  b: { video: VideoCatalogo; info: InfoEpisodio },
): number {
  const epA = a.info.episodio;
  const epB = b.info.episodio;

  if (epA !== null && epB !== null && epA !== epB) {
    return epA - epB;
  }

  if (epA !== null && epB !== null && epA === epB) {
    const subA = a.info.subparte ?? 0;
    const subB = b.info.subparte ?? 0;
    if (subA !== subB) return subA - subB;
  }

  return a.video.publicadoEm.localeCompare(b.video.publicadoEm);
}

/**
 * Detecta automaticamente a Sequência de episódios de um Vídeo dentro da mesma Fonte.
 * Retorna lista ordenada (`#1 -> #N`) quando houver >= 2 vídeos correspondentes; caso contrário `[]`.
 */
export function encontrarSequenciaDoVideo(
  video: VideoCatalogo,
  todosVideos: VideoCatalogo[],
): VideoCatalogo[] {
  const infoAlvo = extrairInfoEpisodio(video.titulo);
  if (infoAlvo.chaveBase.length < 6) return [];

  const fontesAlvo = new Set(video.fontes);
  const fontePrincipal = video.fontes[0];

  const candidatos: { video: VideoCatalogo; info: InfoEpisodio }[] = [];

  for (const candidato of todosVideos) {
    const mesmaFonte = fontePrincipal
      ? candidato.fontes.includes(fontePrincipal)
      : candidato.fontes.some((f) => fontesAlvo.has(f));
    if (!mesmaFonte) continue;

    const info = extrairInfoEpisodio(candidato.titulo);
    if (info.chaveBase !== infoAlvo.chaveBase) continue;
    candidatos.push({ video: candidato, info });
  }

  if (candidatos.length < 2) return [];

  // Garante que ao menos um vídeo da sequência tenha numeração explícita (evita agrupar avulsos sem relação)
  const temNumerado = candidatos.some(
    (c) => c.info.episodio !== null || c.info.subparte !== null,
  );
  if (!temNumerado) return [];

  return candidatos
    .toSorted(compararOrdemEpisodios)
    .slice(0, MAX_VIDEOS_MARATONA)
    .map((c) => c.video);
}

/** Ordena uma lista de resultados de busca em ordem crescente (episódio/data) para maratonar. */
export function ordenarVideosParaMaratona(
  videos: VideoCatalogo[],
): VideoCatalogo[] {
  const selecionados = videos.slice(0, MAX_VIDEOS_MARATONA);
  return selecionados
    .map((video) => ({ video, info: extrairInfoEpisodio(video.titulo) }))
    .toSorted((a, b) => {
      // Se todos/ambos compartilham a mesma chave-base, ordena por episódio
      if (a.info.chaveBase === b.info.chaveBase) {
        return compararOrdemEpisodios(a, b);
      }
      return a.video.publicadoEm.localeCompare(b.video.publicadoEm);
    })
    .map((c) => c.video);
}

/** Gera URL relativa compartilhável para uma Maratona (`/?maratona=id1,id2&titulo=...`). */
export function montarUrlMaratona(
  videoIds: readonly string[],
  titulo?: string,
): string {
  const limpos = videoIds
    .filter((id) => VIDEO_ID_VALIDO_RE.test(id))
    .slice(0, MAX_VIDEOS_MARATONA);
  if (limpos.length === 0) return '/';
  const params = new URLSearchParams();
  params.set('maratona', limpos.join(','));
  const t = titulo?.trim();
  if (t) params.set('titulo', t.slice(0, 80));
  return `/?${params.toString()}`;
}

/** Interpreta parâmetros de URL de uma Maratona compartilhada com sanitização segura. */
export function parsearMaratonaDaUrl(
  maratonaRaw: string | null | undefined,
  tituloRaw?: string | null,
): { videoIds: string[]; titulo: string } | null {
  if (!maratonaRaw) return null;
  const vistos = new Set<string>();
  const videoIds: string[] = [];
  for (const parte of maratonaRaw.split(',')) {
    const id = parte.trim();
    if (!VIDEO_ID_VALIDO_RE.test(id) || vistos.has(id)) continue;
    vistos.add(id);
    videoIds.push(id);
    if (videoIds.length >= MAX_VIDEOS_MARATONA) break;
  }
  if (videoIds.length === 0) return null;
  const titulo = tituloRaw?.trim().slice(0, 80) || 'Maratona compartilhada';
  return { videoIds, titulo };
}
