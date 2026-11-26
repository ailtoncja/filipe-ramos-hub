# Sincronização ao vivo do Catálogo via feeds Atom/RSS do YouTube

Status: accepted

Para evitar esperar o job diário do GitHub Actions e um novo deploy na Vercel a cada vídeo publicado, o servidor Next.js consulta em paralelo os feeds Atom/RSS públicos oficiais do YouTube (`feeds/videos.xml?channel_id=...` e `?playlist_id=...`) de todas as fontes em `src/data/fontes.ts` com cache de 3 minutos (`/api/catalogo` e SSR da página inicial) e mescla os lançamentos mais recentes sobre o arquivo histórico `public/data/videos.json`.

## Considered Options

- **Camada híbrida `videos.json` (histórico completo) + RSS ao vivo a cada 3 min** (escolhida): zero cota de API, zero chave secreta em runtime, zero redeploy para novos vídeos aparecerem na busca, com fallback automático para `videos.json` se algum feed falhar.
- **Rodar a YouTube Data API v3 em runtime na Vercel**: exigiria `YOUTUBE_API_KEY` em produção e estouraria rapidamente a cota diária com tráfego de fãs.
- **Aumentar frequência do cron no GitHub Actions**: ainda dependeria de commit + fila de build/deploy da Vercel a cada atualização, gerando dezenas de commits vazios por semana.

## Consequences

- Cada nova fonte adicionada em `src/data/fontes.ts` deve informar `channelId` (para canais) ou `playlistId` (para playlists) para participar da sincronização instantânea.
- O arquivo `public/data/videos.json` continua responsável pelo histórico completo (além dos 15 vídeos mais recentes de cada feed) e pela indexação completa de playlists de canais.
