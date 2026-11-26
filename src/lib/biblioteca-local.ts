import { MAX_VIDEOS_MARATONA } from './sequencias';
import type { ItemRecenteLocal, MaratonaLocal, TipoCatalogo } from './types';

export const BIBLIOTECA_STORAGE_KEY = 'frh:biblioteca:v1';
export const MAX_RECENTES = 4;

export interface EstadoBibliotecaLocal {
  salvosVideos: string[];
  salvosPlaylists: string[];
  assistidosVideos: string[];
  recentes: ItemRecenteLocal[];
  filaAtual: string[];
  maratonas: MaratonaLocal[];
}

export const BIBLIOTECA_VAZIA: EstadoBibliotecaLocal = {
  salvosVideos: [],
  salvosPlaylists: [],
  assistidosVideos: [],
  recentes: [],
  filaAtual: [],
  maratonas: [],
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
