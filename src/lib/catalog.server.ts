import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { mesclarExtrasCatalogo } from './catalog';
import type { Catalogo } from './types';
import { mesclarNovidadesNoCatalogo } from './youtube-feeds';
import { buscarNovidadesFeedsAoVivo } from './youtube-feeds.server';

const CATALOG_PATH = path.join(process.cwd(), 'public', 'data', 'videos.json');

/** Lê o arquivo base estático do repositório (instantâneo, sem rede — usado em SSG/build). */
export const carregarCatalogoBase = cache(async (): Promise<Catalogo> => {
  try {
    const raw = await readFile(CATALOG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Catalogo>;
    return mesclarExtrasCatalogo({
      atualizadoEm: parsed.atualizadoEm ?? null,
      videos: Array.isArray(parsed.videos) ? parsed.videos : [],
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
    });
  } catch {
    return mesclarExtrasCatalogo({
      atualizadoEm: null,
      videos: [],
      playlists: [],
    });
  }
});

/**
 * Carrega o catálogo completo mesclando os lançamentos mais recentes dos feeds RSS
 * oficiais do YouTube (cache automático de 3 minutos, zero redeploy necessário).
 */
export const carregarCatalogoServidor = cache(async (): Promise<Catalogo> => {
  const base = await carregarCatalogoBase();
  try {
    const novidades = await buscarNovidadesFeedsAoVivo(false);
    return mesclarNovidadesNoCatalogo(base, novidades);
  } catch {
    return base;
  }
});

export async function carregarCatalogoAoVivo(forcar = false): Promise<Catalogo> {
  const base = await carregarCatalogoBase();
  try {
    const novidades = await buscarNovidadesFeedsAoVivo(forcar);
    return mesclarNovidadesNoCatalogo(base, novidades);
  } catch {
    return base;
  }
}
