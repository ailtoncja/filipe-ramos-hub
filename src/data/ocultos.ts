/**
 * IDs removidos manualmente do catálogo.
 *
 * Para ocultar mais itens no futuro, basta adicionar o ID do vídeo (`?v=...`)
 * ou da playlist (`?list=...`) nas listas abaixo — eles serão ignorados tanto
 * na exibição/sincronização ao vivo do site quanto no script `atualizar-videos.mjs`.
 */

export const PLAYLISTS_OCULTAS: readonly string[] = [
  'PLGSGmwDgc4XRwVq8Fbx1ATQGNd9dx-Xjc', // Filipe Ramos em: Resident Evil 3 Classic (@cortesdofiliperamos)
  'PLGSGmwDgc4XSxh2k55SKLOhqHVT9OaYCJ', // Filipe Ramos em: Resident Evil – Code: Veronica (@cortesdofiliperamos)
  'PL0y-93TvxLP_uJYpAa7CUXXF-06V6K3mI', // favoritos (@ELGK)
  'PLehkBrri1N3zl0NK6wXOqa_UvWnTiGPlI', // Imersão Dev Alura (@aeithales — não relacionado ao Filipe)
  'PL4S3PiAFlYxP25dARZPR1QKQvInAc6pCv', // minhas músicas (@Livesfiliperamos)
  'PL-67S2fmeKaKPkZiRQBcJjdaDH0mGHgQI', // Vibenuncios - Anúncios no geral (@FilipeRamosVibes)
  'PL-67S2fmeKaLeFk1ied2jObehP8mHbQ9U', // Vibinhas FR - Shorts (@FilipeRamosVibes)
  'PL0y-93TvxLP9OTtX8Qf5I_Bo7t83gR_B5', // lives não listada (@ELGK)
  'PLehkBrri1N3wMKwUwMFaXnj3S2DDTQ4I0', // Filipe Ramos OST (@aeithales)
  'PLAephF92zy_C20uLJTLE7IF9vIv0bAlZv', // FR Vídeos (@rodrigosantos1264 — mantém os vídeos no catálogo)
];

export const VIDEOS_OCULTOS: readonly string[] = [];

export const PLAYLISTS_OCULTAS_SET: ReadonlySet<string> = new Set(
  PLAYLISTS_OCULTAS,
);

export const VIDEOS_OCULTOS_SET: ReadonlySet<string> = new Set(VIDEOS_OCULTOS);
