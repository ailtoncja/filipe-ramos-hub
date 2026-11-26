import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FONTES } from '@/data/fontes';
import {
  encontrarPlaylistsDoJogo,
  filtrarCatalogo,
  mesclarExtrasCatalogo,
} from './catalog';
import type { Catalogo } from './types';
import { parseYoutubeUrl } from './youtube';
import {
  mesclarNovidadesNoCatalogo,
  parseYoutubeAtomFeed,
  parseYoutubeChannelPlaylistsHtml,
} from './youtube-feeds';

const CATALOGO_EXEMPLO: Catalogo = {
  atualizadoEm: '2026-11-25T17:59:16.569Z',
  videos: [
    {
      id: 'v1',
      titulo: 'Bloodborne — Guia de Yharnam',
      descricao: 'Mapa e segredos',
      canal: 'Filipe Ramos',
      fontes: ['@FilipeRamos96'],
      publicadoEm: '2025-05-01T12:00:00Z',
      miniatura: 'https://i.ytimg.com/vi/v1/mqdefault.jpg',
      visualizacoes: 500000,
    },
    {
      id: 'v2',
      titulo: 'The Witcher 3: Wild Hunt — Live #1',
      descricao: 'Jogando com Care Package 4.04',
      canal: 'Não é o Filipe Ramos',
      fontes: ['@NaoeoFilipeRamos-qs7bo'],
      publicadoEm: '2026-10-10T12:00:00Z',
      miniatura: 'https://i.ytimg.com/vi/v2/mqdefault.jpg',
      visualizacoes: 12000,
    },
  ],
  playlists: [
    {
      id: 'PL_WITCHER',
      titulo: 'The Witcher 3',
      descricao: '',
      canal: 'Filipe Ramos',
      fontes: ['@FilipeRamos96'],
      publicadoEm: '2024-01-01T00:00:00Z',
      miniatura: 'https://i.ytimg.com/vi/v2/mqdefault.jpg',
      quantidadeVideos: 4,
    },
  ],
};

