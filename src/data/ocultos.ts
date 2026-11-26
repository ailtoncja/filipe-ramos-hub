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
];

export const VIDEOS_OCULTOS: readonly string[] = [];

export const PLAYLISTS_OCULTAS_SET: ReadonlySet<string> = new Set(
  PLAYLISTS_OCULTAS,
);

export const VIDEOS_OCULTOS_SET: ReadonlySet<string> = new Set(VIDEOS_OCULTOS);
