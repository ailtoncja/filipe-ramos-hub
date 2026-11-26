# Sequências automáticas por Fonte e Maratonas compartilháveis por URL

Status: accepted

Para facilitar a descoberta e reprodução ordenada de séries de lives sem exigir playlists no YouTube nem contas/banco de dados, adotamos duas camadas complementares sobre o **Catálogo**:

1. **Sequência automática (`src/lib/sequencias.ts`)**: ao abrir um **Vídeo** no player, o Hub agrupa outros **Vídeos** da mesma **Fonte** que compartilham o mesmo título-base normalizado (descartando marcadores de episódio como `#1`, `pt2`, `Parte 3`, `1/2`), ordenando-os por número de episódio/sub-parte e data. Agrupar dentro da mesma **Fonte** evita duplicar o mesmo episódio vindo de múltiplos canais de arquivo.
2. **Maratona local e compartilhável por URL (`/?maratona=id1,id2,...&titulo=...`)**: qualquer usuário pode montar uma fila customizada (inclusive misturando **Fontes**), salvá-la no `localStorage` com nome próprio e compartilhar por URL. Quem abre o link entra direto no player com a fila ordenada e pode salvar a **Maratona** localmente em 1 clique.

## Considered Options

- **Sequências por heurística na mesma Fonte + Maratonas locais/URL** (escolhida): zero custo de servidor/banco, funciona instantaneamente para mais de 100 sequências já existentes no catálogo e permite compor manualmente séries fragmentadas entre vários canais.
- **Persistir Maratonas em banco de dados com links curtos (`/m/abc123`)**: exigiria backend stateful, moderação contra spam e custo de infraestrutura.
- **Misturar todas as Fontes na Sequência automática**: frequentemente duplicaria episódios (`#1` do Baú de Lives + `#1` de canal não oficial lado a lado), degradando a experiência de maratona.

## Consequences

- URLs de **Maratona** são limitadas a 50 **Vídeos** (suficiente para qualquer série longa e segura para o limite de comprimento de URL dos navegadores).
- Títulos sem padrão numérico claro podem não entrar em uma **Sequência** automática, mas continuam facilmente agrupáveis via botão **"Maratonar em ordem"** na busca ou montagem manual na fila.
