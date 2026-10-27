# Site

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Busca de vídeos

A busca usa `public/data/videos.json`, gerado a partir das fontes cadastradas em `src/app/data/canais.data.ts`. Os canais são percorridos pela playlist de uploads; quando o endereço cadastrado é uma playlist, somente seus vídeos são incluídos. Cada resultado abre no YouTube. A pesquisa considera título e descrição, sem diferenciar maiúsculas ou acentos.

Para preencher ou atualizar o catálogo:

1. Crie um projeto no Google Cloud, ative a YouTube Data API v3 e gere uma chave de API. Consulte https://developers.google.com/youtube/v3/getting-started.
2. No PowerShell, execute `$env:YOUTUBE_API_KEY = 'SUA_CHAVE'` e depois `npm run atualizar-videos`. Não salve a chave no código ou no repositório.
3. Publique o arquivo `public/data/videos.json` gerado junto com o site.

Para atualização diária pelo GitHub Actions, configure a chave no segredo `YOUTUBE_API_KEY` do repositório, habilite permissões de escrita para workflows e execute o workflow **Atualizar catálogo de vídeos** manualmente uma vez. Depois ele roda diariamente e envia o catálogo atualizado ao repositório. O deploy precisa acompanhar esses commits. Caso a configuração de proteção de branch impeça pushes, ajuste o fluxo de publicação de acordo com as regras do repositório.

O script não substitui o catálogo anterior se alguma fonte ou requisição falhar. Confira os logs do workflow quando uma atualização falhar. A disponibilidade dos vídeos e os limites da API podem afetar os resultados.
