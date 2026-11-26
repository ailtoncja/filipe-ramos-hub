# Migrar de Angular para Next.js (App Router)

Status: accepted

O projeto existia em Angular 22, mas será reconstruído do zero com Next.js (App Router), React, TypeScript e Tailwind CSS mantendo o deploy na Vercel e a automação diária que gera `public/data/videos.json`. A migração viabiliza rotas compartilháveis pré-renderizadas para cada Care Package, carregamento otimizado com Server Components e aderência direta às práticas de performance React/Vercel sem exigir backend dedicado.

## Considered Options

- **Next.js (App Router) + React + TypeScript + Tailwind CSS** (escolhida): deploy nativo na Vercel, SSG/RSC para rotas de Care Packages e busca otimizada.
- **React + Vite (SPA)**: mais leve na configuração, mas sem pré-renderização nativa por rota nem otimizações de Server Components.
- **Manter Angular 22**: evitaria reescrita de infraestrutura, mas contrariaria a preferência pela stack React/Vercel no redesign completo.

## Consequences

- `vercel.json`, `.github/workflows/verificacao.yml` e o caminho lido por `scripts/atualizar-videos.mjs` (atualmente `src/app/data/canais.data.ts`) precisam ser atualizados para a nova estrutura Next.js.
- Todos os arquivos de dados (Care Packages, lives, vídeos oficiais e fontes) serão portados para módulos TypeScript limpos, preservando o contrato de `public/data/videos.json`.
