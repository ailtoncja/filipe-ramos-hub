/**
 * Playlists cujo player nativo `/embed/videoseries?list=...` retorna
 * "Este vídeo não está disponível" no YouTube (incorporação da playlist bloqueada),
 * embora todos os vídeos individuais sejam públicos e incorporáveis.
 *
 * Para esses casos, o player embutido usa a fila direta de vídeos
 * (`/embed/<primeiro>?playlist=<v1>,<v2>,...`), preservando a ordem dos episódios
 * tanto na aba Playlists quanto nas páginas de Care Packages.
 */
export const PLAYLIST_EMBED_FALLBACK: Readonly<Record<string, readonly string[]>> = {
  // Filipe Ramos - Matando a saudade do Need for Speed Most Wanted
  PLR2b8Khskp2E: ['KGkJMJviRQs', '62guKHVWWGg', '-goCG4BGqsg'],
  // Filipe Ramos - Cyberpunk 2077
  PLKQkEroN3cDQ: [
    'ZebEU55QdhQ',
    'Cs-mLiyj0z4',
    'Zcw0U6IepdI',
    'iGZW9OOTVqw',
    'ILdZdo8widY',
    'Gr1evbLlCBQ',
    'BU8xaMGB8-4',
    'n0eV9lDaUqY',
    '26YZ0ZSUZ7k',
    'dupt2qMuF7g',
    'FZwCAJHlrWk',
  ],
  // Filipe Ramos - Midnight Club 3
  'PLE94u5m-YVsU': ['q9s0-_3Tzbk', 'xHmDtsib6XA'],
  // Filipe Ramos - GTA IV
  PLYFAWGW3PLEY: [
    'MhLKF926bP4',
    '86GPONgYulM',
    'hl23t1A0qGc',
    'ffl04Go1M88',
    'Hz6Cu1nJ4xo',
  ],
  // Filipe Ramos - GT4
  PLbd6ZdEnKHEs: [
    'DED0y64_32M',
    'Mgl20mDVh4k',
    'qjyicGkVQL0',
    'yxDhKf3eyXs',
    'tVZ_xAfO-yw',
    'S0dANv8oz8A',
    'M_xral1tyb8',
    'CFqEWWZttJs',
  ],
  // Filipe Ramos - Fallout NV
  PLYBVZGAaMB4I: [
    'FagDqtQC0So',
    'PHepwTk8z34',
    'AM1zTghXCa0',
    '0379gni5jIc',
    'vH_Dl_8Q9E0',
    'WYnJ7_UHahk',
    '5D0qC0km3G8',
  ],
};
