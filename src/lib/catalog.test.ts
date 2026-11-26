import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FONTES } from '@/data/fontes';
import {
  alternarAssistido,
  alternarNaFila,
  alternarSalvo,
  BIBLIOTECA_VAZIA,
  limparRecentesBiblioteca,
  moverNaFila,
  parsearBibliotecaLocal,
  registrarRecente,
  removerMaratonaLocal,
  salvarMaratonaLocal,
} from './biblioteca-local';
import {
  encontrarPlaylistsDoJogo,
  filtrarCatalogo,
  mesclarExtrasCatalogo,
} from './catalog';
import {
  encontrarSequenciaDoVideo,
  extrairInfoEpisodio,
  montarUrlMaratona,
  parsearMaratonaDaUrl,
} from './sequencias';
import {
  encontrarCarePackageParaJogoTwitch,
  interpretarUptimeDecApi,
} from './twitch';
import type { Catalogo } from './types';
import { embedDePlaylistId, parseYoutubeUrl } from './youtube';
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

  it('filtra apenas os canais oficiais do Filipe em vídeos e playlists', () => {
    const catalogoComComunidade: Catalogo = {
      ...CATALOGO_EXEMPLO,
      videos: [
        ...CATALOGO_EXEMPLO.videos,
        {
          id: 'v3',
          titulo: 'Live oficial no Baú',
          descricao: '',
          canal: 'Filipe Ramos - Baú de Lives',
          fontes: ['@filiperamoslives'],
          publicadoEm: '2026-11-01T12:00:00Z',
          miniatura: 'https://i.ytimg.com/vi/v3/mqdefault.jpg',
          visualizacoes: 9000,
        },
      ],
      playlists: [
        ...CATALOGO_EXEMPLO.playlists,
        {
          id: 'PL_COMUNIDADE',
          titulo: 'GTA 6 Comunidade',
          descricao: '',
          canal: 'rapouzer',
          fontes: ['@rapouzer'],
          publicadoEm: '2026-11-20T00:00:00Z',
          miniatura: 'https://i.ytimg.com/vi/v3/mqdefault.jpg',
          quantidadeVideos: 7,
        },
      ],
    };

    const videosOficiais = filtrarCatalogo(catalogoComComunidade, {
      tipo: 'videos',
      busca: '',
      fonte: '',
      somenteOficiais: true,
      ordem: 'recentes',
    });
    expect(videosOficiais.map((v) => v.id)).toEqual(['v3', 'v1']);

    const playlistsOficiais = filtrarCatalogo(catalogoComComunidade, {
      tipo: 'playlists',
      busca: '',
      fonte: '',
      categoriaFonte: 'oficiais',
      ordem: 'recentes',
    });
    expect(playlistsOficiais.map((p) => p.id)).toEqual(['PL_WITCHER']);

    const videosNaoOficiais = filtrarCatalogo(catalogoComComunidade, {
      tipo: 'videos',
      busca: '',
      fonte: '',
      categoriaFonte: 'nao-oficiais',
      ordem: 'recentes',
    });
    expect(videosNaoOficiais.map((v) => v.id)).toEqual(['v2']);

    const playlistsNaoOficiais = filtrarCatalogo(catalogoComComunidade, {
      tipo: 'playlists',
      busca: '',
      fonte: '',
      categoriaFonte: 'nao-oficiais',
      ordem: 'recentes',
    });
    expect(playlistsNaoOficiais.map((p) => p.id)).toEqual(['PL_COMUNIDADE']);
  });

  it('encontra séries abreviadas (NFS Unbound ao buscar need for speed, GTA 4, RE9, FFXII, S.T.A.L.K.E.R.) e prioriza título sobre descrição', () => {
    const catalogoAliases: Catalogo = {
      atualizadoEm: '2026-11-26T00:00:00Z',
      videos: [
        {
          id: 'nfs-unbound',
          titulo: 'Continuando NFS Unbound #2',
          descricao: 'Broadcasted live on Twitch',
          canal: 'Filipe Ramos - Baú de Lives',
          fontes: ['@filiperamoslives'],
          publicadoEm: '2023-01-07T00:11:02Z',
          miniatura: '',
        },
        {
          id: 'desc-only',
          titulo: 'The Crew: Carro Secreto',
          descricao: 'Curti muito jogar Need for Speed semana passada',
          canal: 'Filipe Ramos',
          fontes: ['@FilipeRamos96'],
          publicadoEm: '2026-11-01T00:00:00Z',
          miniatura: '',
        },
        {
          id: 'gtaiv',
          titulo: 'Filipe Ramos live de GtaIV pt5',
          descricao: '',
          canal: 'aeithales',
          fontes: ['@aeithales'],
          publicadoEm: '2024-01-01T00:00:00Z',
          miniatura: '',
        },
        {
          id: 'stalker',
          titulo: 'S.T.A.L.K.E.R. - Call of Pripyat #3',
          descricao: '',
          canal: 'Filipe Ramos - Baú de Lives',
          fontes: ['@filiperamoslives'],
          publicadoEm: '2025-01-01T00:00:00Z',
          miniatura: '',
        },
        {
          id: 're9',
          titulo: 'RE9: Brincando um tico no modo de jogo novo.',
          descricao: '',
          canal: 'Filipe Ramos - Baú de Lives',
          fontes: ['@filiperamoslives'],
          publicadoEm: '2026-06-01T00:00:00Z',
          miniatura: '',
        },
        {
          id: 'ffxii',
          titulo: 'FFXII: Jogando com o meu mod #8',
          descricao: '',
          canal: 'Filipe Ramos - Baú de Lives',
          fontes: ['@filiperamoslives'],
          publicadoEm: '2025-06-01T00:00:00Z',
          miniatura: '',
        },
        {
          id: 'dd2',
          titulo: 'DD2: Dark Arisen (Hard)',
          descricao: '',
          canal: 'Filipe Ramos - Baú de Lives',
          fontes: ['@filiperamoslives'],
          publicadoEm: '2025-07-01T00:00:00Z',
          miniatura: '',
        },
      ],
      playlists: [],
    };

    const porNeedForSpeed = filtrarCatalogo(catalogoAliases, {
      tipo: 'videos',
      busca: 'need for speed',
      fonte: '',
      ordem: 'recentes',
    });
    // Mesmo sendo mais antigo, NFS Unbound (título) deve vir antes do vídeo que só menciona na descrição
    expect(porNeedForSpeed.map((v) => v.id)).toEqual(['nfs-unbound', 'desc-only']);

    expect(
      filtrarCatalogo(catalogoAliases, {
        tipo: 'videos',
        busca: 'need for speed unboud',
        fonte: '',
        ordem: 'recentes',
      }).map((v) => v.id),
    ).toEqual(['nfs-unbound']);

    expect(
      filtrarCatalogo(catalogoAliases, {
        tipo: 'videos',
        busca: 'gta 4',
        fonte: '',
        ordem: 'recentes',
      }).map((v) => v.id),
    ).toEqual(['gtaiv']);

    expect(
      filtrarCatalogo(catalogoAliases, {
        tipo: 'videos',
        busca: 'stalker',
        fonte: '',
        ordem: 'recentes',
      }).map((v) => v.id),
    ).toEqual(['stalker']);

    expect(
      filtrarCatalogo(catalogoAliases, {
        tipo: 'videos',
        busca: 'resident evil 9',
        fonte: '',
        ordem: 'recentes',
      }).map((v) => v.id),
    ).toEqual(['re9']);

    expect(
      filtrarCatalogo(catalogoAliases, {
        tipo: 'videos',
        busca: 'final fantasy 12',
        fonte: '',
        ordem: 'recentes',
      }).map((v) => v.id),
    ).toEqual(['ffxii']);

    expect(
      filtrarCatalogo(catalogoAliases, {
        tipo: 'videos',
        busca: "dragon's dogma 2",
        fonte: '',
        ordem: 'recentes',
      }).map((v) => v.id),
    ).toEqual(['dd2']);
  });

  it('no catálogo real (public/data/videos.json), buscar "need for speed" retorna toda a série NFS Unbound e "stalker" encontra S.T.A.L.K.E.R.', () => {
    const real = JSON.parse(
      readFileSync(path.join(process.cwd(), 'public', 'data', 'videos.json'), 'utf8'),
    ) as Catalogo;

    const nfs = filtrarCatalogo(real, {
      tipo: 'videos',
      busca: 'need for speed',
      fonte: '',
      ordem: 'recentes',
    });
    const nfsUnbound = nfs.filter((v) => /unbound/i.test(v.titulo));
    expect(nfsUnbound.length).toBeGreaterThanOrEqual(10);

    const gta4 = filtrarCatalogo(real, {
      tipo: 'videos',
      busca: 'gta 4',
      fonte: '',
      ordem: 'recentes',
    });
    expect(gta4.some((v) => /gtaiv/i.test(v.titulo))).toBe(true);

    const stalker = filtrarCatalogo(real, {
      tipo: 'videos',
      busca: 'stalker',
      fonte: '',
      ordem: 'recentes',
    });
    expect(stalker.length).toBeGreaterThanOrEqual(15);
  });

  it('remove playlists ocultas tanto na base quanto durante a sincronização ao vivo', () => {
    const ocultaId = 'PLGSGmwDgc4XRwVq8Fbx1ATQGNd9dx-Xjc';
    const comOculta: Catalogo = {
      ...CATALOGO_EXEMPLO,
      playlists: [
        ...CATALOGO_EXEMPLO.playlists,
        {
          id: ocultaId,
          titulo: 'Playlist removida',
          descricao: '',
          canal: 'Cortes do Filipe Ramos',
          fontes: ['@cortesdofiliperamos'],
          publicadoEm: '2025-01-01T00:00:00Z',
          miniatura: '',
          quantidadeVideos: 4,
        },
      ],
    };

    const filtradoBase = mesclarExtrasCatalogo(comOculta);
    expect(filtradoBase.playlists.some((p) => p.id === ocultaId)).toBe(false);

    const filtradoLive = mesclarNovidadesNoCatalogo(CATALOGO_EXEMPLO, {
      videos: [],
      playlistsAtualizadas: [comOculta.playlists[1]],
      sincronizadoEm: '2026-11-26T08:00:00Z',
      fontesComSucesso: 1,
    });
    expect(filtradoLive.playlists.some((p) => p.id === ocultaId)).toBe(false);
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

  it('extrai todas as fontes e playlistIds com o mesmo regex do script atualizar-videos.mjs', () => {
    const fonteFile = readFileSync(
      path.join(process.cwd(), 'src', 'data', 'fontes.ts'),
      'utf8',
    );
    const matches = [
      ...fonteFile.matchAll(/\{\s*nome:\s*'([^']+)'[\s\S]*?youtubeUrl:\s*'([^']+)'[\s\S]*?\}/g),
    ];
    expect(matches).toHaveLength(FONTES.length);
    const divine = matches.find((m) => m[1] === '@allglorythegod');
    expect(divine).toBeDefined();
    const listMatch = divine?.[0].match(/playlistIds:\s*\[([\s\S]*?)\]/);
    const ids = [...(listMatch?.[1].matchAll(/'([^']+)'/g) ?? [])].map((m) => m[1]);
    expect(ids).toHaveLength(22);
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

    const fallbackList = parseYoutubeUrl(
      'https://www.youtube.com/watch?v=KGkJMJviRQs&list=PLR2b8Khskp2E',
    );
    expect(fallbackList?.embedUrl).toBe(
      'https://www.youtube-nocookie.com/embed/KGkJMJviRQs?playlist=KGkJMJviRQs,62guKHVWWGg,-goCG4BGqsg',
    );
    expect(embedDePlaylistId('PLR2b8Khskp2E')).toBe(
      'https://www.youtube-nocookie.com/embed/KGkJMJviRQs?playlist=KGkJMJviRQs,62guKHVWWGg,-goCG4BGqsg&autoplay=1',
    );
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
          <yt:videoId>short999</yt:videoId>
          <link rel="alternate" href="https://www.youtube.com/shorts/short999"/>
          <title>Corte vertical #shorts</title>
          <author><name>Filipe Ramos - Vibes</name></author>
          <published>2026-11-26T03:30:00+00:00</published>
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
    expect(parsed.videos.some((v) => v.id === 'short999')).toBe(false);
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

describe('biblioteca local e integração Twitch', () => {
  it('gerencia Salvos, Assistidos e Continuar assistindo (limite 4 e deduplicação)', () => {
    let estado = BIBLIOTECA_VAZIA;
    estado = alternarSalvo(estado, 'v1', 'videos');
    estado = alternarSalvo(estado, 'PL1', 'playlists');
    expect(estado.salvosVideos).toEqual(['v1']);
    expect(estado.salvosPlaylists).toEqual(['PL1']);

    // Remover salvo
    estado = alternarSalvo(estado, 'v1', 'videos');
    expect(estado.salvosVideos).toEqual([]);

    // Marcar e desmarcar assistido
    estado = alternarAssistido(estado, 'v1');
    expect(estado.assistidosVideos).toEqual(['v1']);
    estado = alternarAssistido(estado, 'v1');
    expect(estado.assistidosVideos).toEqual([]);

    // Histórico recente mantém no máximo 4 itens únicos ordenados do mais recente
    estado = registrarRecente(estado, 'a', 'videos', 1);
    estado = registrarRecente(estado, 'b', 'videos', 2);
    estado = registrarRecente(estado, 'c', 'playlists', 3);
    estado = registrarRecente(estado, 'd', 'videos', 4);
    estado = registrarRecente(estado, 'e', 'videos', 5);
    estado = registrarRecente(estado, 'b', 'videos', 6);
    expect(estado.recentes.map((r) => r.id)).toEqual(['b', 'e', 'd', 'c']);

    const reidratado = parsearBibliotecaLocal(JSON.stringify(estado));
    expect(reidratado.recentes).toHaveLength(4);
    expect(parsearBibliotecaLocal('{json-quebrado')).toEqual(BIBLIOTECA_VAZIA);
    expect(limparRecentesBiblioteca(estado).recentes).toEqual([]);
  });

  it('interpreta status da Twitch e cruza Jogo com Care Package correspondente', () => {
    expect(interpretarUptimeDecApi('filiperaaamos is offline')).toEqual({
      aoVivo: false,
      tempoAoVivo: null,
    });
    expect(interpretarUptimeDecApi('2 hours, 15 minutes')).toEqual({
      aoVivo: true,
      tempoAoVivo: '2 hours, 15 minutes',
    });

    expect(
      encontrarCarePackageParaJogoTwitch('The Witcher 3: Wild Hunt')?.slug,
    ).toBe('the-witcher-3-wild-hunt');
    expect(encontrarCarePackageParaJogoTwitch('Grand Theft Auto IV')?.slug).toBe(
      'gta-iv',
    );
    expect(encontrarCarePackageParaJogoTwitch('Grand Theft Auto VI')).toBeNull();
  });

  it('agrupa Sequências dentro da mesma Fonte em ordem de episódios e serializa Maratonas na URL', () => {
    expect(extrairInfoEpisodio('Vamo zerar New Vegas #7 2/2')).toMatchObject({
      episodio: 7,
      subparte: 2,
    });

    const real = JSON.parse(
      readFileSync(path.join(process.cwd(), 'public', 'data', 'videos.json'), 'utf8'),
    ) as Catalogo;

    const rdr = real.videos.find((v) =>
      /Red Dead Redemption 2 #5/i.test(v.titulo),
    );
    expect(rdr).toBeDefined();
    if (rdr) {
      const seq = encontrarSequenciaDoVideo(rdr, real.videos);
      expect(seq.length).toBeGreaterThanOrEqual(10);
      expect(extrairInfoEpisodio(seq[0].titulo).episodio).toBe(1);
    }

    // Não mistura canais diferentes (NFS Most Wanted oficial vs não oficial)
    const nfsMw = real.videos.find(
      (v) =>
        /NFS Most Wanted \(#1\)/i.test(v.titulo) &&
        v.fontes.includes('@filiperamoslives'),
    );
    if (nfsMw) {
      const seqMw = encontrarSequenciaDoVideo(nfsMw, real.videos);
      expect(seqMw).toHaveLength(3);
      expect(seqMw.every((v) => v.fontes.includes('@filiperamoslives'))).toBe(true);
    }

    // Fila + Maratona local + URL compartilhável
    let est = alternarNaFila(BIBLIOTECA_VAZIA, 'KGkJMJviRQs');
    est = alternarNaFila(est, '62guKHVWWGg');
    est = moverNaFila(est, '62guKHVWWGg', -1);
    expect(est.filaAtual).toEqual(['62guKHVWWGg', 'KGkJMJviRQs']);

    est = salvarMaratonaLocal(est, 'NFS Most Wanted', est.filaAtual, 1000);
    expect(est.maratonas).toHaveLength(1);
    const url = montarUrlMaratona(est.maratonas[0].videoIds, 'NFS Most Wanted');
    const qs = new URLSearchParams(url.slice(2));
    const parsed = parsearMaratonaDaUrl(qs.get('maratona'), qs.get('titulo'));
    expect(parsed).toEqual({
      videoIds: ['62guKHVWWGg', 'KGkJMJviRQs'],
      titulo: 'NFS Most Wanted',
    });

    est = removerMaratonaLocal(est, est.maratonas[0].id);
    expect(est.maratonas).toHaveLength(0);
  });
});
