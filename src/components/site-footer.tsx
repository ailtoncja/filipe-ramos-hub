import Link from 'next/link';
import { LISTA_OFICIAL_MODS_URL } from '@/data/care-packages';
import { ArrowUpIcon, ExternalLinkIcon } from './icons';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--surface-subtle)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div>
          <p className="heading-display text-base font-bold tracking-tight text-[var(--ink)]">
            Filipe Ramos{' '}
            <span className="font-semibold text-[var(--accent-text)]">Hub</span>
          </p>
          <p className="mt-1.5 text-sm text-[var(--ink-muted)]">
            O hubzinho do Vrilipe, mantido pela comunidade. Site de fãs sem afiliação oficial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-[var(--ink-secondary)] transition-colors hover:text-[var(--accent-text)]"
          >
            Catálogo
          </Link>
          <Link
            href="/care-packages"
            className="inline-flex min-h-11 items-center text-[var(--ink-secondary)] transition-colors hover:text-[var(--accent-text)]"
          >
            Care Packages
          </Link>
          <a
            href={LISTA_OFICIAL_MODS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-[var(--ink-secondary)] transition-colors hover:text-[var(--accent-text)]"
          >
            Lista oficial de mods
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
          <a
            href="#topo"
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[var(--accent-text)] hover:underline"
          >
            Voltar ao topo
            <ArrowUpIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
