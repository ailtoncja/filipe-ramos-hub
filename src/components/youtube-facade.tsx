'use client';

import { useState } from 'react';
import { ExternalLinkIcon, ListVideoIcon, PlayIcon } from './icons';

interface YoutubeFacadeProps {
  embedUrl: string;
  watchUrl: string;
  titulo: string;
  subtitulo?: string;
  thumbnailUrl?: string | null;
  ehPlaylist?: boolean;
  autoAtivo?: boolean;
}

export function YoutubeFacade({
  embedUrl,
  watchUrl,
  titulo,
  subtitulo,
  thumbnailUrl,
  ehPlaylist = false,
  autoAtivo = false,
}: YoutubeFacadeProps) {
  const [ativo, setAtivo] = useState(autoAtivo);

  const srcComAutoplay = embedUrl.includes('?')
    ? `${embedUrl}&autoplay=1`
    : `${embedUrl}?autoplay=1`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--player-bg)]">
        {ativo ? (
          <iframe
            src={autoAtivo ? embedUrl : srcComAutoplay}
            title={titulo}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setAtivo(true)}
            className="group relative flex h-full w-full cursor-pointer items-center justify-center text-left focus-visible:outline-offset-[-3px]"
            aria-label={`Reproduzir ${titulo}`}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-[var(--player-bg)] text-sm font-medium text-[var(--overlay-ink)]">
                {ehPlaylist ? 'Playlist no YouTube' : 'Vídeo no YouTube'}
              </div>
            )}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-200 group-hover:opacity-90"
            />
            <span className="btn-primary relative z-10 inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold shadow-lg">
              {ehPlaylist ? (
                <ListVideoIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
              {ehPlaylist ? 'Reproduzir playlist' : 'Assistir agora'}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--ink)]">{titulo}</p>
          {subtitulo ? (
            <p className="mt-0.5 truncate text-xs text-[var(--ink-muted)]">
              {subtitulo}
            </p>
          ) : null}
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-semibold"
        >
          Abrir no YouTube
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
