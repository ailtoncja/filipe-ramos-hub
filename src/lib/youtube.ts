export interface YoutubeEmbedInfo {
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string | null;
  ehPlaylist: boolean;
  videoId: string | null;
  playlistId: string | null;
}

export function parseYoutubeUrl(url: string): YoutubeEmbedInfo | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;
  const host = parsed.hostname.replace(/^www\./, '');
  if (host !== 'youtube.com' && host !== 'youtu.be') return null;

  const playlistId = parsed.searchParams.get('list');
  const rawVideoId =
    host === 'youtu.be'
      ? parsed.pathname.slice(1).split('/')[0] || null
      : parsed.searchParams.get('v');

  const inicio = Number.parseInt(parsed.searchParams.get('t') ?? '', 10);
  const startParam = Number.isFinite(inicio) && inicio > 0 ? inicio : null;

  if (playlistId) {
    if (rawVideoId) {
      const qs = new URLSearchParams({ list: playlistId });
      if (startParam) qs.set('start', String(startParam));
      return {
        embedUrl: `https://www.youtube-nocookie.com/embed/${rawVideoId}?${qs.toString()}`,
        watchUrl: url,
        thumbnailUrl: `https://i.ytimg.com/vi/${rawVideoId}/hqdefault.jpg`,
        ehPlaylist: true,
        videoId: rawVideoId,
        playlistId,
      };
    }

    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`,
      watchUrl: url,
      thumbnailUrl: null,
      ehPlaylist: true,
      videoId: null,
      playlistId,
    };
  }

  if (!rawVideoId) return null;

  const qs = new URLSearchParams();
  if (startParam) qs.set('start', String(startParam));
  const query = qs.toString();

  return {
    embedUrl: `https://www.youtube-nocookie.com/embed/${rawVideoId}${query ? `?${query}` : ''}`,
    watchUrl: url,
    thumbnailUrl: `https://i.ytimg.com/vi/${rawVideoId}/hqdefault.jpg`,
    ehPlaylist: false,
    videoId: rawVideoId,
    playlistId: null,
  };
}

export function embedDeVideoId(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
}

export function embedDePlaylistId(id: string): string {
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(id)}&autoplay=1`;
}

export function urlYoutubeDoItem(id: string, tipo: 'videos' | 'playlists'): string {
  return tipo === 'playlists'
    ? `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`
    : `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}
