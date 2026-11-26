# Status ao vivo da Twitch sem credenciais obrigatórias e biblioteca pessoal local

Status: accepted

Para exibir a **Transmissão** da Twitch (`filiperaaamos`) e oferecer **Salvos**, **Assistidos** e **Continuar assistindo** sem exigir login, banco de dados ou credenciais obrigatórias na Vercel, adotamos:

1. Uma rota de servidor `/api/twitch` com cache de 2 minutos que usa a Twitch Helix API quando `TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET` estiverem configuradas e, na ausência delas, consulta os endpoints públicos de leitura do `decapi.me`, cruzando automaticamente o **Jogo** atual com os **Care Packages** do Hub.
2. Persistência exclusivamente local no navegador (`localStorage`, chave versionada `frh:biblioteca:v1`) para **Salvo**, **Assistido** (marcação manual) e **Continuar assistindo** (registro automático ao abrir o player).

## Considered Options

- **Proxy `/api/twitch` com fallback `decapi.me` + upgrade opcional para Twitch Helix** (escolhida): funciona imediatamente sem criar aplicativo ou gerenciar tokens na Vercel, protege o cliente de CORS/latência via cache de 2 minutos e permite ativar Helix apenas adicionando variáveis de ambiente.
- **Exigir Twitch Helix API desde o início**: mais oficial, mas adiciona setup manual de credenciais e renovação de OAuth antes de entregar valor.
- **Contas de usuário + banco de dados para Salvos/Assistidos**: introduziria autenticação, LGPD, custo de banco e fricção para um site comunitário de consulta rápida; `localStorage` entrega resposta instantânea com zero fricção.

## Consequences

- Caso o `decapi.me` fique temporariamente indisponível ou mude de formato, `/api/twitch` degrada silenciosamente (`null`) sem afetar a renderização do **Catálogo**; configurar `TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET` na Vercel ativa automaticamente a API oficial da Twitch.
- **Salvos**, **Assistidos** e **Continuar assistindo** ficam vinculados ao navegador atual (sem sincronização entre aparelhos até que uma opção de exportar/importar seja necessária).
