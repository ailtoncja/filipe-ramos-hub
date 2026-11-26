'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatarDataBR } from '@/lib/text';
import { ThemeToggle } from './theme-toggle';

const FILIPE_AVATAR =
  'https://yt3.googleusercontent.com/6Xp6EWdRKEGrSrhlfDeRM84TLhYPrZafguFDiDrO9NPd1pp5M_DQ3SzcaTv7FPn0OEaJ3bWwvUk=s900-c-k-c0x00ffffff-no-rj';

interface SiteHeaderProps {
  atualizadoEm: string | null;
  totalCarePackages: number;
}

export function SiteHeader({ atualizadoEm, totalCarePackages }: SiteHeaderProps) {
  const pathname = usePathname();
  const emCarePackages = pathname.startsWith('/care-packages');

  return (
    <header
      id="topo"
      className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md"
    >
      <div className="mx-auto flex min-h-16 max-w-[1400px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:flex-nowrap sm:px-6 lg:px-10">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-3 text-[var(--ink)] transition-opacity hover:opacity-90"
          aria-label="Filipe Ramos Hub — página inicial"
        >
          <img
            src={FILIPE_AVATAR}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full border border-[var(--border-strong)] object-cover"
          />
          <span className="heading-display text-lg font-bold tracking-tight">
            Filipe Ramos{' '}
            <span className="font-semibold text-[var(--accent-text)]">Hub</span>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="order-3 flex w-full items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] p-1 sm:order-none sm:w-auto"
        >
          <Link
            href="/"
            aria-current={!emCarePackages ? 'page' : undefined}
            className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors sm:flex-none ${
              !emCarePackages
                ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            Catálogo
          </Link>
          <Link
            href="/care-packages"
            aria-current={emCarePackages ? 'page' : undefined}
            className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors sm:flex-none ${
              emCarePackages
                ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
            }`}
          >
            <span>Care Packages</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                emCarePackages
                  ? 'bg-black/15 text-[var(--accent-ink)]'
                  : 'bg-[var(--surface-elevated)] text-[var(--ink-muted)]'
              }`}
            >
              {totalCarePackages}
            </span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {atualizadoEm ? (
            <span className="hidden text-xs text-[var(--ink-muted)] tabular-nums md:inline">
              Atualizado em {formatarDataBR(atualizadoEm)}
            </span>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
