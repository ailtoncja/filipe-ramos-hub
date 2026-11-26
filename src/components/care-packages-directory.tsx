'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { LISTA_OFICIAL_MODS_URL } from '@/data/care-packages';
import {
  contarRecursosCarePackage,
  FILTROS_CARE_PACKAGES,
  filtrarCarePackages,
} from '@/lib/care-packages';
import type { TipoRecursoChave } from '@/lib/types';
import {
  ArrowRightIcon,
  CloseIcon,
  ExternalLinkIcon,
  SearchIcon,
} from './icons';

interface CarePackagesDirectoryProps {
  initialBusca: string;
  initialFiltros: TipoRecursoChave[];
  playlistsCountPorSlug: Record<string, number>;
}

export function CarePackagesDirectory({
  initialBusca,
  initialFiltros,
  playlistsCountPorSlug,
}: CarePackagesDirectoryProps) {
  const [busca, setBusca] = useState(initialBusca);
  const [filtrosAtivos, setFiltrosAtivos] = useState<ReadonlySet<TipoRecursoChave>>(
    () => new Set(initialFiltros),
  );

  const buscaDiferida = useDeferredValue(busca);

  useEffect(() => {
    const params = new URLSearchParams();
    if (busca.trim()) params.set('q', busca.trim());
    if (filtrosAtivos.size > 0) {
      params.set('filtros', [...filtrosAtivos].join(','));
    }
    const qs = params.toString();
    window.history.replaceState(
      null,
      '',
      qs ? `/care-packages?${qs}` : '/care-packages',
    );
  }, [busca, filtrosAtivos]);

  const resultados = useMemo(
    () => filtrarCarePackages(buscaDiferida, filtrosAtivos),
    [buscaDiferida, filtrosAtivos],
  );

  function toggleFiltro(chave: TipoRecursoChave) {
    setFiltrosAtivos((atuais) => {
      const proximo = new Set(atuais);
      if (proximo.has(chave)) {
        proximo.delete(chave);
      } else {
        proximo.add(chave);
      }
      return proximo;
    });
  }

  function limparTudo() {
    setBusca('');
    setFiltrosAtivos(new Set());
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="heading-display text-[clamp(2rem,3.8vw,3.1rem)] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--ink)]">
            Care Packages
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--ink-secondary)]">
            Mods, mapas, retexturas, guias de instalação e playlists curadas por jogo — cada página com link direto para compartilhar.
          </p>
        </div>

        <a
          href={LISTA_OFICIAL_MODS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
        >
          Lista oficial de mods
          <ExternalLinkIcon className="h-4 w-4" />
        </a>
      </header>

      {/* Busca + pílulas de filtro com scroll suave no mobile */}
      <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-card)]">
        <label className="relative flex min-h-12 items-center rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 transition-colors focus-within:border-[var(--accent)]">
          <span className="sr-only">Buscar jogo</span>
          <SearchIcon className="h-4 w-4 shrink-0 text-[var(--accent-text)]" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar jogo (Witcher, Fallout)..."
            className="h-full w-full bg-transparent px-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none"
          />
          {busca ? (
            <button
              type="button"
              onClick={() => setBusca('')}
              aria-label="Limpar busca de jogo"
              className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        <div className="-mx-3 mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {FILTROS_CARE_PACKAGES.map((filtro) => {
            const ativo = filtrosAtivos.has(filtro.chave);
            return (
              <button
                key={filtro.chave}
                type="button"
                onClick={() => toggleFiltro(filtro.chave)}
                aria-pressed={ativo}
                className={`min-h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-colors ${
                  ativo
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]'
                    : 'border-[var(--border)] bg-[var(--bg)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)]'
                }`}
              >
                {filtro.label}
              </button>
            );
          })}
          {filtrosAtivos.size > 0 || busca.trim() ? (
            <button
              type="button"
              onClick={limparTudo}
              className="ml-auto min-h-11 shrink-0 cursor-pointer whitespace-nowrap px-3 text-xs font-semibold text-[var(--accent-text)] hover:underline"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>

      {/* Contador */}
      <div
        aria-live="polite"
        className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--ink-muted)] tabular-nums"
      >
        <p>
          <strong className="font-semibold text-[var(--ink)]">
            {resultados.length} {resultados.length === 1 ? 'jogo' : 'jogos'}
          </strong>{' '}
          disponíveis
        </p>
      </div>

      {/* Vitrine de Care Packages */}
      {resultados.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
          <p className="heading-display text-xl font-bold text-[var(--ink)]">
            Nenhum jogo encontrado
          </p>
          <p className="mt-2 text-sm text-[var(--ink-secondary)]">
            Tente outro nome ou limpe os filtros selecionados.
          </p>
          <button
            type="button"
            onClick={limparTudo}
            className="btn-primary mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-xl px-5 text-sm font-semibold"
          >
            Mostrar todos os jogos
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((cp) => {
            const totalRecursos = contarRecursosCarePackage(cp);
            const temLives = Boolean(cp.lives?.fontes.length);
            const temOficiais = Boolean(cp.videosOficiais?.fontes.length);
            const qtdPlaylists = playlistsCountPorSlug[cp.slug] ?? 0;

            return (
              <article
                key={cp.slug}
                className="cinema-card group flex min-w-0 flex-col overflow-hidden rounded-2xl"
              >
                <Link
                  href={`/care-packages/${cp.slug}`}
                  className="flex flex-1 flex-col focus-visible:outline-offset-[-3px]"
                >
                  <div className="aspect-video w-full overflow-hidden bg-[var(--player-bg)]">
                    <img
                      src={cp.imagemUrl}
                      alt={cp.jogo}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5 pb-3">
                    <h2 className="heading-display text-xl font-bold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent-text)]">
                      {cp.jogo}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
                      {cp.descricao}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs tabular-nums">
                      <span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-1 font-medium text-[var(--ink-secondary)]">
                        {totalRecursos}{' '}
                        {totalRecursos === 1 ? 'recurso' : 'recursos'}
                      </span>
                      {cp.notas?.length ? (
                        <span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-1 font-medium text-[var(--ink-secondary)]">
                          {cp.notas.length}{' '}
                          {cp.notas.length === 1 ? 'guia' : 'guias'}
                        </span>
                      ) : null}
                      {temLives ? (
                        <span className="rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-2.5 py-1 font-semibold text-[var(--accent-text)]">
                          Lives
                        </span>
                      ) : null}
                      {temOficiais ? (
                        <span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-1 font-medium text-[var(--ink-secondary)]">
                          Vídeos oficiais
                        </span>
                      ) : null}
                      {qtdPlaylists > 0 ? (
                        <span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-1 font-medium text-[var(--ink-secondary)]">
                          {qtdPlaylists}{' '}
                          {qtdPlaylists === 1 ? 'playlist' : 'playlists'}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--border)] px-5 py-2.5 text-sm">
                  <Link
                    href={`/care-packages/${cp.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--accent-text)] hover:underline"
                  >
                    Abrir Care Package
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  {temLives || temOficiais || qtdPlaylists > 0 ? (
                    <Link
                      href={`/care-packages/${cp.slug}#midia`}
                      className="inline-flex min-h-11 items-center px-2 text-xs font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
                    >
                      Ver mídia
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
