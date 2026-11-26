import Link from 'next/link';
import { contarRecursosCarePackage } from '@/lib/care-packages';
import type { CarePackage, StatusTransmissaoTwitch } from '@/lib/types';
import {
  ArrowRightIcon,
  ExternalLinkIcon,
  PackageIcon,
  TwitchIcon,
} from './icons';

export function TwitchLiveBanner({
  status,
}: {
  status: StatusTransmissaoTwitch | null;
}) {
  if (!status?.aoVivo) return null;

  return (
    <section
      aria-label="Transmissão ao vivo na Twitch"
      className="mb-6 flex flex-col gap-4 rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-white">
            <span
              aria-hidden="true"
              className="h-2 w-2 animate-pulse rounded-full bg-white"
            />
            AO VIVO NA TWITCH
          </span>
          {status.jogo ? (
            <span className="text-[var(--accent-text)]">
              Jogando {status.jogo}
            </span>
          ) : null}
          {status.tempoAoVivo ? (
            <span className="text-[var(--ink-muted)] tabular-nums">
              • {status.tempoAoVivo}
            </span>
          ) : null}
        </div>
        {status.titulo ? (
          <p className="mt-1.5 truncate text-sm font-semibold text-[var(--ink)] sm:text-base">
            {status.titulo}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <a
          href={status.canalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-semibold"
        >
          <TwitchIcon className="h-4 w-4" />
          Assistir na Twitch
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
        {status.carePackageSlug && status.carePackageNome ? (
          <Link
            href={`/care-packages/${status.carePackageSlug}`}
            className="btn-secondary inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold"
          >
            <PackageIcon className="h-4 w-4 text-[var(--accent-text)]" />
            Care Package
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function TwitchLastStreamPill({
  status,
}: {
  status: StatusTransmissaoTwitch | null;
}) {
  if (!status || status.aoVivo || (!status.jogo && !status.titulo)) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3.5 py-2.5 text-xs text-[var(--ink-secondary)]">
      <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--accent-text)]">
        <TwitchIcon className="h-3.5 w-3.5 shrink-0" />
        Última live na Twitch:
      </span>
      <span className="min-w-0 font-medium text-[var(--ink)]">
        {status.jogo ? status.jogo : null}
        {status.jogo && status.titulo ? ' — ' : null}
        {status.titulo ? status.titulo : null}
      </span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:ml-auto">
        {status.carePackageSlug ? (
          <Link
            href={`/care-packages/${status.carePackageSlug}`}
            className="inline-flex items-center gap-1 font-semibold text-[var(--accent-text)] hover:underline"
          >
            Care Package
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        ) : null}
        <a
          href={status.canalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:underline"
        >
          Twitch
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </span>
    </div>
  );
}

export function CarePackageContextBanner({
  matches,
  busca,
}: {
  matches: CarePackage[];
  busca: string;
}) {
  if (matches.length === 0) return null;

  if (matches.length === 1) {
    const cp = matches[0];
    const totalRecursos = contarRecursosCarePackage(cp);
    return (
      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[var(--accent-soft-border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden aspect-video w-28 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--player-bg)] sm:block">
            <img
              src={cp.imagemUrl}
              alt={cp.jogo}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-text)]">
              <PackageIcon className="h-3.5 w-3.5" />
              Care Package disponível
            </span>
            <p className="mt-0.5 truncate text-base font-bold text-[var(--ink)]">
              {cp.jogo}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--ink-secondary)]">
              {cp.descricao} • {totalRecursos}{' '}
              {totalRecursos === 1 ? 'recurso' : 'recursos'}
            </p>
          </div>
        </div>
        <Link
          href={`/care-packages/${cp.slug}`}
          className="btn-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold"
        >
          Abrir Care Package
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const visiveis = matches.slice(0, 3);
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-[var(--accent-soft-border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-card)]">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-text)]">
        <PackageIcon className="h-4 w-4 shrink-0" />
        Care Packages relacionados:
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {visiveis.map((cp) => (
          <Link
            key={cp.slug}
            href={`/care-packages/${cp.slug}`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-3 text-xs font-semibold text-[var(--accent-text)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
          >
            {cp.jogo}
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        ))}
        {matches.length > 3 ? (
          <Link
            href={`/care-packages?q=${encodeURIComponent(busca.trim())}`}
            className="inline-flex min-h-9 items-center px-2 text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--accent-text)] hover:underline"
          >
            Ver todos ({matches.length})
          </Link>
        ) : null}
      </div>
    </div>
  );
}
