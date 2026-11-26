'use client';

import { useEffect, useRef, useState } from 'react';
import { ehFonteOficial, nomeExibicaoDaFonte } from '@/data/fontes';
import { montarUrlMaratona } from '@/lib/sequencias';
import { formatarDataBR, formatarNumero } from '@/lib/text';
import type { PlaylistCatalogo, TipoCatalogo, VideoCatalogo } from '@/lib/types';
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
  onToggleSalvo?: () => void;
  onToggleAssistido?: () => void;
  onToggleFila?: () => void;
  onSelecionarEpisodio?: (video: VideoCatalogo) => void;
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
  onToggleSalvo,
  onToggleAssistido,
  onToggleFila,
  onSelecionarEpisodio,
  onEditarComoMaratona,
  onSalvarMaratona,
  onClose,
}: VideoPlayerModalProps) {
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [maratonaSalvaFeedback, setMaratonaSalvaFeedback] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  const embedSrc =
    tipo === 'playlists'
      ? embedDePlaylistId(item.id)
      : temSequencia
        ? embedDeFilaVideos(
            sequencia.map((v) => v.id),
            item.id,
          )
        : embedDeVideoId(item.id);

  const youtubeUrl = urlYoutubeDoItem(item.id, tipo);
  const oficial = ehFonteOficial(item.fontes);
  const qtdVideos =
    'quantidadeVideos' in item && typeof item.quantidadeVideos === 'number'
      ? item.quantidadeVideos
      : null;

  const nomeSequencia = tituloSequencia?.trim() || item.titulo;

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
          <div className="aspect-video w-full bg-[var(--player-bg)]">
            <iframe
              key={embedSrc}
              src={embedSrc}
              title={item.titulo}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

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

          {item.descricao ? (
            <div className="border-t border-[var(--border)] px-5 py-5 sm:px-6">
              <p className="max-w-[70ch] whitespace-pre-line break-words text-sm leading-relaxed text-[var(--ink-secondary)]">
                {item.descricao}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
