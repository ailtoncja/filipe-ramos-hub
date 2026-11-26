import { CARE_PACKAGES, CARE_PACKAGES_POR_SLUG } from '@/data/care-packages';
import { normalizarTexto } from './text';
import type { CarePackage, TipoRecursoChave } from './types';

export interface FiltroCarePackage {
  chave: TipoRecursoChave;
  label: string;
  padrao: RegExp | null;
}

export const TIPOS_RECURSO: FiltroCarePackage[] = [
  { chave: 'mapa', label: 'Mapas', padrao: /mapa/i },
  { chave: 'projeto', label: 'Projetos', padrao: /\.psd|projeto/i },
  { chave: 'retextura', label: 'Retexturas', padrao: /retextura/i },
  { chave: 'infografico', label: 'Infográficos', padrao: /infográfico/i },
  { chave: 'cheat', label: 'Cheats', padrao: /cheat/i },
  { chave: 'video', label: 'Vídeos/Tutoriais', padrao: /vídeo|tutorial/i },
  { chave: 'tabela', label: 'Tabelas', padrao: /tabela|arma/i },
  { chave: 'texto', label: 'Textos', padrao: /\.txt/i },
  { chave: 'pack', label: 'Packs/Mods', padrao: null },
];

export const FILTROS_CARE_PACKAGES: FiltroCarePackage[] = [
  { chave: 'lives', label: 'Com lives', padrao: null },
  ...TIPOS_RECURSO,
];

const PADRAO_DESATUALIZADO = /desatualizad|vers[aã]o antiga|antigo/i;

export function classificarRecurso(label: string): TipoRecursoChave {
  return (
    TIPOS_RECURSO.find((tipo) => tipo.padrao?.test(label))?.chave ?? 'pack'
  );
}

export function ehRecursoDesatualizado(label: string): boolean {
  return PADRAO_DESATUALIZADO.test(label);
}

export function tiposDoCarePackage(cp: CarePackage): Set<TipoRecursoChave> {
  const tipos = new Set<TipoRecursoChave>(
    cp.itens.map((item) => classificarRecurso(item.label)),
  );
  if (cp.grupos?.length) tipos.add('pack');
  if (cp.lives?.fontes.length) tipos.add('lives');
  if (cp.videosOficiais?.fontes.length) tipos.add('video');
  return tipos;
}

const TIPOS_CACHE = new Map<string, Set<TipoRecursoChave>>(
  CARE_PACKAGES.map((cp) => [cp.slug, tiposDoCarePackage(cp)]),
);

export function filtrarCarePackages(
  busca: string,
  filtrosAtivos: ReadonlySet<TipoRecursoChave>,
): CarePackage[] {
  const termos = normalizarTexto(busca.trim()).split(/\s+/).filter(Boolean);
  return CARE_PACKAGES.filter((cp) => {
    if (termos.length > 0) {
      const alvo = normalizarTexto(`${cp.jogo} ${cp.descricao}`);
      if (!termos.every((t) => alvo.includes(t))) return false;
    }
    if (filtrosAtivos.size === 0) return true;
    const tipos = TIPOS_CACHE.get(cp.slug) ?? tiposDoCarePackage(cp);
    for (const chave of filtrosAtivos) {
      if (tipos.has(chave)) return true;
    }
    return false;
  });
}

export function contarRecursosCarePackage(cp: CarePackage): number {
  const modsEmGrupos =
    cp.grupos?.reduce((total, grupo) => total + grupo.mods.length, 0) ?? 0;
  return cp.itens.length + modsEmGrupos;
}

export function buscarCarePackagePorSlug(slug: string): CarePackage | undefined {
  return CARE_PACKAGES_POR_SLUG.get(slug);
}
