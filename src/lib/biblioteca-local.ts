import { MAX_VIDEOS_MARATONA } from './sequencias';
import type {
  ItemRecenteLocal,
  MaratonaLocal,
  ProgressoVideoLocal,
  TipoCatalogo,
} from './types';

export const BIBLIOTECA_STORAGE_KEY = 'frh:biblioteca:v1';
export const MAX_RECENTES = 4;
export const MAX_PROGRESSOS = 200;
export const MIN_SEGUNDOS_PROGRESSO = 10;

export interface EstadoBibliotecaLocal {
  salvosVideos: string[];
  salvosPlaylists: string[];
  assistidosVideos: string[];
  recentes: ItemRecenteLocal[];
  filaAtual: string[];
  maratonas: MaratonaLocal[];
  progressoVideos: Record<string, ProgressoVideoLocal>;
}

export const BIBLIOTECA_VAZIA: EstadoBibliotecaLocal = {
  salvosVideos: [],
  salvosPlaylists: [],
  assistidosVideos: [],
  recentes: [],
  filaAtual: [],
  maratonas: [],
  progressoVideos: {},
};

function limparListaIds(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  const vistos = new Set<string>();
  const limpos: string[] = [];
  for (const item of valor) {
    if (typeof item === 'string' && item.trim() && !vistos.has(item)) {
      vistos.add(item);
      limpos.push(item);
    }
  }
  return limpos;
}

function limparRecentes(valor: unknown): ItemRecenteLocal[] {
  if (!Array.isArray(valor)) return [];
  const vistos = new Set<string>();
  const limpos: ItemRecenteLocal[] = [];
  for (const item of valor) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as ItemRecenteLocal).id === 'string' &&
      ((item as ItemRecenteLocal).tipo === 'videos' ||
        (item as ItemRecenteLocal).tipo === 'playlists')
    ) {
      const id = (item as ItemRecenteLocal).id;
      const tipo = (item as ItemRecenteLocal).tipo;
      const chave = `${tipo}:${id}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      limpos.push({
        id,
        tipo,
        abertoEm:
          typeof (item as ItemRecenteLocal).abertoEm === 'number'
            ? (item as ItemRecenteLocal).abertoEm
            : 0,
      });
      if (limpos.length >= MAX_RECENTES) break;
    }
  }
  return limpos;
}

function limparMaratonas(valor: unknown): MaratonaLocal[] {
  if (!Array.isArray(valor)) return [];
  const limpas: MaratonaLocal[] = [];
  for (const item of valor) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Partial<MaratonaLocal>;
    if (typeof rec.id !== 'string' || !rec.id.trim()) continue;
    const videoIds = limparListaIds(rec.videoIds).slice(0, MAX_VIDEOS_MARATONA);
    if (videoIds.length === 0) continue;
    limpas.push({
      id: rec.id,
      titulo:
        typeof rec.titulo === 'string' && rec.titulo.trim()
          ? rec.titulo.trim().slice(0, 80)
          : 'Minha Maratona',
      videoIds,
      criadaEm: typeof rec.criadaEm === 'number' ? rec.criadaEm : 0,
    });
  }
  return limpas;
}

function limparProgressos(
  valor: unknown,
): Record<string, ProgressoVideoLocal> {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return {};
  const entradas: [string, ProgressoVideoLocal][] = [];
  for (const [id, item] of Object.entries(valor as Record<string, unknown>)) {
    if (!id.trim() || !item || typeof item !== 'object') continue;
    const rec = item as Partial<ProgressoVideoLocal>;
    if (
      typeof rec.tempo !== 'number' ||
      !Number.isFinite(rec.tempo) ||
      rec.tempo < MIN_SEGUNDOS_PROGRESSO
    ) {
      continue;
    }
    const duracao =
      typeof rec.duracao === 'number' && Number.isFinite(rec.duracao) && rec.duracao > 0
        ? Math.floor(rec.duracao)
        : 0;
    entradas.push([
      id,
      {
        tempo: Math.floor(rec.tempo),
        duracao,
        atualizadoEm:
          typeof rec.atualizadoEm === 'number' && Number.isFinite(rec.atualizadoEm)
            ? rec.atualizadoEm
            : 0,
      },
    ]);
  }
  entradas.sort((a, b) => b[1].atualizadoEm - a[1].atualizadoEm);
  return Object.fromEntries(entradas.slice(0, MAX_PROGRESSOS));
}

export function parsearBibliotecaLocal(raw: string | null): EstadoBibliotecaLocal {
  if (!raw) return BIBLIOTECA_VAZIA;
  try {
    const parsed = JSON.parse(raw) as Partial<EstadoBibliotecaLocal>;
    return {
      salvosVideos: limparListaIds(parsed.salvosVideos),
      salvosPlaylists: limparListaIds(parsed.salvosPlaylists),
      assistidosVideos: limparListaIds(parsed.assistidosVideos),
      recentes: limparRecentes(parsed.recentes),
      filaAtual: limparListaIds(parsed.filaAtual).slice(0, MAX_VIDEOS_MARATONA),
      maratonas: limparMaratonas(parsed.maratonas),
      progressoVideos: limparProgressos(parsed.progressoVideos),
    };
  } catch {
    return BIBLIOTECA_VAZIA;
  }
}

export function alternarSalvo(
  estado: EstadoBibliotecaLocal,
  id: string,
  tipo: TipoCatalogo,
): EstadoBibliotecaLocal {
  const chave = tipo === 'playlists' ? 'salvosPlaylists' : 'salvosVideos';
  const atual = estado[chave];
  const existe = atual.includes(id);
  return {
    ...estado,
    [chave]: existe ? atual.filter((item) => item !== id) : [id, ...atual],
  };
}

export function alternarAssistido(
  estado: EstadoBibliotecaLocal,
  videoId: string,
): EstadoBibliotecaLocal {
  const existe = estado.assistidosVideos.includes(videoId);
  return {
    ...estado,
    assistidosVideos: existe
      ? estado.assistidosVideos.filter((item) => item !== videoId)
      : [videoId, ...estado.assistidosVideos],
  };
}

export function registrarRecente(
  estado: EstadoBibliotecaLocal,
  id: string,
  tipo: TipoCatalogo,
  agora = Date.now(),
): EstadoBibliotecaLocal {
  const filtrados = estado.recentes.filter(
    (item) => !(item.id === id && item.tipo === tipo),
  );
  return {
    ...estado,
    recentes: [{ id, tipo, abertoEm: agora }, ...filtrados].slice(0, MAX_RECENTES),
  };
}

export function limparRecentesBiblioteca(
  estado: EstadoBibliotecaLocal,
): EstadoBibliotecaLocal {
  if (estado.recentes.length === 0) return estado;
  return {
    ...estado,
    recentes: [],
  };
}

export function alternarNaFila(
  estado: EstadoBibliotecaLocal,
  videoId: string,
): EstadoBibliotecaLocal {
  const existe = estado.filaAtual.includes(videoId);
  if (existe) {
    return {
      ...estado,
      filaAtual: estado.filaAtual.filter((id) => id !== videoId),
    };
  }
  if (estado.filaAtual.length >= MAX_VIDEOS_MARATONA) return estado;
  return {
    ...estado,
    filaAtual: [...estado.filaAtual, videoId],
  };
}

export function definirFila(
  estado: EstadoBibliotecaLocal,
  videoIds: readonly string[],
): EstadoBibliotecaLocal {
  return {
    ...estado,
    filaAtual: limparListaIds(videoIds).slice(0, MAX_VIDEOS_MARATONA),
  };
}

export function moverNaFila(
  estado: EstadoBibliotecaLocal,
  videoId: string,
  direcao: -1 | 1,
): EstadoBibliotecaLocal {
  const idx = estado.filaAtual.indexOf(videoId);
  if (idx === -1) return estado;
  const destino = idx + direcao;
  if (destino < 0 || destino >= estado.filaAtual.length) return estado;
  const copia = [...estado.filaAtual];
  [copia[idx], copia[destino]] = [copia[destino], copia[idx]];
  return { ...estado, filaAtual: copia };
}

export function salvarMaratonaLocal(
  estado: EstadoBibliotecaLocal,
  titulo: string,
  videoIds: readonly string[],
  agora = Date.now(),
): EstadoBibliotecaLocal {
  const limpos = limparListaIds(videoIds).slice(0, MAX_VIDEOS_MARATONA);
  if (limpos.length === 0) return estado;
  const nome = titulo.trim().slice(0, 80) || 'Minha Maratona';
  const nova: MaratonaLocal = {
    id: `m_${agora.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    titulo: nome,
    videoIds: limpos,
    criadaEm: agora,
  };
  return {
    ...estado,
    maratonas: [nova, ...estado.maratonas],
  };
}