describe('catalog helpers', () => {
  it('inclui a live avulsa de Far Cry 2 ao mesclar extras sem duplicar', () => {
    const mesclado = mesclarExtrasCatalogo(CATALOGO_EXEMPLO);
    expect(mesclado.videos.some((v) => v.id === '_QC05QckzLs')).toBe(true);
    const mesclado2 = mesclarExtrasCatalogo(mesclado);
    expect(mesclado2.videos.filter((v) => v.id === '_QC05QckzLs')).toHaveLength(1);
  });

  it('filtra sem diferenciar acentos e ordena por visualizações', () => {
    const porBusca = filtrarCatalogo(CATALOGO_EXEMPLO, {
      tipo: 'videos',
      busca: 'nao e o filipe witcher',
      fonte: '',
      ordem: 'recentes',
    });
    expect(porBusca.map((v) => v.id)).toEqual(['v2']);

    const maisVistos = filtrarCatalogo(CATALOGO_EXEMPLO, {
      tipo: 'videos',
      busca: '',
      fonte: '',
      ordem: 'vistos',
    });
    expect(maisVistos.map((v) => v.id)).toEqual(['v1', 'v2']);
  });

  it('encontra playlists relacionadas a um jogo sem duplicar URLs já curadas', () => {
    const semDuplicar = encontrarPlaylistsDoJogo(
      'The Witcher 3: Wild Hunt',
      CATALOGO_EXEMPLO.playlists,
      [],
    );
    expect(semDuplicar.map((p) => p.id)).toEqual(['PL_WITCHER']);

    const deduplicado = encontrarPlaylistsDoJogo(
      'The Witcher 3: Wild Hunt',
      CATALOGO_EXEMPLO.playlists,
      ['https://www.youtube.com/playlist?list=PL_WITCHER'],
    );
    expect(deduplicado).toEqual([]);
  });

  it('extrai todas as 13 fontes com o mesmo regex do script atualizar-videos.mjs', () => {
    const fonteFile = readFileSync(
      path.join(process.cwd(), 'src', 'data', 'fontes.ts'),
      'utf8',
    );
    const matches = [
      ...fonteFile.matchAll(/\{\s*nome:\s*'([^']+)'[\s\S]*?youtubeUrl:\s*'([^']+)'/g),
    ];
    expect(matches).toHaveLength(FONTES.length);
  });
});

describe('parseYoutubeUrl', () => {
  it('converte vídeo com timestamp e playlist para embed youtube-nocookie', () => {
    const single = parseYoutubeUrl('https://www.youtube.com/watch?v=EN2fTXiaRXA&t=5764s');
    expect(single?.embedUrl).toBe(
      'https://www.youtube-nocookie.com/embed/EN2fTXiaRXA?start=5764',
    );
    expect(single?.ehPlaylist).toBe(false);

    const list = parseYoutubeUrl(
      'https://www.youtube.com/watch?v=Wqf_eESeHiA&list=PLW0ps8BYf-tY',
    );
    expect(list?.embedUrl).toBe(
      'https://www.youtube-nocookie.com/embed/Wqf_eESeHiA?list=PLW0ps8BYf-tY',
    );
    expect(list?.ehPlaylist).toBe(true);
  });
});

describe('live RSS feed sync', () => {
  it('interpreta feed Atom do YouTube e mescla novos vídeos sem duplicar existentes', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
        <title>Filipe Ramos</title>
        <published>2026-11-26T00:00:00+00:00</published>
        <entry>
          <yt:videoId>novo123</yt:videoId>
          <title>Live Nova &amp; Quente</title>
          <author><name>Filipe Ramos</name></author>
          <published>2026-11-26T03:00:00+00:00</published>
          <media:group>
            <media:description>Descrição da live</media:description>
            <media:community><media:statistics views="4321"/></media:community>
          </media:group>
        </entry>
        <entry>
          <yt:videoId>v1</yt:videoId>
          <title>Bloodborne — Guia de Yharnam</title>
          <author><name>Filipe Ramos</name></author>
          <published>2025-05-01T12:00:00+00:00</published>
          <media:group>
            <media:description>Mapa e segredos</media:description>
            <media:community><media:statistics views="550000"/></media:community>
          </media:group>
        </entry>
      </feed>`;

    const parsed = parseYoutubeAtomFeed(xml, '@FilipeRamos96');
    expect(parsed.videos).toHaveLength(2);
    expect(parsed.videos[0].titulo).toBe('Live Nova & Quente');
    expect(parsed.videos[0].visualizacoes).toBe(4321);

    const mesclado = mesclarNovidadesNoCatalogo(CATALOGO_EXEMPLO, {
      videos: parsed.videos,
      playlistsAtualizadas: [],
      sincronizadoEm: '2026-11-26T04:00:00Z',
      fontesComSucesso: 1,
    });

    expect(mesclado.videos[0].id).toBe('novo123');
    expect(mesclado.videos.filter((v) => v.id === 'v1')).toHaveLength(1);
    expect(mesclado.videos.find((v) => v.id === 'v1')?.visualizacoes).toBe(550000);
  });

  it('descobre playlists novas e atualiza contagem de vídeos a partir do HTML do canal', () => {
    const fakeHtml = `<script>var ytInitialData = ${JSON.stringify({
      contents: {
        items: [
          {
            lockupViewModel: {
              contentType: 'LOCKUP_CONTENT_TYPE_PLAYLIST',
              contentId: 'PL_WITCHER',
              metadata: {
                lockupMetadataViewModel: { title: { content: 'The Witcher 3' } },
              },
              contentImage: {
                collectionThumbnailViewModel: {
                  primaryThumbnail: {
                    thumbnailViewModel: {
                      image: { sources: [{ url: 'https://i.ytimg.com/vi/abc/hqdefault.jpg' }] },
                      overlays: [{ text: '9 vídeos' }],
                    },
                  },
                },
              },
            },
          },
          {
            lockupViewModel: {
              contentType: 'LOCKUP_CONTENT_TYPE_PLAYLIST',
              contentId: 'PL_GTA6_NEW',
              metadata: {
                lockupMetadataViewModel: { title: { content: 'GTA 6 Completo' } },
              },
              contentImage: {
                collectionThumbnailViewModel: {
                  primaryThumbnail: {
                    thumbnailViewModel: {
                      image: { sources: [{ url: 'https://i.ytimg.com/vi/xyz/hqdefault.jpg' }] },
                      overlays: [{ text: '6 vídeos' }],
                    },
                  },
                },
              },
            },
          },
        ],
      },
    })};</script>`;

    const playlists = parseYoutubeChannelPlaylistsHtml(
      fakeHtml,
      FONTES[0],
      '2026-11-26T04:00:00Z',
    );
    expect(playlists).toHaveLength(2);
    expect(playlists[0].quantidadeVideos).toBe(9);
    expect(playlists[1].id).toBe('PL_GTA6_NEW');

    const mesclado = mesclarNovidadesNoCatalogo(CATALOGO_EXEMPLO, {
      videos: [],
      playlistsAtualizadas: playlists,
      sincronizadoEm: '2026-11-26T04:00:00Z',
      fontesComSucesso: 1,
    });
    expect(mesclado.playlists).toHaveLength(2);
    expect(mesclado.playlists.find((p) => p.id === 'PL_WITCHER')?.quantidadeVideos).toBe(9);
    expect(mesclado.playlists.some((p) => p.id === 'PL_GTA6_NEW')).toBe(true);
  });
});
