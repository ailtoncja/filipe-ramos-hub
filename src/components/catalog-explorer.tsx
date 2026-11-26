'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import {
  ehFonteOficial,
  FONTES_COMUNIDADE,
  FONTES_OFICIAIS,
  FONTES_OFICIAIS_SET,
  nomeExibicaoDaFonte,
} from '@/data/fontes';
import { JOGOS_DESTAQUE } from '@/data/jogos-destaque';
import { useBibliotecaLocal } from '@/hooks/use-biblioteca-local';
import { filtrarCarePackages } from '@/lib/care-packages';
import { filtrarCatalogo, mesclarExtrasCatalogo } from '@/lib/catalog';
import { normalizarParaBusca } from '@/lib/search';
import {
  encontrarSequenciaDoVideo,
  encontrarVideosRelacionadosAoJogo,
  montarUrlMaratona,
  ordenarVideosParaMaratona,
} from '@/lib/sequencias';
import { formatarDataBR, formatarNumero } from '@/lib/text';
import type {
  Catalogo,
  FiltroCategoriaFonte,
  OrdemCatalogo,
  PlaylistCatalogo,
  StatusTransmissaoTwitch,
  TipoCatalogo,
  VideoCatalogo,
} from '@/lib/types';
import { urlYoutubeDoItem } from '@/lib/youtube';
import {
  CarePackageContextBanner,
  TwitchLastStreamPill,
  TwitchLiveBanner,
} from './catalog-highlights';
import {
  ArrowRightIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  ExternalLinkIcon,
  HistoryIcon,
  LinkChainIcon,
  ListVideoIcon,
  PackageIcon,
  PlayIcon,
  PlusIcon,
  QueueListIcon,
  RefreshIcon,
  SearchIcon,
} from './icons';

const VideoPlayerModal = dynamic(
  () => import('./video-player-modal').then((mod) => mod.VideoPlayerModal),
  { ssr: false },
);

const MaratonasModal = dynamic(
  () => import('./maratonas-modal').then((mod) => mod.MaratonasModal),
  { ssr: false },
);

let catalogoClientPromise: Promise<Catalogo> | null = null;
let ultimaSincronizacaoCliente = 0;

function normalizarRespostaCatalogo(data: Partial<Catalogo>): Catalogo {
  return mesclarExtrasCatalogo({
    atualizadoEm: data.atualizadoEm ?? null,
    videos: Array.isArray(data.videos) ? data.videos : [],
    playlists: Array.isArray(data.playlists) ? data.playlists : [],
  });
}

function carregarCatalogoCliente(forcar = false): Promise<Catalogo> {
  const agora = Date.now();
  const expirado = agora - ultimaSincronizacaoCliente > 3 * 60 * 1000;

  if (!catalogoClientPromise || forcar || expirado) {
    const endpoint = forcar ? '/api/catalogo?refresh=1' : '/api/catalogo';
    catalogoClientPromise = fetch(endpoint, forcar ? { cache: 'no-store' } : undefined)
      .then((res) => {
        if (!res.ok) throw new Error('API indisponível');
        return res.json() as Promise<Partial<Catalogo>>;
      })
      .catch(() =>
        fetch('/data/videos.json').then((res) => {
          if (!res.ok) throw new Error('Catálogo indisponível');
          return res.json() as Promise<Partial<Catalogo>>;
        }),
      )
      .then((data) => {
        ultimaSincronizacaoCliente = Date.now();
        return normalizarRespostaCatalogo(data);
      })
      .catch((err) => {
        catalogoClientPromise = null;
        throw err;
      });
  }
  return catalogoClientPromise;
}

const PAGE_SIZE = 24;

interface CatalogExplorerProps {
  initialItems: (VideoCatalogo | PlaylistCatalogo)[];
  initialTotal: number;
  spotlightVideo: VideoCatalogo | null;
  totalVideos: number;
  totalPlaylists: number;
  totalFontes: number;
  totalCarePackages: number;
  atualizadoEm: string | null;
  initialTipo: TipoCatalogo;
  initialBusca: string;
  initialFonte: string;
  initialCategoriaFonte: FiltroCategoriaFonte;
  initialOrdem: OrdemCatalogo;
  initialPlayItem: VideoCatalogo | PlaylistCatalogo | null;
  initialMaratonaVideos: VideoCatalogo[];
  initialMaratonaTitulo: string | null;
  initialTwitchStatus: StatusTransmissaoTwitch | null;
}

