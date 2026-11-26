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
import { filtrarCatalogo, mesclarExtrasCatalogo } from '@/lib/catalog';
import { formatarDataBR, formatarNumero } from '@/lib/text';
import type {
  Catalogo,
  FiltroCategoriaFonte,
  OrdemCatalogo,
  PlaylistCatalogo,
  TipoCatalogo,
  VideoCatalogo,
} from '@/lib/types';
import { urlYoutubeDoItem } from '@/lib/youtube';
import {
  ArrowRightIcon,
  CloseIcon,
  ExternalLinkIcon,
  ListVideoIcon,
  PackageIcon,
  PlayIcon,
  RefreshIcon,
  SearchIcon,
} from './icons';

const VideoPlayerModal = dynamic(
  () => import('./video-player-modal').then((mod) => mod.VideoPlayerModal),
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
}: CatalogExplorerProps) {
  const [catalogoCompleto, setCatalogoCompleto] = useState<Catalogo | null>(null);
  const [erroCarga, setErroCarga] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [avisoAtualizacao, setAvisoAtualizacao] = useState<string | null>(null);

  const [tipo, setTipo] = useState<TipoCatalogo>(initialTipo);
  const [busca, setBusca] = useState(initialBusca);
  const [fonte, setFonte] = useState(initialFonte);
  const [categoriaFonte, setCategoriaFonte] = useState<FiltroCategoriaFonte>(
    initialCategoriaFonte,
  );
  const [ordem, setOrdem] = useState<OrdemCatalogo>(initialOrdem);
  const [limite, setLimite] = useState(PAGE_SIZE);
  const [itemEmReproducao, setItemEmReproducao] = useState<
    VideoCatalogo | PlaylistCatalogo | null
  >(initialPlayItem);
  const [, startTransition] = useTransition();

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
    if (busca.trim()) params.set('q', busca.trim());
    if (tipo === 'playlists') params.set('tipo', 'playlists');
    if (fonte) params.set('fonte', fonte);
    if (categoriaFonte !== 'todos') params.set('canais', categoriaFonte);
    if (ordem !== 'recentes') params.set('ordem', ordem);
    if (itemEmReproducao) params.set('play', itemEmReproducao.id);

    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/?${qs}` : '/');
  }, [busca, tipo, fonte, categoriaFonte, ordem, itemEmReproducao]);

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
    busca.trim() || fonte || categoriaFonte !== 'todos' || ordem !== 'recentes',
  );
  const mostrarDestaque = Boolean(
    spotlightAtual && tipo === 'videos' && !temFiltrosAtivos,
  );

  const itensBase = resultadosFiltrados ? resultadosFiltrados : initialItems;
  const itensSemDuplicata =
    mostrarDestaque && spotlightAtual
      ? itensBase.filter((item) => item.id !== spotlightAtual.id)
      : itensBase;
  const itensVisiveis = itensSemDuplicata.slice(0, limite);
  const totalResultados = resultadosFiltrados
    ? resultadosFiltrados.length
    : initialTotal;

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
      setLimite(PAGE_SIZE);
    });
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-10">
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
                  onClick={() => setItemEmReproducao(spotlightAtual)}
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
            </div>

            <button
              type="button"
              onClick={() => setItemEmReproducao(spotlightAtual)}
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

        {/* Resumo dos resultados e filtro rápido de canais oficiais / não oficiais */}
        <div
          aria-live="polite"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--ink-muted)] tabular-nums"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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

          <div className="flex items-center gap-3">
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

      {/* Grade espaçada de vídeos e playlists */}
      {itensVisiveis.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
          <p className="heading-display text-xl font-bold text-[var(--ink)]">
            Nenhum resultado encontrado
          </p>
          <p className="mt-2 text-sm text-[var(--ink-secondary)]">
            Tente outro termo, escolha outra fonte ou alterne entre Vídeos e Playlists.
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
                  onClick={() => setItemEmReproducao(item)}
                  className="flex flex-1 cursor-pointer flex-col text-left focus-visible:outline-offset-[-3px]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-[var(--player-bg)]">
                    {item.miniatura ? (
                      <img
                        src={item.miniatura}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
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

                  <a
                    href={ytUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir "${item.titulo}" no YouTube`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--accent-text)]"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
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

      {itemEmReproducao ? (
        <VideoPlayerModal
          item={itemEmReproducao}
          tipo={tipo}
          onClose={() => setItemEmReproducao(null)}
        />
      ) : null}
    </div>
  );
}
