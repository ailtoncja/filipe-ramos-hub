# Filipe Ramos Hub

Um diretório comunitário feito por fãs para pesquisar vídeos, lives e playlists do Filipe Ramos nas fontes da comunidade e acessar Care Packages completos por jogo.

> Este é um projeto de fãs e não possui afiliação oficial com Filipe Ramos.

## O que você encontra aqui

- **Catálogo de Vídeos e Playlists (`/`)**: pesquisa sem acentos por título, descrição e canal em 13 fontes oficiais e da comunidade (mais transmissões avulsas preservadas), com filtros refletidos na URL, controle de escala da grade e player rápido embutido com link direto para o YouTube.
- **Care Packages (`/care-packages` e `/care-packages/[slug]`)**: diretório pesquisável e filtrável de jogos, com página dedicada e compartilhável para cada Care Package contendo downloads, listas de mods agrupadas, avisos de versão, guias passo a passo com trechos copiáveis, tutoriais de instalação e área de mídia com **Lives**, **Vídeos oficiais** e **Playlists relacionadas**.
- **Temas claro e escuro**: alternância salva no navegador sem flash de tema ao carregar.

## Como executar

```bash
npm ci
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Para validar tipos, testes e build de produção:

```bash
npm run typecheck
npm test
npm run build
```

Construído com **Next.js (App Router)**, **React**, **TypeScript** e **Tailwind CSS**.

## Atualização do catálogo de vídeos

O arquivo `public/data/videos.json` é gerado a partir das fontes listadas em `src/data/fontes.ts`:

```powershell
$env:YOUTUBE_API_KEY = 'SUA_CHAVE'
npm run atualizar-videos
```

O workflow `.github/workflows/atualizar-videos.yml` executa essa atualização diariamente no GitHub Actions.