export function removerMaratonaLocal(
  estado: EstadoBibliotecaLocal,
  maratonaId: string,
): EstadoBibliotecaLocal {
  return {
    ...estado,
    maratonas: estado.maratonas.filter((m) => m.id !== maratonaId),
  };
}

/**
 * Salva o ponto onde o usuário parou em um vídeo.
 * - Ignora tempos < 10s (para não poluir em espiadas rápidas).
 * - Limpa o progresso automaticamente quando o vídeo chega ao final (>= 97% ou últimos 15s).
 */
export function atualizarProgressoVideo(
  estado: EstadoBibliotecaLocal,
  videoId: string,
  tempo: number,
  duracao: number,
  agora = Date.now(),
): EstadoBibliotecaLocal {
  if (!videoId || !Number.isFinite(tempo)) return estado;
  const tempoInt = Math.floor(tempo);
  const duracaoInt =
    Number.isFinite(duracao) && duracao > 0 ? Math.floor(duracao) : 0;

  const chegouNoFinal =
    duracaoInt > 30 &&
    (tempoInt >= duracaoInt - 15 || tempoInt / duracaoInt >= 0.97);

  if (chegouNoFinal) {
    return limparProgressoVideo(estado, videoId);
  }

  if (tempoInt < MIN_SEGUNDOS_PROGRESSO) {
    return estado;
  }

  const proximo: Record<string, ProgressoVideoLocal> = {
    ...estado.progressoVideos,
    [videoId]: { tempo: tempoInt, duracao: duracaoInt, atualizadoEm: agora },
  };

  const chaves = Object.keys(proximo);
  if (chaves.length > MAX_PROGRESSOS) {
    const ordenadas = Object.entries(proximo)
      .sort((a, b) => b[1].atualizadoEm - a[1].atualizadoEm)
      .slice(0, MAX_PROGRESSOS);
    return {
      ...estado,
      progressoVideos: Object.fromEntries(ordenadas),
    };
  }

  return {
    ...estado,
    progressoVideos: proximo,
  };
}

export function limparProgressoVideo(
  estado: EstadoBibliotecaLocal,
  videoId: string,
): EstadoBibliotecaLocal {
  if (!(videoId in estado.progressoVideos)) return estado;
  const copia = { ...estado.progressoVideos };
  delete copia[videoId];
  return {
    ...estado,
    progressoVideos: copia,
  };
}
