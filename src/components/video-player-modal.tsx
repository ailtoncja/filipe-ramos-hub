'use client';

import { useEffect, useRef, useState } from 'react';
import { ehFonteOficial, nomeExibicaoDaFonte } from '@/data/fontes';
import { montarUrlMaratona } from '@/lib/sequencias';
import {
  formatarDataBR,
  formatarNumero,
  formatarTempoVideo,
  segmentarTextoComLinks,
} from '@/lib/text';
import type {
  PlaylistCatalogo,
  ProgressoVideoLocal,
  TipoCatalogo,
  VideoCatalogo,
} from '@/lib/types';
import {
  embedDeFilaVideos,
  embedDePlaylistId,
  embedDeVideoId,
  urlYoutubeDoItem,
} from '@/lib/youtube';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  ExternalLinkIcon,
  LinkChainIcon,
  ListVideoIcon,
  PlusIcon,
  QueueListIcon,
} from './icons';

interface VideoPlayerModalProps {
  item: VideoCatalogo | PlaylistCatalogo;
  tipo: TipoCatalogo;
  salvo?: boolean;
  assistido?: boolean;
  naFila?: boolean;
  assistidosSet?: ReadonlySet<string>;
  sequencia?: VideoCatalogo[];
  tituloSequencia?: string;
  ehMaratona?: boolean;
  relacionados?: VideoCatalogo[];
  nomeJogoRelacionados?: string | null;
  buscaJogoRelacionados?: string | null;
  filaAtualSet?: ReadonlySet<string>;
  progressoSalvo?: ProgressoVideoLocal | null;
  onToggleSalvo?: () => void;
  onToggleAssistido?: () => void;
  onToggleFila?: () => void;
  onToggleItemFila?: (videoId: string) => void;
  onSalvarProgresso?: (videoId: string, tempo: number, duracao: number) => void;
  onResetarProgresso?: (videoId: string) => void;
  onSelecionarEpisodio?: (video: VideoCatalogo) => void;
  onAbrirRelacionado?: (video: VideoCatalogo) => void;
  onBuscarJogoRelacionado?: (busca: string) => void;
  onEditarComoMaratona?: (videos: VideoCatalogo[], titulo: string) => void;
  onSalvarMaratona?: (videos: VideoCatalogo[], titulo: string) => void;
  onClose: () => void;
}

