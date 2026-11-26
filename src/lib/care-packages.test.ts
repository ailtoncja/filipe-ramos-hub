import { describe, expect, it } from 'vitest';
import { CARE_PACKAGES } from '@/data/care-packages';
import { LIVES_CURADAS } from '@/data/lives';
import { VIDEOS_OFICIAIS_CURADOS } from '@/data/videos-oficiais';
import {
  buscarCarePackagePorSlug,
  ehRecursoDesatualizado,
  filtrarCarePackages,
} from './care-packages';

describe('Care Packages data integrity', () => {
  it('gera slugs únicos para todos os 31 jogos', () => {
    expect(CARE_PACKAGES.length).toBeGreaterThanOrEqual(31);
    const slugs = new Set(CARE_PACKAGES.map((cp) => cp.slug));
    expect(slugs.size).toBe(CARE_PACKAGES.length);
    expect(buscarCarePackagePorSlug('the-witcher-3-wild-hunt')?.jogo).toBe(
      'The Witcher 3: Wild Hunt',
    );
  });

  it('mantém todas as chaves de LIVES_CURADAS e VIDEOS_OFICIAIS_CURADOS válidas', () => {
    const jogos = new Set(CARE_PACKAGES.map((cp) => cp.jogo));
    for (const nome of Object.keys(LIVES_CURADAS)) {
      expect(jogos.has(nome), `Live órfã: ${nome}`).toBe(true);
    }
    for (const nome of Object.keys(VIDEOS_OFICIAIS_CURADOS)) {
      expect(jogos.has(nome), `Vídeo oficial órfão: ${nome}`).toBe(true);
    }
  });

  it('filtra por texto e tipo de conteúdo corretamente', () => {
    const mapas = filtrarCarePackages('', new Set(['mapa']));
    expect(mapas.some((cp) => cp.jogo === 'Bloodborne')).toBe(true);
    expect(ehRecursoDesatualizado('Clear descriptions (desatualizado)')).toBe(true);
  });
});
