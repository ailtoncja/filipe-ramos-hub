'use client';

import { useEffect, useRef, useState } from 'react';
import { ehFonteOficial, nomeExibicaoDaFonte } from '@/data/fontes';
import { formatarDataBR, formatarNumero } from '@/lib/text';
import type { PlaylistCatalogo, TipoCatalogo, VideoCatalogo } from '@/lib/types';
import { embedDePlaylistId, embedDeVideoId, urlYoutubeDoItem } from '@/lib/youtube';
import {
  CheckIcon,
  CloseIcon,
  ExternalLinkIcon,
  LinkChainIcon,
  ListVideoIcon,
} from './icons';

interface VideoPlayerModalProps {
  item: VideoCatalogo | PlaylistCatalogo;
  tipo: TipoCatalogo;
  onClose: () => void;
}

export function VideoPlayerModal({ item, tipo, onClose }: VideoPlayerModalProps) {
  const [linkCopiado, setLinkCopiado] = useState(false);
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

  const embedSrc =
    tipo === 'playlists' ? embedDePlaylistId(item.id) : embedDeVideoId(item.id);
  const youtubeUrl = urlYoutubeDoItem(item.id, tipo);
  const oficial = ehFonteOficial(item.fontes);
  const qtdVideos =
    'quantidadeVideos' in item && typeof item.quantidadeVideos === 'number'
      ? item.quantidadeVideos
      : null;

  async function copiarLinkCompartilhavel() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopiado(true);
      window.setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      // clipboard indisponível
    }
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
              src={embedSrc}
              title={item.titulo}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-3.5 sm:px-6">
            <p className="text-xs text-[var(--ink-muted)]">
              {tipo === 'playlists'
                ? 'Use o menu da playlist no canto do player para trocar de vídeo.'
                : 'Reprodução embutida sem cookies de rastreamento.'}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={copiarLinkCompartilhavel}
                className="btn-secondary inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-xs font-semibold"
              >
                {linkCopiado ? (
                  <>
                    <CheckIcon className="h-4 w-4 text-[var(--accent-text)]" />
                    Link copiado
                  </>
                ) : (
                  <>
                    <LinkChainIcon className="h-4 w-4" />
                    Copiar link
                  </>
                )}
              </button>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-xs font-semibold"
              >
                Abrir no YouTube
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

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