export function VideoPlayerModal({
  item,
  tipo,
  salvo = false,
  assistido = false,
  naFila = false,
  assistidosSet,
  sequencia = [],
  tituloSequencia,
  ehMaratona = false,
  relacionados = [],
  nomeJogoRelacionados = null,
  buscaJogoRelacionados = null,
  filaAtualSet,
  progressoSalvo = null,
  onToggleSalvo,
  onToggleAssistido,
  onToggleFila,
  onToggleItemFila,
  onSalvarProgresso,
  onResetarProgresso,
  onSelecionarEpisodio,
  onAbrirRelacionado,
  onBuscarJogoRelacionado,
  onEditarComoMaratona,
  onSalvarMaratona,
  onClose,
}: VideoPlayerModalProps) {
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [maratonaSalvaFeedback, setMaratonaSalvaFeedback] = useState(false);
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);
  const [inicioEmbed, setInicioEmbed] = useState<{
    videoId: string;
    tempo: number;
    reinicio: number;
  }>(() => ({
    videoId: item.id,
    tempo: tipo === 'videos' ? (progressoSalvo?.tempo ?? 0) : 0,
    reinicio: 0,
  }));
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressoAtualRef = useRef<{
    videoId: string;
    tempo: number;
    duracao: number;
    ultimoSalvoEm: number;
  }>({
    videoId: item.id,
    tempo: 0,
    duracao: 0,
    ultimoSalvoEm: 0,
  });
  const onSalvarProgressoRef = useRef(onSalvarProgresso);
  const onResetarProgressoRef = useRef(onResetarProgresso);
  onSalvarProgressoRef.current = onSalvarProgresso;
  onResetarProgressoRef.current = onResetarProgresso;

  const tempoInicialParaIframe =
    inicioEmbed.videoId === item.id
      ? inicioEmbed.tempo
      : tipo === 'videos'
        ? (progressoSalvo?.tempo ?? 0)
        : 0;

  useEffect(() => {
    setDescricaoExpandida(false);
    setInicioEmbed({
      videoId: item.id,
      tempo: tipo === 'videos' ? (progressoSalvo?.tempo ?? 0) : 0,
      reinicio: 0,
    });
    progressoAtualRef.current = {
      videoId: item.id,
      tempo: 0,
      duracao: 0,
      ultimoSalvoEm: 0,
    };
    // Captura intencionalmente o progresso apenas ao trocar de vídeo, sem recarregar o iframe enquanto assiste
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, tipo]);

  useEffect(() => {
    if (tipo !== 'videos') return;

    function salvarAgora() {
      const atual = progressoAtualRef.current;
      if (atual.tempo >= 10) {
        onSalvarProgressoRef.current?.(atual.videoId, atual.tempo, atual.duracao);
        atual.ultimoSalvoEm = Date.now();
      }
    }

    function aoReceberMensagem(event: MessageEvent) {
      if (
        event.origin !== 'https://www.youtube-nocookie.com' &&
        event.origin !== 'https://www.youtube.com'
      ) {
        return;
      }
      if (typeof event.data !== 'string') return;
      let payload: {
        event?: string;
        info?: {
          currentTime?: number;
          duration?: number;
          playerState?: number;
          videoData?: { video_id?: string };
        };
      };
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      if (payload.event !== 'infoDelivery' || !payload.info) return;
      const info = payload.info;
      const atual = progressoAtualRef.current;

      if (info.videoData?.video_id && info.videoData.video_id !== atual.videoId) {
        salvarAgora();
        atual.videoId = info.videoData.video_id;
        atual.tempo = 0;
        atual.duracao = 0;
        atual.ultimoSalvoEm = 0;
      }

      if (typeof info.duration === 'number' && Number.isFinite(info.duration) && info.duration > 0) {
        atual.duracao = info.duration;
      }
      if (typeof info.currentTime === 'number' && Number.isFinite(info.currentTime)) {
        atual.tempo = info.currentTime;
      }

      if (info.playerState === 0) {
        // Vídeo terminou: limpa o ponto de retomada para começar do 0:00 numa próxima vez
        onResetarProgressoRef.current?.(atual.videoId);
        atual.tempo = 0;
        return;
      }

      const agora = Date.now();
      if (
        info.playerState === 2 ||
        (atual.tempo >= 10 && agora - atual.ultimoSalvoEm >= 5000)
      ) {
        salvarAgora();
      }
    }

    window.addEventListener('message', aoReceberMensagem);
    window.addEventListener('pagehide', salvarAgora);
    return () => {
      salvarAgora();
      window.removeEventListener('message', aoReceberMensagem);
      window.removeEventListener('pagehide', salvarAgora);
    };
  }, [tipo, item.id]);

  function iniciarEscutaIframe() {
    if (tipo !== 'videos') return;
    const enviarHandshake = () => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage(
        JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
        '*',
      );
      win.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'addEventListener',
          args: ['onStateChange'],
          id: 1,
          channel: 'widget',
        }),
        '*',
      );
    };
    enviarHandshake();
    window.setTimeout(enviarHandshake, 700);
  }

  function recomecarDoInicio() {
    onResetarProgresso?.(item.id);
    progressoAtualRef.current = {
      videoId: item.id,
      tempo: 0,
      duracao: progressoAtualRef.current.duracao,
      ultimoSalvoEm: 0,
    };
    setInicioEmbed((atual) => ({
      videoId: item.id,
      tempo: 0,
      reinicio: atual.reinicio + 1,
    }));
  }

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const temSequencia = tipo === 'videos' && sequencia.length >= 2;
  const indiceAtual = temSequencia
    ? sequencia.findIndex((v) => v.id === item.id)
    : -1;
  const episodioAnterior =
    indiceAtual > 0 ? sequencia[indiceAtual - 1] : null;
  const proximoEpisodio =
    indiceAtual >= 0 && indiceAtual < sequencia.length - 1
      ? sequencia[indiceAtual + 1]
      : null;

  const embedOrigin =
    typeof window !== 'undefined' ? window.location.origin : null;

  const embedSrc =
    tipo === 'playlists'
      ? embedDePlaylistId(item.id)
      : temSequencia
        ? embedDeFilaVideos(
            sequencia.map((v) => v.id),
            item.id,
            {
              start: tempoInicialParaIframe,
              enableJsApi: true,
              origin: embedOrigin,
            },
          )
        : embedDeVideoId(item.id, {
            start: tempoInicialParaIframe,
            enableJsApi: true,
            origin: embedOrigin,
          });

  const youtubeUrl = urlYoutubeDoItem(item.id, tipo);
  const oficial = ehFonteOficial(item.fontes);
  const qtdVideos =
    'quantidadeVideos' in item && typeof item.quantidadeVideos === 'number'
      ? item.quantidadeVideos
      : null;

  const nomeSequencia = tituloSequencia?.trim() || item.titulo;
  const descricaoLimpa = item.descricao?.trim() ?? '';
  const segmentosDescricao = descricaoLimpa
    ? segmentarTextoComLinks(descricaoLimpa)
    : [];
  const descricaoLonga =
    descricaoLimpa.length > 420 || descricaoLimpa.split('\n').length > 7;

  async function copiarLinkCompartilhavel() {
    try {
      const url = temSequencia
        ? `${window.location.origin}${montarUrlMaratona(
            sequencia.map((v) => v.id),
            nomeSequencia,
          )}`
        : window.location.href;
      await navigator.clipboard.writeText(url);
      setLinkCopiado(true);
      window.setTimeout(() => setLinkCopiado(false), 2200);
    } catch {
      // clipboard indisponível
    }
  }

  function handleSalvarMaratona() {
    if (!onSalvarMaratona || !temSequencia) return;
    onSalvarMaratona(sequencia, nomeSequencia);
    setMaratonaSalvaFeedback(true);
    window.setTimeout(() => setMaratonaSalvaFeedback(false), 2400);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim-strong)] p-3 backdrop-blur-sm sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="theater-panel flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            {temSequencia ? (
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-text)]">
                <QueueListIcon className="h-3.5 w-3.5" />
                {ehMaratona ? 'Maratona' : 'Sequência detectada'} •{' '}
                {nomeSequencia}
              </p>
            ) : null}
            <h2
              id="player-modal-titulo"
              className="heading-display text-lg font-bold leading-snug text-[var(--ink)] sm:text-xl"
            >
              {item.titulo}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)] tabular-nums">
              {oficial ? (
                <span className="rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-semibold text-[var(--accent-text)]">
                  Oficial
                </span>
              ) : (
                <span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-0.5 font-medium text-[var(--ink-secondary)]">
                  Arquivo
                </span>
              )}
              <span className="font-medium text-[var(--ink-secondary)]">
                {nomeExibicaoDaFonte(item.canal)}
              </span>
              <span>{formatarDataBR(item.publicadoEm)}</span>
              {tipo === 'playlists' && qtdVideos !== null ? (
                <span className="inline-flex items-center gap-1 text-[var(--ink-secondary)]">
                  <ListVideoIcon className="h-3.5 w-3.5" />
                  {qtdVideos} {qtdVideos === 1 ? 'vídeo' : 'vídeos'}
                </span>
              ) : null}
              {tipo === 'videos' && item.visualizacoes != null ? (
                <span>{formatarNumero(item.visualizacoes)} visualizações</span>
              ) : null}
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar player"
            className="btn-secondary inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="flex w-full justify-center bg-[var(--player-bg)]">
            <div className="aspect-video max-h-[54dvh] w-full">
              <iframe
                ref={iframeRef}
                key={`${embedSrc}:${inicioEmbed.reinicio}`}
                src={embedSrc}
                title={item.titulo}
                onLoad={iniciarEscutaIframe}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          {tipo === 'videos' && tempoInicialParaIframe >= 10 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--accent-soft)] px-5 py-2 text-xs sm:px-6">
              <span className="font-semibold text-[var(--accent-text)] tabular-nums">
                Retomando de {formatarTempoVideo(tempoInicialParaIframe)}
              </span>
              <button
                type="button"
                onClick={recomecarDoInicio}
                className="min-h-8 cursor-pointer font-semibold text-[var(--ink)] underline decoration-[var(--accent-soft-border)] underline-offset-2 hover:text-[var(--accent-text)]"
              >
                Começar do início
              </button>
            </div>
          ) : null}

          {/* Controles de Anterior / Próximo quando em Sequência ou Maratona */}
          {temSequencia && onSelecionarEpisodio ? (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-2.5 sm:px-6">
              <button
                type="button"
                disabled={!episodioAnterior}
                onClick={() =>
                  episodioAnterior && onSelecionarEpisodio(episodioAnterior)
                }
                className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Anterior
              </button>

              <span className="text-xs font-semibold text-[var(--ink-secondary)] tabular-nums">
                Episódio {indiceAtual + 1} de {sequencia.length}
              </span>

              <button
                type="button"
                disabled={!proximoEpisodio}
                onClick={() =>
                  proximoEpisodio && onSelecionarEpisodio(proximoEpisodio)
                }
                className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próximo
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-3.5 sm:px-6">
            <p className="text-xs text-[var(--ink-muted)]">
              {temSequencia
                ? 'Reprodução em fila contínua — o próximo episódio entra automaticamente.'
                : tipo === 'playlists'
                  ? 'Use o menu da playlist no canto do player para trocar de vídeo.'
                  : 'Reprodução embutida sem cookies de rastreamento.'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {tipo === 'videos' && onToggleFila ? (
                <button
                  type="button"
                  onClick={onToggleFila}
                  aria-pressed={naFila}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                    naFila
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                      : 'btn-secondary'
                  }`}
                >
                  {naFila ? (
                    <CheckIcon className="h-3.5 w-3.5" />
                  ) : (
                    <PlusIcon className="h-3.5 w-3.5" />
                  )}
                  {naFila ? 'Na fila' : '+ Fila'}
                </button>
              ) : null}
              {onToggleSalvo ? (
                <button
                  type="button"
                  onClick={onToggleSalvo}
                  aria-pressed={salvo}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                    salvo
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                      : 'btn-secondary'
                  }`}
                >
                  {salvo ? (
                    <BookmarkFilledIcon className="h-4 w-4" />
                  ) : (
                    <BookmarkIcon className="h-4 w-4" />
                  )}
                  {salvo ? 'Salvo' : 'Salvar'}
                </button>
              ) : null}
              {tipo === 'videos' && onToggleAssistido ? (
                <button
                  type="button"
                  onClick={onToggleAssistido}
                  aria-pressed={assistido}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                    assistido
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                      : 'btn-secondary'
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {assistido ? 'Assistido' : 'Assistido'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={copiarLinkCompartilhavel}
                className="btn-secondary inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
              >
                {linkCopiado ? (
                  <>
                    <CheckIcon className="h-4 w-4 text-[var(--accent-text)]" />
                    Link copiado
                  </>
                ) : (
                  <>
                    <LinkChainIcon className="h-4 w-4" />
                    {temSequencia ? 'Copiar link da Maratona' : 'Copiar link'}
                  </>
                )}
              </button>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-semibold"
              >
                YouTube
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Descrição do vídeo com links clicáveis */}
          {segmentosDescricao.length > 0 ? (
            <section
              aria-label="Descrição"
              className="border-t border-[var(--border)] px-5 py-4 sm:px-6"
            >
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Descrição
                </h3>
                <p
                  className={`mt-2 max-w-[75ch] whitespace-pre-line break-words text-sm leading-relaxed text-[var(--ink-secondary)] ${
                    descricaoLonga && !descricaoExpandida ? 'line-clamp-6' : ''
                  }`}
                >
                  {segmentosDescricao.map((seg, idx) =>
                    seg.tipo === 'link' ? (
                      <a
                        key={`${idx}-${seg.href}`}
                        href={seg.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-medium text-[var(--accent-text)] underline decoration-[var(--accent-soft-border)] underline-offset-2 transition-colors hover:decoration-[var(--accent)]"
                      >
                        {seg.label}
                      </a>
                    ) : (
                      <span key={idx}>{seg.valor}</span>
                    ),
                  )}
                </p>
                {descricaoLonga ? (
                  <button
                    type="button"
                    onClick={() => setDescricaoExpandida((v) => !v)}
                    className="mt-2.5 inline-flex min-h-9 cursor-pointer items-center text-xs font-semibold text-[var(--accent-text)] hover:underline"
                  >
                    {descricaoExpandida
                      ? 'Mostrar menos'
                      : 'Mostrar descrição completa'}
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          {/* Lista clicável de episódios da Sequência / Maratona */}
          {temSequencia && onSelecionarEpisodio ? (
            <section
              aria-label="Episódios em ordem"
              className="border-t border-[var(--border)] px-5 py-4 sm:px-6"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">
                  Episódios em ordem ({sequencia.length})
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {onSalvarMaratona ? (
                    <button
                      type="button"
                      onClick={handleSalvarMaratona}
                      className="btn-secondary inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold"
                    >
                      {maratonaSalvaFeedback ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                          Salva nas minhas Maratonas
                        </>
                      ) : (
                        <>
                          <BookmarkIcon className="h-3.5 w-3.5" />
                          Salvar nas minhas Maratonas
                        </>
                      )}
                    </button>
                  ) : null}
                  {onEditarComoMaratona ? (
                    <button
                      type="button"
                      onClick={() => onEditarComoMaratona(sequencia, nomeSequencia)}
                      className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-3 text-xs font-semibold text-[var(--accent-text)] hover:border-[var(--accent)]"
                    >
                      <QueueListIcon className="h-3.5 w-3.5" />
                      Editar como Maratona
                    </button>
                  ) : null}
                </div>
              </div>

              <ol className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {sequencia.map((ep, idx) => {
                  const atual = ep.id === item.id;
                  const epAssistido = Boolean(assistidosSet?.has(ep.id));
                  return (
                    <li key={ep.id}>
                      <button
                        type="button"
                        onClick={() => onSelecionarEpisodio(ep)}
                        aria-current={atual ? 'true' : undefined}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                          atual
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]'
                            : 'border-[var(--border)] bg-[var(--bg)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
                        }`}
                      >
                        <span
                          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums ${
                            atual
                              ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                              : 'bg-[var(--surface-elevated)] text-[var(--ink-muted)]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-1 font-semibold">
                            {ep.titulo}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-[var(--ink-muted)]">
                            {nomeExibicaoDaFonte(ep.canal)} •{' '}
                            {formatarDataBR(ep.publicadoEm)}
                          </span>
                        </span>
                        {epAssistido ? (
                          <CheckCircleIcon className="h-4 w-4 shrink-0 text-[var(--accent-text)]" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          {/* Vídeos relacionados ao mesmo Jogo */}
          {tipo === 'videos' && relacionados.length > 0 && onAbrirRelacionado ? (
            <section
              aria-label="Vídeos relacionados ao mesmo jogo"
              className="border-t border-[var(--border)] px-5 py-4 sm:px-6"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[var(--ink)]">
                  {nomeJogoRelacionados
                    ? `Mais vídeos de ${nomeJogoRelacionados}`
                    : 'Relacionados ao mesmo jogo'}
                </h3>
                {buscaJogoRelacionados && onBuscarJogoRelacionado ? (
                  <button
                    type="button"
                    onClick={() => onBuscarJogoRelacionado(buscaJogoRelacionados)}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-1 text-xs font-semibold text-[var(--accent-text)] hover:underline"
                  >
                    Ver todos no Catálogo
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {relacionados.map((rel) => {
                  const relOficial = ehFonteOficial(rel.fontes);
                  const relAssistido = Boolean(assistidosSet?.has(rel.id));
                  const relNaFila = Boolean(filaAtualSet?.has(rel.id));
                  return (
                    <div
                      key={rel.id}
                      className="group flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2 transition-colors hover:border-[var(--border-strong)]"
                    >
                      <button
                        type="button"
                        onClick={() => onAbrirRelacionado(rel)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                      >
                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--player-bg)]">
                          {rel.miniatura ? (
                            <img
                              src={rel.miniatura}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : null}
                          {relAssistido ? (
                            <span className="absolute left-1 top-1 rounded-full bg-[var(--overlay-surface)] p-0.5 text-[var(--accent-text)]">
                              <CheckCircleIcon className="h-3 w-3" />
                            </span>
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--accent-text)]">
                            {rel.titulo}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
                            <span className="truncate">
                              {nomeExibicaoDaFonte(rel.canal)}
                            </span>
                            {relOficial ? (
                              <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent-text)]">
                                Oficial
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                      {onToggleItemFila ? (
                        <button
                          type="button"
                          onClick={() => onToggleItemFila(rel.id)}
                          aria-pressed={relNaFila}
                          aria-label={
                            relNaFila
                              ? `Remover "${rel.titulo}" da fila`
                              : `Adicionar "${rel.titulo}" à fila`
                          }
                          title={relNaFila ? 'Na fila' : 'Adicionar à fila'}
                          className={`inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-elevated)] ${
                            relNaFila
                              ? 'text-[var(--accent-text)]'
                              : 'text-[var(--ink-muted)] hover:text-[var(--accent-text)]'
                          }`}
                        >
                          {relNaFila ? (
                            <CheckIcon className="h-3.5 w-3.5" />
                          ) : (
                            <PlusIcon className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
