import { readFile, writeFile } from 'node:fs/promises';

const key = process.env.YOUTUBE_API_KEY;
if (!key) throw new Error('Defina a variável YOUTUBE_API_KEY antes de atualizar o catálogo.');
const source = await readFile(new URL('../src/app/data/canais.data.ts', import.meta.url), 'utf8');
const blocks = [...source.matchAll(/\{\s*nome:\s*'([^']+)'[\s\S]*?youtubeUrl:\s*'([^']+)'\s*\}/g)];
if (!blocks.length) throw new Error('Nenhuma fonte encontrada em canais.data.ts.');
const api = async (endpoint, params) => {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries({ ...params, key }).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw new Error(`YouTube ${endpoint}: ${body.error?.message ?? response.status}`);
  return body;
};
const videos = new Map();
for (const [, name, link] of blocks) {
  const sourceUrl = new URL(link);
  let playlist = sourceUrl.searchParams.get('list');
  if (!playlist) {
    const handle = sourceUrl.pathname.split('/').filter(Boolean)[0];
    if (!handle?.startsWith('@')) throw new Error(`Endereço de canal não reconhecido: ${link}`);
    const result = await api('channels', { part: 'contentDetails', forHandle: handle });
    playlist = result.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!playlist) throw new Error(`Canal não encontrado: ${name}`);
  }
  console.log(`Atualizando ${name}...`);
  let token;
  do {
    const params = { part: 'snippet,contentDetails', playlistId: playlist, maxResults: '50' };
    if (token) params.pageToken = token;
    const result = await api('playlistItems', params);
    for (const item of result.items ?? []) {
      const s = item.snippet;
      const id = item.contentDetails?.videoId;
      if (!id || !s || ['Private video', 'Deleted video'].includes(s.title)) continue;
      const video = videos.get(id);
      if (video) {
        if (!video.fontes.includes(name)) video.fontes.push(name);
      } else {
        videos.set(id, { id, titulo: s.title, descricao: s.description ?? '', canal: s.videoOwnerChannelTitle || name, fontes: [name], publicadoEm: item.contentDetails?.videoPublishedAt || s.publishedAt, miniatura: s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '' });
      }
    }
    token = result.nextPageToken;
  } while (token);
}
const catalog = { atualizadoEm: new Date().toISOString(), videos: [...videos.values()].sort ( (a, b) => b.publicadoEm.localeCompare(a.publicadoEm)) };
await writeFile(new URL('../public/data/videos.json', import.meta.url), JSON.stringify(catalog));
console.log(`${catalog.videos.length} vídeos salvos.`);
