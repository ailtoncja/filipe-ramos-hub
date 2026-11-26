import {
  encontrarCarePackageParaJogoTwitch,
  interpretarUptimeDecApi,
  limparTextoDecApi,
  TWITCH_CANAL_LOGIN,
  TWITCH_CANAL_URL,
} from './twitch';
import type { StatusTransmissaoTwitch } from './types';

const TWITCH_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutos
const REQUEST_TIMEOUT_MS = 3500;

let cacheStatus: { dados: StatusTransmissaoTwitch; expiraEm: number } | null = null;
let buscaEmAndamento: Promise<StatusTransmissaoTwitch | null> | null = null;
let helixTokenCache: { token: string; expiraEm: number } | null = null;

async function obterTokenHelix(
  clientId: string,
  clientSecret: string,
): Promise<string | null> {
  if (helixTokenCache && Date.now() < helixTokenCache.expiraEm) {
    return helixTokenCache.token;
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;
  helixTokenCache = {
    token: json.access_token,
    expiraEm: Date.now() + Math.max(60, (json.expires_in ?? 3600) - 120) * 1000,
  };
  return json.access_token;
}

async function consultarViaHelix(
  clientId: string,
  clientSecret: string,
): Promise<StatusTransmissaoTwitch | null> {
  const token = await obterTokenHelix(clientId, clientSecret);
  if (!token) return null;

  const headers = {
    'Client-Id': clientId,
    Authorization: `Bearer ${token}`,
  };

  const [streamRes, userRes] = await Promise.all([
    fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(TWITCH_CANAL_LOGIN)}`,
      { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), cache: 'no-store' },
    ),
    fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(TWITCH_CANAL_LOGIN)}`,
      { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), cache: 'no-store' },
    ),
  ]);

  if (!streamRes.ok) return null;
  const streamJson = (await streamRes.json()) as {
    data?: { game_name?: string; title?: string; started_at?: string }[];
  };
  const live = streamJson.data?.[0];

  let jogo = live?.game_name ?? null;
  let titulo = live?.title ?? null;

  if (!live && userRes.ok) {
    const userJson = (await userRes.json()) as { data?: { id?: string }[] };
    const broadcasterId = userJson.data?.[0]?.id;
    if (broadcasterId) {
      const chRes = await fetch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${encodeURIComponent(broadcasterId)}`,
        { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), cache: 'no-store' },
      );
      if (chRes.ok) {
        const chJson = (await chRes.json()) as {
          data?: { game_name?: string; title?: string }[];
        };
        jogo = chJson.data?.[0]?.game_name || null;
        titulo = chJson.data?.[0]?.title || null;
      }
    }
  }

  const cp = encontrarCarePackageParaJogoTwitch(jogo);
  return {
    aoVivo: Boolean(live),
    tempoAoVivo: null,
    jogo,
    titulo,
    canalUrl: TWITCH_CANAL_URL,
    carePackageSlug: cp?.slug ?? null,
    carePackageNome: cp?.jogo ?? null,
    atualizadoEm: new Date().toISOString(),
  };
}

async function consultarViaDecApi(): Promise<StatusTransmissaoTwitch | null> {
  const base = `https://decapi.me/twitch`;
  const [upRes, gameRes, titleRes] = await Promise.allSettled([
    fetch(`${base}/uptime/${TWITCH_CANAL_LOGIN}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    }).then((r) => (r.ok ? r.text() : null)),
    fetch(`${base}/game/${TWITCH_CANAL_LOGIN}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    }).then((r) => (r.ok ? r.text() : null)),
    fetch(`${base}/title/${TWITCH_CANAL_LOGIN}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    }).then((r) => (r.ok ? r.text() : null)),
  ]);

  const upRaw = upRes.status === 'fulfilled' ? upRes.value : null;
  const gameRaw = gameRes.status === 'fulfilled' ? gameRes.value : null;
  const titleRaw = titleRes.status === 'fulfilled' ? titleRes.value : null;

  if (!upRaw && !gameRaw && !titleRaw) return null;

  const { aoVivo, tempoAoVivo } = interpretarUptimeDecApi(upRaw);
  const jogo = limparTextoDecApi(gameRaw);
  const titulo = limparTextoDecApi(titleRaw);
  const cp = encontrarCarePackageParaJogoTwitch(jogo);

  return {
    aoVivo,
    tempoAoVivo,
    jogo,
    titulo,
    canalUrl: TWITCH_CANAL_URL,
    carePackageSlug: cp?.slug ?? null,
    carePackageNome: cp?.jogo ?? null,
    atualizadoEm: new Date().toISOString(),
  };
}

/**
 * Consulta o status da Transmissão do Filipe na Twitch com cache de 2 minutos.
 * Usa Twitch Helix se `TWITCH_CLIENT_ID`/`TWITCH_CLIENT_SECRET` existirem, senão decapi.me.
 */
export async function buscarStatusTransmissaoTwitch(): Promise<StatusTransmissaoTwitch | null> {
  const agora = Date.now();
  if (cacheStatus && agora < cacheStatus.expiraEm) {
    return cacheStatus.dados;
  }

  if (!buscaEmAndamento) {
    buscaEmAndamento = (async () => {
      try {
        const clientId = process.env.TWITCH_CLIENT_ID;
        const clientSecret = process.env.TWITCH_CLIENT_SECRET;
        const resultado =
          clientId && clientSecret
            ? ((await consultarViaHelix(clientId, clientSecret)) ??
              (await consultarViaDecApi()))
            : await consultarViaDecApi();

        if (resultado) {
          cacheStatus = {
            dados: resultado,
            expiraEm: Date.now() + TWITCH_CACHE_TTL_MS,
          };
        }
        return resultado ?? cacheStatus?.dados ?? null;
      } catch {
        return cacheStatus?.dados ?? null;
      } finally {
        buscaEmAndamento = null;
      }
    })();
  }

  return buscaEmAndamento;
}
