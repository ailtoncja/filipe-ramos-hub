export interface LiveAvulsa {
  titulo: string;
  canal: string;
  youtubeUrl: string;
}

export function extrairVideoId(youtubeUrl: string): string | null {
  const match = youtubeUrl.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function miniaturaUrl(youtubeUrl: string): string {
  const id = extrairVideoId(youtubeUrl);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}
