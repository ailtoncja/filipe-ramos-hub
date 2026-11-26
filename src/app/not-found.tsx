import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/icons';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10">
      <div className="max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)] sm:p-10">
        <h1 className="heading-display text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
          Página não encontrada
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--ink-secondary)]">
          Esse endereço não corresponde a nenhum vídeo ou Care Package disponível no hub.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar ao Catálogo
          </Link>
          <Link
            href="/care-packages"
            className="btn-secondary inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-medium"
          >
            Explorar Care Packages
          </Link>
        </div>
      </div>
    </section>
  );
}