export function CatalogExplorer({
  initialItems,
  initialTotal,
  spotlightVideo,
  totalVideos,
  totalPlaylists,
  totalFontes,
  totalCarePackages,
  atualizadoEm,
  initialTipo,
  initialBusca,
  initialFonte,
  initialCategoriaFonte,
  initialOrdem,
  initialPlayItem,
  initialMaratonaVideos,
  initialMaratonaTitulo,
  initialTwitchStatus,
}: CatalogExplorerProps) {
  const [catalogoCompleto, setCatalogoCompleto] = useState<Catalogo | null>(null);
  const [erroCarga, setErroCarga] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [avisoAtualizacao, setAvisoAtualizacao] = useState<string | null>(null);
  const [twitchStatus, setTwitchStatus] = useState<StatusTransmissaoTwitch | null>(
    initialTwitchStatus,
  );

  const [tipo, setTipo] = useState<TipoCatalogo>(
    initialMaratonaVideos.length > 0 ? 'videos' : initialTipo,
  );
  const [busca, setBusca] = useState(initialBusca);
  const [fonte, setFonte] = useState(initialFonte);
  const [categoriaFonte, setCategoriaFonte] = useState<FiltroCategoriaFonte>(
    initialCategoriaFonte,
  );
  const [ordem, setOrdem] = useState<OrdemCatalogo>(initialOrdem);
  const [apenasSalvos, setApenasSalvos] = useState(false);
  const [ocultarAssistidos, setOcultarAssistidos] = useState(false);
  const [limite, setLimite] = useState(PAGE_SIZE);
  const [itemEmReproducao, setItemEmReproducao] = useState<
    VideoCatalogo | PlaylistCatalogo | null
  >(initialPlayItem);
  const [maratonaAtiva, setMaratonaAtiva] = useState<{
    titulo: string;
    videos: VideoCatalogo[];
  } | null>(() =>
    initialMaratonaVideos.length > 0
      ? {
          titulo: initialMaratonaTitulo ?? 'Maratona compartilhada',
          videos: initialMaratonaVideos,
        }
      : null,
  );
  const [modalMaratonasAberto, setModalMaratonasAberto] = useState(false);
  const [tituloInicialModalMaratona, setTituloInicialModalMaratona] = useState('');
  const [linkFilaCopiado, setLinkFilaCopiado] = useState(false);
  const [, startTransition] = useTransition();

  const {
    salvosVideosSet,
    salvosPlaylistsSet,
    assistidosVideosSet,
    filaAtual,
    filaAtualSet,
    maratonas,
    recentes,
    totalSalvosVideos,
    totalSalvosPlaylists,
    totalAssistidos,
    toggleSalvo,
    toggleAssistido,
    registrarAbertura,
    limparHistoricoRecente,
    toggleNaFila,
    carregarNaFila,
    moverItemFila,
    limparFila,
    criarMaratona,
    excluirMaratona,
  } = useBibliotecaLocal();

  const buscaDiferida = useDeferredValue(busca);

  useEffect(() => {
    let ativo = true;
    carregarCatalogoCliente(false)
      .then((dados) => {
        if (ativo) setCatalogoCompleto(dados);
      })
      .catch(() => {
        if (ativo) setErroCarga(true);
      });

    function aoVoltarParaAba() {
      if (document.visibilityState !== 'visible') return;
      fetch('/api/twitch')
        .then((r) => (r.ok ? (r.json() as Promise<{ status: StatusTransmissaoTwitch | null }>) : null))
        .then((json) => {
          if (ativo && json?.status) setTwitchStatus(json.status);
        })
        .catch(() => {});
      if (Date.now() - ultimaSincronizacaoCliente < 3 * 60 * 1000) return;
      carregarCatalogoCliente(false)
        .then((dados) => {
          if (ativo) setCatalogoCompleto(dados);
        })
        .catch(() => {});
    }

    document.addEventListener('visibilitychange', aoVoltarParaAba);
    return () => {
      ativo = false;
      document.removeEventListener('visibilitychange', aoVoltarParaAba);
    };
  }, []);

  const verificarNovosVideos = useCallback(async () => {
    if (atualizando) return;
    setAtualizando(true);
    setAvisoAtualizacao(null);
    const videosAntes = catalogoCompleto?.videos.length ?? totalVideos;
    const playlistsAntes = catalogoCompleto?.playlists.length ?? totalPlaylists;
    try {
      const dados = await carregarCatalogoCliente(true);
      setCatalogoCompleto(dados);
      setErroCarga(false);
      const diffVideos = dados.videos.length - videosAntes;
      const diffPlaylists = dados.playlists.length - playlistsAntes;
      const partes: string[] = [];
      if (diffVideos > 0) {
        partes.push(
          `+${diffVideos} ${diffVideos === 1 ? 'vídeo' : 'vídeos'}`,
        );
      }
      if (diffPlaylists > 0) {
        partes.push(
          `+${diffPlaylists} ${diffPlaylists === 1 ? 'playlist' : 'playlists'}`,
        );
      }
      setAvisoAtualizacao(
        partes.length > 0
          ? `${partes.join(' e ')} atualizado`
          : 'Vídeos e playlists em dia',
      );
      window.setTimeout(() => setAvisoAtualizacao(null), 4000);
    } catch {
      setAvisoAtualizacao('Falha ao consultar feeds agora');
      window.setTimeout(() => setAvisoAtualizacao(null), 4000);
    } finally {
      setAtualizando(false);
    }
  }, [
    atualizando,
    catalogoCompleto?.playlists.length,
    catalogoCompleto?.videos.length,
    totalPlaylists,
    totalVideos,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (maratonaAtiva && itemEmReproducao) {
      params.set(
        'maratona',
        maratonaAtiva.videos.map((v) => v.id).join(','),
      );
      if (maratonaAtiva.titulo) params.set('titulo', maratonaAtiva.titulo);
    } else {
      if (busca.trim()) params.set('q', busca.trim());
      if (tipo === 'playlists') params.set('tipo', 'playlists');
      if (fonte) params.set('fonte', fonte);
      if (categoriaFonte !== 'todos') params.set('canais', categoriaFonte);
      if (ordem !== 'recentes') params.set('ordem', ordem);
      if (itemEmReproducao) params.set('play', itemEmReproducao.id);
    }

    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/?${qs}` : '/');
  }, [busca, tipo, fonte, categoriaFonte, ordem, itemEmReproducao, maratonaAtiva]);

  const resultadosFiltrados = useMemo(() => {
    if (!catalogoCompleto) return null;
    return filtrarCatalogo(catalogoCompleto, {
      tipo,
      busca: buscaDiferida,
      fonte,
      categoriaFonte,
      ordem,
    });
  }, [catalogoCompleto, tipo, buscaDiferida, fonte, categoriaFonte, ordem]);

  const totalVideosAtual = catalogoCompleto?.videos.length ?? totalVideos;
  const totalPlaylistsAtual = catalogoCompleto?.playlists.length ?? totalPlaylists;
  const spotlightAtual = useMemo(() => {
    if (!catalogoCompleto) return spotlightVideo;
    return (
      catalogoCompleto.videos.find((v) => ehFonteOficial(v.fontes)) ??
      catalogoCompleto.videos[0] ??
      spotlightVideo
    );
  }, [catalogoCompleto, spotlightVideo]);

  const temFiltrosAtivos = Boolean(
    busca.trim() ||
      fonte ||
      categoriaFonte !== 'todos' ||
      ordem !== 'recentes' ||
      apenasSalvos ||
      (tipo === 'videos' && ocultarAssistidos),
  );
  const mostrarDestaque = Boolean(
    spotlightAtual && tipo === 'videos' && !temFiltrosAtivos,
  );

  const salvosAtuaisSet = tipo === 'playlists' ? salvosPlaylistsSet : salvosVideosSet;
  const totalSalvosAtual =
    tipo === 'playlists' ? totalSalvosPlaylists : totalSalvosVideos;

  const itensComPreferencias = useMemo(() => {
    const base = resultadosFiltrados ? resultadosFiltrados : initialItems;
    if (!apenasSalvos && !(tipo === 'videos' && ocultarAssistidos)) {
      return base;
    }
    return base.filter((item) => {
      if (apenasSalvos && !salvosAtuaisSet.has(item.id)) return false;
      if (tipo === 'videos' && ocultarAssistidos && assistidosVideosSet.has(item.id)) {
        return false;
      }
      return true;
    });
  }, [
    resultadosFiltrados,
    initialItems,
    apenasSalvos,
    ocultarAssistidos,
    tipo,
    salvosAtuaisSet,
    assistidosVideosSet,
  ]);

  const itensSemDuplicata =
    mostrarDestaque && spotlightAtual
      ? itensComPreferencias.filter((item) => item.id !== spotlightAtual.id)
      : itensComPreferencias;
  const itensVisiveis = itensSemDuplicata.slice(0, limite);
  const totalResultados =
    apenasSalvos || (tipo === 'videos' && ocultarAssistidos)
      ? itensComPreferencias.length
      : resultadosFiltrados
        ? resultadosFiltrados.length
        : initialTotal;

  const carePackagesRelacionados = useMemo(() => {
    if (!buscaDiferida.trim()) return [];
    return filtrarCarePackages(buscaDiferida, new Set());
  }, [buscaDiferida]);

  const buscaNormalizada = useMemo(
    () => normalizarParaBusca(busca),
    [busca],
  );

  const itensRecentesResolvidos = useMemo(() => {
    if (recentes.length === 0) return [];
    const videosMap = new Map<string, VideoCatalogo>();
    const playlistsMap = new Map<string, PlaylistCatalogo>();
    if (catalogoCompleto) {
      for (const v of catalogoCompleto.videos) videosMap.set(v.id, v);
      for (const p of catalogoCompleto.playlists) playlistsMap.set(p.id, p);
    } else {
      for (const item of initialItems) {
        if ('quantidadeVideos' in item) {
          playlistsMap.set(item.id, item);
        } else {
          videosMap.set(item.id, item);
        }
      }
      if (spotlightVideo) videosMap.set(spotlightVideo.id, spotlightVideo);
    }
    const resolvidos: {
      item: VideoCatalogo | PlaylistCatalogo;
      tipo: TipoCatalogo;
    }[] = [];
    for (const r of recentes) {
      const encontrado =
        r.tipo === 'playlists' ? playlistsMap.get(r.id) : videosMap.get(r.id);
      if (encontrado) resolvidos.push({ item: encontrado, tipo: r.tipo });
    }
    return resolvidos;
  }, [recentes, catalogoCompleto, initialItems, spotlightVideo]);

  const videosPorId = useMemo(() => {
    const mapa = new Map<string, VideoCatalogo>();
    if (catalogoCompleto) {
      for (const v of catalogoCompleto.videos) mapa.set(v.id, v);
    } else {
      for (const item of initialItems) {
        if (!('quantidadeVideos' in item)) mapa.set(item.id, item);
      }
      if (spotlightVideo) mapa.set(spotlightVideo.id, spotlightVideo);
      for (const v of initialMaratonaVideos) mapa.set(v.id, v);
    }
    return mapa;
  }, [catalogoCompleto, initialItems, spotlightVideo, initialMaratonaVideos]);

  const filaVideosResolvidos = useMemo(
    () =>
      filaAtual
        .map((id) => videosPorId.get(id))
        .filter((v): v is VideoCatalogo => Boolean(v)),
    [filaAtual, videosPorId],
  );

  const sequenciaNoPlayer = useMemo(() => {
    if (!itemEmReproducao || tipo !== 'videos') return [];
    if (maratonaAtiva) return maratonaAtiva.videos;
    const pool = catalogoCompleto
      ? catalogoCompleto.videos
      : [...videosPorId.values()];
    return encontrarSequenciaDoVideo(itemEmReproducao, pool);
  }, [itemEmReproducao, tipo, maratonaAtiva, catalogoCompleto, videosPorId]);

  const relacionadosNoPlayer = useMemo(() => {
    if (!itemEmReproducao || tipo !== 'videos') {
      return { nomeJogo: null, buscaJogo: null, videos: [] };
    }
    const pool = catalogoCompleto
      ? catalogoCompleto.videos
      : [...videosPorId.values()];
    return encontrarVideosRelacionadosAoJogo(
      itemEmReproducao,
      pool,
      sequenciaNoPlayer.map((v) => v.id),
      6,
    );
  }, [itemEmReproducao, tipo, catalogoCompleto, videosPorId, sequenciaNoPlayer]);

  const abrirNoPlayer = useCallback(
    (item: VideoCatalogo | PlaylistCatalogo, tipoItem: TipoCatalogo) => {
      if (tipoItem !== tipo) {
        setTipo(tipoItem);
      }
      setMaratonaAtiva(null);
      setItemEmReproducao(item);
      registrarAbertura(item.id, tipoItem);
    },
    [tipo, registrarAbertura],
  );

  const abrirMaratonaNoPlayer = useCallback(
    (videos: VideoCatalogo[], titulo: string) => {
      if (videos.length === 0) return;
      setTipo('videos');
      setModalMaratonasAberto(false);
      setMaratonaAtiva({ titulo, videos });
      setItemEmReproducao(videos[0]);
      registrarAbertura(videos[0].id, 'videos');
    },
    [registrarAbertura],
  );

  const maratonarResultadosEmOrdem = useCallback(() => {
    if (tipo !== 'videos') return;
    const somenteVideos = itensComPreferencias.filter(
      (item): item is VideoCatalogo => !('quantidadeVideos' in item),
    );
    const ordenados = ordenarVideosParaMaratona(somenteVideos);
    if (ordenados.length < 2) return;
    const titulo = busca.trim()
      ? `${busca.trim()} em ordem`
      : fonte
        ? `${nomeExibicaoDaFonte(fonte)} em ordem`
        : 'Maratona em ordem';
    abrirMaratonaNoPlayer(ordenados, titulo);
  }, [tipo, itensComPreferencias, busca, fonte, abrirMaratonaNoPlayer]);

  const abrirEditorComSequencia = useCallback(
    (videos: VideoCatalogo[], titulo: string) => {
      carregarNaFila(videos.map((v) => v.id));
      setTituloInicialModalMaratona(titulo);
      setItemEmReproducao(null);
      setMaratonaAtiva(null);
      setModalMaratonasAberto(true);
    },
    [carregarNaFila],
  );

  const copiarLinkFilaAtual = useCallback(async () => {
    if (filaAtual.length === 0) return;
    try {
      const url = `${window.location.origin}${montarUrlMaratona(
        filaAtual,
        `Maratona (${filaAtual.length} vídeos)`,
      )}`;
      await navigator.clipboard.writeText(url);
      setLinkFilaCopiado(true);
      window.setTimeout(() => setLinkFilaCopiado(false), 2000);
    } catch {
      // clipboard indisponível
    }
  }, [filaAtual]);

  const trocarTipo = useCallback((novoTipo: TipoCatalogo) => {
    startTransition(() => {
      setTipo(novoTipo);
      setLimite(PAGE_SIZE);
      setItemEmReproducao(null);
      if (novoTipo === 'playlists') {
        setOrdem((atual) => (atual === 'vistos' ? 'recentes' : atual));
      }
    });
  }, []);

  const trocarCategoriaFonte = useCallback(
    (novaCategoria: FiltroCategoriaFonte) => {
      startTransition(() => {
        setCategoriaFonte(novaCategoria);
        if (novaCategoria === 'oficiais' && fonte && !FONTES_OFICIAIS_SET.has(fonte)) {
          setFonte('');
        } else if (
          novaCategoria === 'nao-oficiais' &&
          fonte &&
          FONTES_OFICIAIS_SET.has(fonte)
        ) {
          setFonte('');
        }
        setLimite(PAGE_SIZE);
      });
    },
    [fonte],
  );

  const limparFiltros = useCallback(() => {
    startTransition(() => {
      setBusca('');
      setFonte('');
      setCategoriaFonte('todos');
      setOrdem('recentes');
      setApenasSalvos(false);
      setOcultarAssistidos(false);
      setLimite(PAGE_SIZE);
    });
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-10">
      <TwitchLiveBanner status={twitchStatus} />

      {/* Destaque cinematográfico compacto — recolhe automaticamente quando o usuário filtra ou busca */}
      {mostrarDestaque && spotlightAtual ? (
        <section className="hero-enter spotlight-frame overflow-hidden rounded-2xl p-5 sm:p-7 lg:p-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10">
            <div className="min-w-0">
              <h1 className="heading-display text-[clamp(2rem,3.6vw,3.1rem)] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--ink)]">
                O acervo vivo do Vrilipe em um só lugar.
              </h1>
              <p className="mt-3 max-w-[54ch] text-base leading-relaxed text-[var(--ink-secondary)]">
                Pesquise entre {formatarNumero(totalVideosAtual)} vídeos e{' '}
                {formatarNumero(totalPlaylistsAtual)} playlists das {totalFontes} fontes da comunidade, ou baixe os {totalCarePackages} Care Packages prontos para jogar.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)] tabular-nums">
                <span className="rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-3 py-1 font-semibold text-[var(--accent-text)]">
                  Mais recente
                </span>
                <span className="font-medium text-[var(--ink)]">
                  {spotlightAtual.titulo}
                </span>
                <span>{formatarDataBR(spotlightAtual.publicadoEm)}</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => abrirNoPlayer(spotlightAtual, 'videos')}
                  className="btn-primary inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl px-6 text-sm font-semibold"
                >
                  <PlayIcon className="h-4 w-4" />
                  Assistir destaque
                </button>
                <Link
                  href="/care-packages"
                  className="btn-secondary inline-flex min-h-12 items-center gap-2.5 rounded-xl px-5 text-sm font-semibold"
                >
                  <PackageIcon className="h-4 w-4 text-[var(--accent-text)]" />
                  Ver Care Packages
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>

              <TwitchLastStreamPill status={twitchStatus} />
            </div>

            <button
              type="button"
              onClick={() => abrirNoPlayer(spotlightAtual, 'videos')}
              aria-label={`Assistir ${spotlightAtual.titulo}`}
              className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--player-bg)] text-left shadow-[var(--shadow-lift)] focus-visible:outline-offset-2"
            >
              {spotlightAtual.miniatura ? (
                <img
                  src={spotlightAtual.miniatura}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
              />
              <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--overlay-ink)] sm:text-base">
                    {spotlightAtual.titulo}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--overlay-ink)] opacity-80">
                    {nomeExibicaoDaFonte(spotlightAtual.canal)}
                  </span>
                </span>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] shadow-lg transition-transform duration-200 group-hover:scale-105">
                  <PlayIcon className="h-4 w-4" />
                </span>
              </span>
            </button>
          </div>
        </section>
      ) : (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="heading-display text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
              {tipo === 'playlists' ? 'Playlists do Catálogo' : 'Catálogo de vídeos'}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
              Busque em {formatarNumero(totalVideosAtual)} vídeos e{' '}
              {formatarNumero(totalPlaylistsAtual)} playlists das {totalFontes} fontes da comunidade.
            </p>
          </div>
          <Link
            href="/care-packages"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--accent-text)] hover:underline"
          >
            Explorar Care Packages
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </header>
      )}

      {/* Barra de busca tátil + filtros */}
      <section aria-label="Filtros do catálogo" className="mt-7">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-card)] lg:flex-row lg:items-center">
          <div
            role="group"
            aria-label="Tipo de conteúdo"
            className="grid shrink-0 grid-cols-2 gap-1 rounded-xl bg-[var(--surface-elevated)] p-1"
          >
            <button
              type="button"
              onClick={() => trocarTipo('videos')}
              aria-pressed={tipo === 'videos'}
              className={`min-h-11 cursor-pointer rounded-lg px-4 text-sm font-semibold transition-colors ${
                tipo === 'videos'
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              Vídeos
            </button>
            <button
              type="button"
              onClick={() => trocarTipo('playlists')}
              aria-pressed={tipo === 'playlists'}
              className={`min-h-11 cursor-pointer rounded-lg px-4 text-sm font-semibold transition-colors ${
                tipo === 'playlists'
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              Playlists
            </button>
          </div>

          <label className="relative flex min-h-12 flex-1 items-center rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 transition-colors focus-within:border-[var(--accent)]">
            <span className="sr-only">
              Pesquisar {tipo === 'videos' ? 'vídeos' : 'playlists'}
            </span>
            <SearchIcon className="h-4 w-4 shrink-0 text-[var(--accent-text)]" />
            <input
              type="search"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setLimite(PAGE_SIZE);
              }}
              placeholder={
                tipo === 'videos'
                  ? 'Buscar jogo, live ou assunto...'
                  : 'Buscar playlist por jogo ou série...'
              }
              className="h-full w-full bg-transparent px-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none"
            />
            {busca ? (
              <button
                type="button"
                onClick={() => {
                  setBusca('');
                  setLimite(PAGE_SIZE);
                }}
                aria-label="Limpar busca"
                className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            ) : null}
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:shrink-0">
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 focus-within:border-[var(--accent)]">
              <span className="shrink-0 text-xs font-medium text-[var(--ink-muted)]">
                Fonte
              </span>
              <select
                value={fonte}
                onChange={(e) => {
                  const novaFonte = e.target.value;
                  startTransition(() => {
                    setFonte(novaFonte);
                    if (novaFonte) {
                      const ehOficial = FONTES_OFICIAIS_SET.has(novaFonte);
                      if (
                        (ehOficial && categoriaFonte === 'nao-oficiais') ||
                        (!ehOficial && categoriaFonte === 'oficiais')
                      ) {
                        setCategoriaFonte('todos');
                      }
                    }
                    setLimite(PAGE_SIZE);
                  });
                }}
                className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-[var(--ink)] focus:outline-none lg:max-w-[180px]"
              >
                <option value="" className="bg-[var(--surface)] text-[var(--ink)]">
                  {categoriaFonte === 'oficiais'
                    ? 'Todos os oficiais'
                    : categoriaFonte === 'nao-oficiais'
                      ? 'Todos os não oficiais'
                      : 'Todas as fontes'}
                </option>
                <optgroup
                  label="Canais oficiais"
                  className="bg-[var(--surface)] text-[var(--ink-muted)]"
                >
                  {FONTES_OFICIAIS.map((item) => (
                    <option
                      key={item.nome}
                      value={item.nome}
                      className="bg-[var(--surface)] text-[var(--ink)]"
                    >
                      {item.nomeExibicao}
                    </option>
                  ))}
                </optgroup>
                <optgroup
                  label="Comunidade"
                  className="bg-[var(--surface)] text-[var(--ink-muted)]"
                >
                  {FONTES_COMUNIDADE.map((item) => (
                    <option
                      key={item.nome}
                      value={item.nome}
                      className="bg-[var(--surface)] text-[var(--ink)]"
                    >
                      {item.nomeExibicao}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>

            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 focus-within:border-[var(--accent)]">
              <span className="shrink-0 text-xs font-medium text-[var(--ink-muted)]">
                Ordem
              </span>
              <select
                value={ordem}
                onChange={(e) => {
                  const val = e.target.value as OrdemCatalogo;
                  startTransition(() => {
                    setOrdem(val);
                    setLimite(PAGE_SIZE);
                  });
                }}
                className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-[var(--ink)] focus:outline-none"
              >
                <option value="recentes" className="bg-[var(--surface)] text-[var(--ink)]">
                  Mais recentes
                </option>
                <option value="antigos" className="bg-[var(--surface)] text-[var(--ink)]">
                  Mais antigos
                </option>
                {tipo === 'videos' ? (
                  <option value="vistos" className="bg-[var(--surface)] text-[var(--ink)]">
                    Mais vistos
                  </option>
                ) : null}
              </select>
            </label>
          </div>
        </div>

        {/* Atalhos rápidos dos 12 Jogos em destaque */}
        <div
          aria-label="Jogos em destaque"
          className="-mx-4 mt-3.5 flex flex-nowrap items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {JOGOS_DESTAQUE.map((jogo) => {
            const ativo =
              buscaNormalizada.length > 0 &&
              buscaNormalizada === normalizarParaBusca(jogo.busca);
            return (
              <button
                key={jogo.label}
                type="button"
                onClick={() => {
                  setBusca(ativo ? '' : jogo.busca);
                  setLimite(PAGE_SIZE);
                }}
                aria-pressed={ativo}
                className={`min-h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-colors ${
                  ativo
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
                }`}
              >
                {jogo.label}
              </button>
            );
          })}
        </div>

        {/* Banner contextual de Care Packages quando a busca bate em um Jogo */}
        <CarePackageContextBanner
          matches={carePackagesRelacionados}
          busca={buscaDiferida}
        />

        {/* Resumo dos resultados e filtros rápidos */}
        <div
          aria-live="polite"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--ink-muted)] tabular-nums"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div
              role="group"
              aria-label="Filtrar por tipo de canal"
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1"
            >
              {(
                [
                  {
                    valor: 'todos',
                    label: 'Todos',
                    titulo: 'Mostrar vídeos e playlists de todas as fontes',
                  },
                  {
                    valor: 'oficiais',
                    label: 'Oficiais',
                    titulo: 'Mostrar apenas Filipe Ramos e Filipe Ramos - Baú de Lives',
                  },
                  {
                    valor: 'nao-oficiais',
                    label: 'Não oficiais',
                    titulo: 'Mostrar apenas canais e playlists da comunidade',
                  },
                ] as const
              ).map((opcao) => {
                const ativo = categoriaFonte === opcao.valor;
                return (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() => trocarCategoriaFonte(opcao.valor)}
                    aria-pressed={ativo}
                    title={opcao.titulo}
                    className={`min-h-9 cursor-pointer whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition-colors ${
                      ativo
                        ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                        : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {opcao.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setApenasSalvos((v) => !v);
                setLimite(PAGE_SIZE);
              }}
              aria-pressed={apenasSalvos}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                apenasSalvos
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
              }`}
            >
              {apenasSalvos ? (
                <BookmarkFilledIcon className="h-3.5 w-3.5" />
              ) : (
                <BookmarkIcon className="h-3.5 w-3.5" />
              )}
              Salvos{totalSalvosAtual > 0 ? ` (${totalSalvosAtual})` : ''}
            </button>

            <button
              type="button"
              onClick={() => {
                setTituloInicialModalMaratona('');
                setModalMaratonasAberto(true);
              }}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                filaAtual.length > 0
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
              }`}
            >
              <QueueListIcon className="h-3.5 w-3.5" />
              Maratonas
              {maratonas.length > 0 || filaAtual.length > 0
                ? ` (${maratonas.length}${filaAtual.length > 0 ? ` + ${filaAtual.length}` : ''})`
                : ''}
            </button>

            {tipo === 'videos' && (totalAssistidos > 0 || ocultarAssistidos) ? (
              <button
                type="button"
                onClick={() => {
                  setOcultarAssistidos((v) => !v);
                  setLimite(PAGE_SIZE);
                }}
                aria-pressed={ocultarAssistidos}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                  ocultarAssistidos
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
                }`}
              >
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Ocultar assistidos ({totalAssistidos})
              </button>
            ) : null}

            {erroCarga ? (
              <span className="text-[var(--warn-ink)]">
                Não foi possível carregar o índice completo. Exibindo resultados iniciais.
              </span>
            ) : (
              <p>
                <strong className="font-semibold text-[var(--ink)]">
                  {formatarNumero(totalResultados)}{' '}
                  {tipo === 'videos'
                    ? totalResultados === 1
                      ? 'vídeo encontrado'
                      : 'vídeos encontrados'
                    : totalResultados === 1
                      ? 'playlist encontrada'
                      : 'playlists encontradas'}
                </strong>
              </p>
            )}
            {temFiltrosAtivos ? (
              <button
                type="button"
                onClick={limparFiltros}
                className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-[var(--accent-text)] hover:underline"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {tipo === 'videos' &&
            (busca.trim() || fonte || apenasSalvos) &&
            itensComPreferencias.length >= 2 ? (
              <button
                type="button"
                onClick={maratonarResultadosEmOrdem}
                className="btn-primary inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3.5 text-xs font-semibold"
              >
                <PlayIcon className="h-3.5 w-3.5" />
                Maratonar em ordem ({Math.min(itensComPreferencias.length, 50)})
              </button>
            ) : null}
            {avisoAtualizacao ? (
              <span className="text-xs font-medium text-[var(--accent-text)]">
                {avisoAtualizacao}
              </span>
            ) : null}
            <button
              type="button"
              onClick={verificarNovosVideos}
              disabled={atualizando}
              className="btn-secondary inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3.5 text-xs font-semibold disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshIcon
                className={`h-3.5 w-3.5 ${atualizando ? 'animate-spin' : ''}`}
              />
              {atualizando ? 'Atualizando...' : 'Atualizar catálogo'}
            </button>
          </div>
        </div>
      </section>

      {/* Faixa Continuar assistindo (histórico local automático dos últimos 4 abertos) */}
      {!temFiltrosAtivos && itensRecentesResolvidos.length > 0 ? (
        <section aria-label="Continuar assistindo" className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
              <HistoryIcon className="h-4 w-4 text-[var(--accent-text)]" />
              Continuar assistindo
            </h2>
            <button
              type="button"
              onClick={limparHistoricoRecente}
              className="min-h-9 cursor-pointer px-2 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--accent-text)] hover:underline"
            >
              Limpar histórico
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {itensRecentesResolvidos.map(({ item, tipo: tipoRecente }) => (
              <button
                key={`${tipoRecente}:${item.id}`}
                type="button"
                onClick={() => abrirNoPlayer(item, tipoRecente)}
                className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-left transition-colors hover:border-[var(--accent)]"
              >
                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--player-bg)]">
                  {item.miniatura ? (
                    <img
                      src={item.miniatura}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                  {tipoRecente === 'playlists' ? (
                    <span className="absolute bottom-1 right-1 rounded bg-[var(--overlay-surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--overlay-ink)]">
                      Playlist
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--accent-text)]">
                    {item.titulo}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-[var(--ink-muted)]">
                    {nomeExibicaoDaFonte(item.canal)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Grade espaçada de vídeos e playlists */}
      {itensVisiveis.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
          <p className="heading-display text-xl font-bold text-[var(--ink)]">
            {apenasSalvos
              ? `Nenhum ${tipo === 'videos' ? 'vídeo' : 'playlist'} salvo ainda`
              : 'Nenhum resultado encontrado'}
          </p>
          <p className="mt-2 text-sm text-[var(--ink-secondary)]">
            {apenasSalvos
              ? 'Clique no ícone de marcador em qualquer card ou no player para guardar itens para ver depois.'
              : 'Tente outro termo, escolha outra fonte ou alterne entre Vídeos e Playlists.'}
          </p>
          {temFiltrosAtivos ? (
            <button
              type="button"
              onClick={limparFiltros}
              className="btn-primary mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-xl px-5 text-sm font-semibold"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {itensVisiveis.map((item) => {
            const oficial = ehFonteOficial(item.fontes);
            const salvo = salvosAtuaisSet.has(item.id);
            const assistido = tipo === 'videos' && assistidosVideosSet.has(item.id);
            const qtdVideos =
              'quantidadeVideos' in item && typeof item.quantidadeVideos === 'number'
                ? item.quantidadeVideos
                : null;
            const ytUrl = urlYoutubeDoItem(item.id, tipo);

            return (
              <article
                key={item.id}
                className="cinema-card group flex min-w-0 flex-col overflow-hidden rounded-2xl"
              >
                <button
                  type="button"
                  onClick={() => abrirNoPlayer(item, tipo)}
                  className="flex flex-1 cursor-pointer flex-col text-left focus-visible:outline-offset-[-3px]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[var(--player-bg)]">
                    {item.miniatura ? (
                      <img
                        src={item.miniatura}
                        alt=""
                        loading="lazy"
                        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                          assistido ? 'opacity-75' : ''
                        }`}
                      />
                    ) : null}
                    {assistido ? (
                      <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-[var(--overlay-border)] bg-[var(--overlay-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--overlay-ink)]">
                        <CheckCircleIcon className="h-3 w-3 text-[var(--accent-text)]" />
                        Assistido
                      </span>
                    ) : null}
                    {tipo === 'playlists' ? (
                      <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full border border-[var(--overlay-border)] bg-[var(--overlay-surface)] px-3 py-1 text-xs font-semibold text-[var(--overlay-ink)]">
                        <ListVideoIcon className="h-3.5 w-3.5" />
                        {qtdVideos !== null
                          ? `${qtdVideos} ${qtdVideos === 1 ? 'vídeo' : 'vídeos'}`
                          : 'Playlist'}
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--scrim-soft)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)] shadow-lg">
                          <PlayIcon className="h-5 w-5" />
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4 pb-2">
                    <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent-text)]">
                      {item.titulo}
                    </h2>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="truncate font-medium text-[var(--ink-secondary)]">
                        {nomeExibicaoDaFonte(item.canal)}
                      </span>
                      {oficial ? (
                        <span className="rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-text)]">
                          Oficial
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>

                <div className="mt-auto flex items-center justify-between gap-2 px-4 pb-3 pt-1 text-xs text-[var(--ink-muted)] tabular-nums">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span>{formatarDataBR(item.publicadoEm)}</span>
                    {tipo === 'videos' && item.visualizacoes != null ? (
                      <span>{formatarNumero(item.visualizacoes)} views</span>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    {tipo === 'videos' ? (
                      <button
                        type="button"
                        onClick={() => toggleNaFila(item.id)}
                        aria-pressed={filaAtualSet.has(item.id)}
                        aria-label={
                          filaAtualSet.has(item.id)
                            ? `Remover "${item.titulo}" da fila de maratona`
                            : `Adicionar "${item.titulo}" à fila de maratona`
                        }
                        title={
                          filaAtualSet.has(item.id)
                            ? 'Na fila da Maratona'
                            : 'Adicionar à fila da Maratona'
                        }
                        className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-[var(--surface-elevated)] ${
                          filaAtualSet.has(item.id)
                            ? 'text-[var(--accent-text)]'
                            : 'text-[var(--ink-muted)] hover:text-[var(--accent-text)]'
                        }`}
                      >
                        {filaAtualSet.has(item.id) ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <PlusIcon className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => toggleSalvo(item.id, tipo)}
                      aria-pressed={salvo}
                      aria-label={
                        salvo
                          ? `Remover "${item.titulo}" dos salvos`
                          : `Salvar "${item.titulo}" para depois`
                      }
                      title={salvo ? 'Salvo' : 'Salvar para depois'}
                      className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-[var(--surface-elevated)] ${
                        salvo
                          ? 'text-[var(--accent-text)]'
                          : 'text-[var(--ink-muted)] hover:text-[var(--accent-text)]'
                      }`}
                    >
                      {salvo ? (
                        <BookmarkFilledIcon className="h-4 w-4" />
                      ) : (
                        <BookmarkIcon className="h-4 w-4" />
                      )}
                    </button>

                    {tipo === 'videos' ? (
                      <button
                        type="button"
                        onClick={() => toggleAssistido(item.id)}
                        aria-pressed={assistido}
                        aria-label={
                          assistido
                            ? `Desmarcar "${item.titulo}" como assistido`
                            : `Marcar "${item.titulo}" como assistido`
                        }
                        title={assistido ? 'Assistido' : 'Marcar como assistido'}
                        className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-[var(--surface-elevated)] ${
                          assistido
                            ? 'text-[var(--accent-text)]'
                            : 'text-[var(--ink-muted)] hover:text-[var(--accent-text)]'
                        }`}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    ) : null}

                    <a
                      href={ytUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir "${item.titulo}" no YouTube`}
                      title="Abrir no YouTube"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--accent-text)]"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {itensVisiveis.length < totalResultados ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setLimite((atual) => atual + PAGE_SIZE)}
            className="btn-secondary inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl px-6 text-sm font-semibold tabular-nums"
          >
            Mostrar mais {tipo === 'videos' ? 'vídeos' : 'playlists'}
            <span className="text-xs text-[var(--ink-muted)]">
              ({formatarNumero(itensVisiveis.length)} de {formatarNumero(totalResultados)})
            </span>
          </button>
        </div>
      ) : null}

      {/* Barra flutuante compacta enquanto o usuário monta uma fila */}
      {filaVideosResolvidos.length > 0 && !itemEmReproducao && !modalMaratonasAberto ? (
        <div
          role="region"
          aria-label="Fila da Maratona atual"
          className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[var(--accent)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-lift)]"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)] tabular-nums">
            <QueueListIcon className="h-4 w-4 text-[var(--accent-text)]" />
            <span>
              Fila: {filaVideosResolvidos.length}{' '}
              {filaVideosResolvidos.length === 1 ? 'vídeo' : 'vídeos'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                abrirMaratonaNoPlayer(
                  filaVideosResolvidos,
                  `Maratona (${filaVideosResolvidos.length} vídeos)`,
                )
              }
              className="btn-primary inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
            >
              <PlayIcon className="h-3.5 w-3.5" />
              Assistir
            </button>
            <button
              type="button"
              onClick={() => {
                setTituloInicialModalMaratona('');
                setModalMaratonasAberto(true);
              }}
              className="btn-secondary inline-flex min-h-9 cursor-pointer items-center rounded-xl px-3 text-xs font-semibold"
            >
              Organizar / Salvar
            </button>
            <button
              type="button"
              onClick={copiarLinkFilaAtual}
              className="btn-secondary inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-xs font-semibold"
            >
              {linkFilaCopiado ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                  Copiado
                </>
              ) : (
                <>
                  <LinkChainIcon className="h-3.5 w-3.5" />
                  Link
                </>
              )}
            </button>
            <button
              type="button"
              onClick={limparFila}
              aria-label="Limpar fila atual"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--ink-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)]"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {modalMaratonasAberto ? (
        <MaratonasModal
          filaVideos={filaVideosResolvidos}
          maratonas={maratonas}
          videosPorId={videosPorId}
          tituloInicial={tituloInicialModalMaratona}
          onMoverNaFila={moverItemFila}
          onRemoverDaFila={toggleNaFila}
          onLimparFila={limparFila}
          onAssistirLista={abrirMaratonaNoPlayer}
          onSalvarMaratona={criarMaratona}
          onCarregarNaFila={(ids, nome) => {
            carregarNaFila(ids);
            setTituloInicialModalMaratona(nome);
          }}
          onExcluirMaratona={excluirMaratona}
          onClose={() => setModalMaratonasAberto(false)}
        />
      ) : null}

      {itemEmReproducao ? (
        <VideoPlayerModal
          item={itemEmReproducao}
          tipo={tipo}
          salvo={salvosAtuaisSet.has(itemEmReproducao.id)}
          assistido={
            tipo === 'videos' && assistidosVideosSet.has(itemEmReproducao.id)
          }
          naFila={tipo === 'videos' && filaAtualSet.has(itemEmReproducao.id)}
          assistidosSet={assistidosVideosSet}
          sequencia={sequenciaNoPlayer}
          tituloSequencia={maratonaAtiva?.titulo}
          ehMaratona={Boolean(maratonaAtiva)}
          relacionados={relacionadosNoPlayer.videos}
          nomeJogoRelacionados={relacionadosNoPlayer.nomeJogo}
          buscaJogoRelacionados={relacionadosNoPlayer.buscaJogo}
          filaAtualSet={filaAtualSet}
          onToggleSalvo={() => toggleSalvo(itemEmReproducao.id, tipo)}
          onToggleAssistido={() => toggleAssistido(itemEmReproducao.id)}
          onToggleFila={() => toggleNaFila(itemEmReproducao.id)}
          onToggleItemFila={toggleNaFila}
          onSelecionarEpisodio={(video) => {
            setItemEmReproducao(video);
            registrarAbertura(video.id, 'videos');
          }}
          onAbrirRelacionado={(video) => abrirNoPlayer(video, 'videos')}
          onBuscarJogoRelacionado={(termo) => {
            setItemEmReproducao(null);
            setMaratonaAtiva(null);
            setTipo('videos');
            setBusca(termo);
            setLimite(PAGE_SIZE);
          }}
          onEditarComoMaratona={abrirEditorComSequencia}
          onSalvarMaratona={(videos, titulo) =>
            criarMaratona(
              titulo,
              videos.map((v) => v.id),
            )
          }
          onClose={() => {
            setItemEmReproducao(null);
            setMaratonaAtiva(null);
          }}
        />
      ) : null}
    </div>
  );
}
