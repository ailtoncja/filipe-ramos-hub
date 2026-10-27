# Filipe Ramos Hub

Um ponto de encontro feito por fãs para reunir conteúdo do Filipe Ramos e dos canais que ajudam a preservar suas lives, vídeos e cortes. O projeto facilita a descoberta desse conteúdo e organiza materiais relacionados aos jogos em um só lugar.

> Este é um projeto de fãs e não possui afiliação oficial com Filipe Ramos.

## O que você encontra aqui

- **Busca de vídeos:** pesquise títulos e descrições dos vídeos das fontes cadastradas, filtre por canal e ordene por data ou número de visualizações. Os resultados levam ao YouTube.
- **Glossário de canais:** encontre canais oficiais e canais da comunidade que preservam lives e cortes.
- **Lives avulsas:** acesse transmissões individuais reunidas pela comunidade.
- **Playlist:** ouça a playlist do Spotify usada nas lives.
- **Care Packages:** encontre materiais por jogo, incluindo mods, downloads, mapas, tutoriais e, quando disponíveis, lives e vídeos oficiais.
- **Temas claro e escuro:** escolha sua preferência, que fica salva no navegador.

## Como executar

Você precisa do Node.js e do npm instalados. O projeto utiliza Node.js 24 na automação.

```bash
npm ci
npm start
```

Abra [http://localhost:4200](http://localhost:4200). O site atualiza automaticamente durante o desenvolvimento.

Para compilar ou executar os testes:

```bash
npm run build
npm test -- --watch=false
```

O site é construído com **Angular**, **TypeScript** e **Tailwind CSS**.

## Como o catálogo de vídeos funciona

A busca usa o arquivo `public/data/videos.json`. Ele é gerado a partir das fontes listadas em `src/app/data/canais.data.ts`: para canais, o script consulta a playlist de uploads; quando a fonte cadastrada é uma playlist, ele consulta apenas os vídeos dessa playlist.

A pesquisa considera títulos e descrições, sem diferenciar maiúsculas ou acentos. As visualizações refletem a última atualização do catálogo. Vídeos privados, removidos ou indisponíveis podem não aparecer; a contagem de visualizações pode não estar disponível para todos os vídeos.

### Atualização manual

Para gerar o catálogo, crie uma chave para a [YouTube Data API v3](https://developers.google.com/youtube/v3/getting-started) e restrinja seu uso à API. No PowerShell, dentro da pasta do projeto:

```powershell
$env:YOUTUBE_API_KEY = 'SUA_CHAVE'
npm run atualizar-videos
```

A variável vale para a sessão atual do PowerShell. Não coloque a chave nos arquivos do projeto nem a compartilhe publicamente. Se alguma fonte ou requisição falhar, o script preserva o catálogo anterior.

### Atualização automática

O workflow **Atualizar catálogo de vídeos** roda diariamente, pode ser iniciado manualmente na aba Actions e também é executado quando o script de atualização é alterado. Para configurá-lo:

1. No GitHub, adicione a chave como segredo de repositório com o nome `YOUTUBE_API_KEY`.
2. Permita que o workflow grave no repositório e verifique se as regras da branch permitem o envio do catálogo.
3. Execute o workflow manualmente uma vez e confira o resultado na aba **Actions**.
4. Garanta que a hospedagem publique as atualizações do repositório.

O workflow **Verificação** executa a auditoria de dependências, a compilação e os testes em pushes e pull requests. O Dependabot também verifica atualizações de dependências e das GitHub Actions semanalmente.

## Organização do projeto

- `src/app/components/`: seções e componentes da interface.
- `src/app/data/`: canais, lives, vídeos oficiais e materiais dos jogos.
- `scripts/atualizar-videos.mjs`: coleta os dados para o catálogo de busca.
- `public/data/videos.json`: catálogo utilizado pelo site.
- `.github/`: workflows e configuração do Dependabot.
