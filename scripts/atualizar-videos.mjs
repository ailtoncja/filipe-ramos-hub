import { readFile, writeFile } from 'node:fs/promises';

const key = process.env.YOUTUBE_API_KEY;
if (!key) throw new Error('Defina a variável YOUTUBE_API_KEY antes de atualizar o catálogo.');
const source = await readFile(new URL('../src/app/data/canais.data.ts', import.meta.url), 'utf8');
const blocks = [...source.matchAll(/\{\s*nome:\s*'([^']+)'[\s\S]*?youtubeUrl:\s*'([^']+)'\s*\}/g)];
if (!blocks.length) throw new Error('Nenhuma fonte encontrada em canais.data.ts.');
const api = async (endpoint, params) => {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url, { headers: { 'x-goog-api-key': key } });
  const body = await response.json();
  if (!response.ok) throw new Error(`YouTube ${endpoint}: ${body.error?.message ?? response.status}`);
  return body;
};
const videos = new Map();
const playlists = new Map();
const addPlaylist = (item, name) => {
  const snippet = item.snippet;
  if (!item.id || !snippet) return;
  const existing = playlists.get(item.id);
  if (existing) {
    if (!existing.fontes.includes(name)) existing.fontes.push(name);
    return;
  }
  playlists.set(item.id, { id: item.id, titulo: snippet.title, descricao: snippet.description ?? '', canal: snippet.channelTitle || name, fontes: [name], publicadoEm: snippet.publishedAt, miniatura: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '', quantidadeVideos: item.contentDetails?.itemCount ?? 0 });
};
for (const [, name, link] of blocks) {
  const sourceUrl = new URL(link);
  let playlist = sourceUrl.searchParams.get('list');
  if (playlist) {
    const result = await api('playlists', { part: 'snippet,contentDetails', id: playlist });
    if (!result.items?.length) throw new Error('Playlist não encontrada: ' + name);
    for (const item of result.items) addPlaylist(item, name);
  }
  if (!playlist) {
    const handle = sourceUrl.pathname.split('/').filter(Boolean)[0];
    if (!handle?.startsWith('@')) throw new Error(`Endereço de canal não reconhecido: ${link}`);
    const result = await api('channels', { part: 'contentDetails', forHandle: handle });
    playlist = result.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!playlist) throw new Error(`Canal não encontrado: ${name}`);
    const channelId = result.items[0].id;
    let nextPage;
    do {
      const params = { part: 'snippet,contentDetails', channelId, maxResults: '50' };
      if (nextPage) params.pageToken = nextPage;
      const page = await api('playlists', params);
      for (const item of page.items ?? []) addPlaylist(item, name);
      nextPage = page.nextPageToken;
    } while (nextPage);
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
// Busca as visualizações em lotes de até 50 vídeos por requisição.
const ids = [...videos.keys()];
for (let i = 0; i < ids.length; i += 50) {
  const result = await api('videos', { part: 'statistics', id: ids.slice(i, i + 50).join(',') });
  for (const item of result.items ?? []) {
    const video = videos.get(item.id);
    const count = item.statistics?.viewCount;
    if (video && count != null && Number.isSafeInteger(Number(count))) video.visualizacoes = Number(count);
  }
}
const catalog = { atualizadoEm: new Date().toISOString(), playlists: [...playlists.values()], videos: [...videos.values()].sort ( (a, b) => b.publicadoEm.localeCompare(a.publicadoEm)) };
await writeFile(new URL('../public/data/videos.json', import.meta.url), JSON.stringify(catalog));
console.log(`${catalog.videos.length} vídeos e ${catalog.playlists.length} playlists salvos.`);
