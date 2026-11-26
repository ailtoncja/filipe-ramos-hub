import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CarePackageMedia } from '@/components/care-package-media';
import { CopyCodeBlock } from '@/components/copy-code-block';
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  PackageIcon,
} from '@/components/icons';
import { YoutubeFacade } from '@/components/youtube-facade';
import { CARE_PACKAGES } from '@/data/care-packages';
import {
  buscarCarePackagePorSlug,
  contarRecursosCarePackage,
  ehRecursoDesatualizado,
} from '@/lib/care-packages';
import { encontrarPlaylistsDoJogo } from '@/lib/catalog';
import {
  carregarCatalogoBase,
  carregarCatalogoServidor,
} from '@/lib/catalog.server';
import { limparPrefixoEmoji } from '@/lib/text';
import type { RecursoCarePackage } from '@/lib/types';
import { parseYoutubeUrl } from '@/lib/youtube';

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return CARE_PACKAGES.map((cp) => ({ slug: cp.slug }));
}

interface CarePackageDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CarePackageDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cp = buscarCarePackagePorSlug(slug);
  if (!cp) return { title: 'Care Package não encontrado' };

  return {
    title: `${cp.jogo} — Care Package`,
    description: cp.descricao,
  };
}

export default async function CarePackageDetailPage({
  params,
}: CarePackageDetailPageProps) {
  const ehBuild = process.env.NEXT_PHASE === 'phase-production-build';
  const [{ slug }, catalogo] = await Promise.all([
    params,
    ehBuild ? carregarCatalogoBase() : carregarCatalogoServidor(),
  ]);

  const cp = buscarCarePackagePorSlug(slug);
  if (!cp) notFound();

  const tutoriais: {
    label: string;
    embedUrl: string;
    watchUrl: string;
    thumbnailUrl: string | null;
  }[] = [];
  const linksDownload: RecursoCarePackage[] = [];

  for (const item of cp.itens) {
    const parsed = parseYoutubeUrl(item.url);
    if (parsed) {
      tutoriais.push({
        label: item.label,
        embedUrl: parsed.embedUrl,
        watchUrl: parsed.watchUrl,
        thumbnailUrl: parsed.thumbnailUrl,
      });
    } else {
      linksDownload.push(item);
    }
  }

  const urlsCuradas = [
    ...(cp.lives?.fontes.map((f) => f.url) ?? []),
    ...(cp.videosOficiais?.fontes.map((f) => f.url) ?? []),
  ];
  const playlistsRelacionadas = encontrarPlaylistsDoJogo(
    cp.jogo,
    catalogo.playlists,
    urlsCuradas,
  );

  const totalRecursos = contarRecursosCarePackage(cp);
  const totalMidias =
    (cp.lives?.fontes.length ?? 0) +
    (cp.videosOficiais?.fontes.length ?? 0) +
    playlistsRelacionadas.length;

  return (
    <article className="mx-auto max-w-[1400px] px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:px-10">
      {/* Navegação superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 text-sm">
        <Link
          href="/care-packages"
          className="inline-flex min-h-11 items-center gap-2 font-medium text-[var(--ink-secondary)] transition-colors hover:text-[var(--accent-text)]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Todos os Care Packages
        </Link>
        <Link
          href={`/?q=${encodeURIComponent(cp.jogo)}`}
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[var(--accent-text)] hover:underline"
        >
          Buscar {cp.jogo} no Catálogo
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Cabeçalho cinematográfico com brilho ambiente real derivado da capa */}
      <header className="hero-enter relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
        <img
          src={cp.imagemUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.22] blur-2xl dark:opacity-[0.34]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--surface)]/92 via-[var(--surface)]/78 to-[var(--surface)]/55"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-10">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--player-bg)] shadow-[var(--shadow-lift)]">
            <img
              src={cp.imagemUrl}
              alt={cp.jogo}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <h1 className="heading-display text-[clamp(2rem,3.6vw,3.1rem)] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--ink)]">
              {cp.jogo}
            </h1>
            <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-[var(--ink-secondary)]">
              {cp.descricao}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs font-semibold tabular-nums">
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-[var(--ink)]">
                {totalRecursos} {totalRecursos === 1 ? 'recurso' : 'recursos'}
              </span>
              {cp.notas?.length ? (
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-[var(--ink)]">
                  {cp.notas.length}{' '}
                  {cp.notas.length === 1 ? 'guia ou aviso' : 'guias e avisos'}
                </span>
              ) : null}
              {tutoriais.length > 0 ? (
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-[var(--ink)]">
                  {tutoriais.length}{' '}
                  {tutoriais.length === 1 ? 'tutorial em vídeo' : 'tutoriais em vídeo'}
                </span>
              ) : null}
              {totalMidias > 0 ? (
                <span className="rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-[var(--accent-text)]">
                  {totalMidias}{' '}
                  {totalMidias === 1 ? 'mídia vinculada' : 'mídias vinculadas'}
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#downloads"
                className="btn-primary inline-flex min-h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-semibold"
              >
                <DownloadIcon className="h-4 w-4" />
                Downloads e mods
              </a>
              <a
                href="#midia"
                className="btn-secondary inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
              >
                Lives, vídeos e playlists
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo organizado com proporção editorial equilibrada */}
      <div id="downloads" className="mt-12 space-y-12">
        {linksDownload.length > 0 ? (
          <section className="max-w-4xl">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="heading-display text-2xl font-bold tracking-tight text-[var(--ink)]">
                Downloads e links principais
              </h2>
              <span className="text-sm text-[var(--ink-muted)] tabular-nums">
                {linksDownload.length}{' '}
                {linksDownload.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <ul className="mt-4 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
              {linksDownload.map((item) => {
                const desatualizado = ehRecursoDesatualizado(item.label);
                return (
                  <li key={`${item.url}-${item.label}`}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex min-h-16 items-center justify-between gap-4 px-5 py-4 transition-colors ${
                        desatualizado
                          ? 'bg-[var(--warn-bg)] text-[var(--warn-ink)] hover:opacity-90'
                          : 'bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-elevated)]'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3.5">
                        <span
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            desatualizado
                              ? 'bg-black/10 text-[var(--warn-ink)]'
                              : 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                          }`}
                        >
                          {desatualizado ? (
                            <AlertIcon className="h-5 w-5" />
                          ) : (
                            <PackageIcon className="h-5 w-5" />
                          )}
                        </span>
                        <span className="text-sm font-semibold leading-snug group-hover:text-[var(--accent-text)] sm:text-base">
                          {item.label}
                        </span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-2.5 text-xs font-semibold">
                        {desatualizado ? (
                          <span className="rounded-full border border-[var(--warn-border)] px-2.5 py-0.5">
                            Atenção
                          </span>
                        ) : null}
                        <ExternalLinkIcon className="h-4 w-4 text-[var(--ink-muted)] transition-colors group-hover:text-[var(--accent-text)]" />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* Tutoriais em vídeo posicionados junto da instalação */}
        {tutoriais.length > 0 ? (
          <section>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="heading-display text-2xl font-bold tracking-tight text-[var(--ink)]">
                Tutorial de instalação
              </h2>
              <span className="text-sm text-[var(--ink-muted)] tabular-nums">
                {tutoriais.length}{' '}
                {tutoriais.length === 1 ? 'vídeo' : 'vídeos'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {tutoriais.map((tut) => (
                <YoutubeFacade
                  key={tut.watchUrl}
                  embedUrl={tut.embedUrl}
                  watchUrl={tut.watchUrl}
                  titulo={tut.label}
                  subtitulo="Tutorial vinculado ao Care Package"
                  thumbnailUrl={tut.thumbnailUrl}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Guias, avisos de versão e configs copiáveis */}
        {cp.notas?.length ? (
          <section className="max-w-4xl">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="heading-display text-2xl font-bold tracking-tight text-[var(--ink)]">
                Guias, avisos e configurações
              </h2>
              <span className="text-sm text-[var(--ink-muted)] tabular-nums">
                {cp.notas.length} {cp.notas.length === 1 ? 'nota' : 'notas'}
              </span>
            </div>

            <div className="mt-4 space-y-5">
              {cp.notas.map((nota) => {
                const ehAlerta = /aten[çc][aã]o|vers[aã]o 4\.04/i.test(nota.titulo);
                const tituloLimpo = limparPrefixoEmoji(nota.titulo);
                return (
                  <section
                    key={nota.titulo}
                    className={`overflow-hidden rounded-2xl border p-6 shadow-[var(--shadow-card)] sm:p-7 ${
                      ehAlerta
                        ? 'border-[var(--warn-border)] bg-[var(--warn-bg)]'
                        : 'border-[var(--border)] bg-[var(--surface)]'
                    }`}
                  >
                    <h3
                      className={`heading-display flex items-center gap-2.5 text-lg font-bold sm:text-xl ${
                        ehAlerta ? 'text-[var(--warn-ink)]' : 'text-[var(--ink)]'
                      }`}
                    >
                      {ehAlerta ? <AlertIcon className="h-5 w-5 shrink-0" /> : null}
                      <span>{tituloLimpo}</span>
                    </h3>

                    {nota.texto ? (
                      <p
                        className={`mt-3 max-w-[70ch] whitespace-pre-line break-words text-sm leading-relaxed sm:text-base ${
                          ehAlerta
                            ? 'text-[var(--warn-ink)]'
                            : 'text-[var(--ink-secondary)]'
                        }`}
                      >
                        {nota.texto}
                      </p>
                    ) : null}

                    {nota.passos?.length ? (
                      <ol className="mt-5 max-w-[70ch] space-y-3.5">
                        {nota.passos.map((passo, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3.5 text-sm leading-relaxed text-[var(--ink-secondary)] sm:text-base"
                          >
                            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent-soft-border)] bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent-text)] tabular-nums">
                              {idx + 1}
                            </span>
                            <span className="break-words">{passo}</span>
                          </li>
                        ))}
                      </ol>
                    ) : null}

                    {nota.dica ? (
                      <div className="mt-5 flex max-w-[70ch] items-start gap-2.5 border-t border-[var(--border)] pt-4 text-xs leading-relaxed text-[var(--warn-ink)] sm:text-sm">
                        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{nota.dica}</p>
                      </div>
                    ) : null}

                    {nota.codigo ? <CopyCodeBlock codigo={nota.codigo} /> : null}
                  </section>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Listas de mods agrupadas */}
        {cp.grupos?.length ? (
          <section>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="heading-display text-2xl font-bold tracking-tight text-[var(--ink)]">
                Lista de mods incluídos
              </h2>
              <span className="text-sm text-[var(--ink-muted)] tabular-nums">
                {cp.grupos.reduce((acc, g) => acc + g.mods.length, 0)} mods em{' '}
                {cp.grupos.length} grupos
              </span>
            </div>

            <div className="mt-5 space-y-7">
              {cp.grupos.map((grupo) => (
                <div key={grupo.titulo}>
                  <div className="flex items-center justify-between gap-3 pb-3">
                    <h3 className="heading-display text-lg font-bold text-[var(--ink)]">
                      {grupo.titulo}
                    </h3>
                    <span className="rounded-full bg-[var(--surface-elevated)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink-muted)] tabular-nums">
                      {grupo.mods.length}
                    </span>
                  </div>

                  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {grupo.mods.map((mod) => (
                      <li key={`${mod.label}-${mod.url}`}>
                        <a
                          href={mod.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex h-full min-h-14 items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--accent-text)]">
                              {mod.label}
                            </span>
                            {mod.descricao ? (
                              <span className="mt-1 block text-xs leading-relaxed text-[var(--ink-secondary)]">
                                {mod.descricao}
                              </span>
                            ) : null}
                          </span>
                          <ExternalLinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-muted)] transition-colors group-hover:text-[var(--accent-text)]" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Área de mídia reconstruída */}
        <CarePackageMedia
          jogo={cp.jogo}
          lives={cp.lives}
          videosOficiais={cp.videosOficiais}
          playlistsCatalogo={playlistsRelacionadas}
        />
      </div>
    </article>
  );
}
