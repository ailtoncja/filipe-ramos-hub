import { CARE_PACKAGES } from '@/data/care-packages';
import { filtrarCarePackages } from './care-packages';
import { normalizarParaBusca } from './search';
import type { CarePackage } from './types';

export const TWITCH_CANAL_LOGIN = 'filiperaaamos';
export const TWITCH_CANAL_URL = `https://www.twitch.tv/${TWITCH_CANAL_LOGIN}`;

const OFFLINE_RE = /offline/i;
const DECAPI_ERRO_RE = /^(?:error|not found|user not found|404|5\d\d)/i;

/** Limpa resposta textual do decapi.me descartando mensagens de erro ou HTML inesperado. */
export function limparTextoDecApi(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const limpo = raw.trim();
  if (!limpo || limpo.startsWith('<') || DECAPI_ERRO_RE.test(limpo)) {
    return null;
  }
  return limpo;
}

export function interpretarUptimeDecApi(raw: string | null | undefined): {
  aoVivo: boolean;
  tempoAoVivo: string | null;
} {
  const texto = limparTextoDecApi(raw);
  if (!texto || OFFLINE_RE.test(texto)) {
    return { aoVivo: false, tempoAoVivo: null };
  }
  return { aoVivo: true, tempoAoVivo: texto };
}

/**
 * Cruza o nome do Jogo retornado pela Twitch (ex.: "Grand Theft Auto IV", "The Witcher 3: Wild Hunt")
 * com um Care Package do Hub quando houver correspondência clara.
 */
export function encontrarCarePackageParaJogoTwitch(
  jogoTwitch: string | null | undefined,
): CarePackage | null {
  const nome = jogoTwitch?.trim();
  if (!nome) return null;

  const alvoNorm = normalizarParaBusca(nome);
  if (alvoNorm.length < 3) return null;

  // 1. Correspondência exata normalizada primeiro (evita confundir GTA SA com GTA SA Enhanced)
  const exato = CARE_PACKAGES.find(
    (cp) => normalizarParaBusca(cp.jogo) === alvoNorm,
  );
  if (exato) return exato;

  // 2. Busca inteligente existente (entende GTA IV <-> Grand Theft Auto IV, FNV, NFS, etc.)
  const encontrados = filtrarCarePackages(nome, new Set());
  if (encontrados.length === 1) return encontrados[0];
  if (encontrados.length > 1) {
    const maisProximo = encontrados.find((cp) => {
      const n = normalizarParaBusca(cp.jogo);
      return n.includes(alvoNorm) || alvoNorm.includes(n);
    });
    return maisProximo ?? encontrados[0];
  }

  return null;
}
