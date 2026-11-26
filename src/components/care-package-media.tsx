'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { nomeExibicaoDaFonte } from '@/data/fontes';
import { formatarDataBR } from '@/lib/text';
import type { ColecaoMidia, PlaylistCatalogo } from '@/lib/types';
import { embedDePlaylistId, parseYoutubeUrl, urlYoutubeDoItem } from '@/lib/youtube';
import { AlertIcon, ArrowRightIcon, ListVideoIcon, PlayIcon } from './icons';
import { YoutubeFacade } from './youtube-facade';

type AbaMidia = 'lives' | 'videos' | 'playlists';

interface ItemMidiaNormalizado {
  id: string;
  titulo: string;
  canal: string;
  subtitulo: string;
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string | null;
  ehPlaylist: boolean;
}

interface CarePackageMediaProps {
  jogo: string;
  lives?: ColecaoMidia;
  videosOficiais?: ColecaoMidia;
  playlistsCatalogo: PlaylistCatalogo[];
}

export function CarePackageMedia({
  jogo,
  lives,
  videosOficiais,
  playlistsCatalogo,
}: CarePackageMediaProps) {
  const itensLives = useMemo<ItemMidiaNormalizado[]>(() => {
    if (!lives?.fontes.length) return [];
    return lives.fontes.flatMap((fonte, index) => {
      const parsed = parseYoutubeUrl(fonte.url);
      if (!parsed) return [];
      return [
        {
          id: `live-${index}-${fonte.url}`,
          titulo: fonte.titulo ? `${jogo} — ${fonte.titulo}` : `Lives de ${jogo}`,
          canal: fonte.canal,
          subtitulo: `${parsed.ehPlaylist ? 'Playlist' : 'Vídeo'} no canal ${fonte.canal}`,
          embedUrl: parsed.embedUrl,
          watchUrl: parsed.watchUrl,
          thumbnailUrl: parsed.thumbnailUrl,
          ehPlaylist: parsed.ehPlaylist,
        },
      ];
    });
  }, [jogo, lives]);

  const itensOficiais = useMemo<ItemMidiaNormalizado[]>(() => {
    if (!videosOficiais?.fontes.length) return [];
    return videosOficiais.fontes.flatMap((fonte, index) => {
      const parsed = parseYoutubeUrl(fonte.url);
      if (!parsed) return [];
      return [
        {
          id: `oficial-${index}-${fonte.url}`,
          titulo: fonte.titulo ? fonte.titulo : `Vídeos oficiais de ${jogo}`,
          canal: fonte.canal,
          subtitulo: `${parsed.ehPlaylist ? 'Playlist oficial' : 'Vídeo oficial'} de ${fonte.canal}`,
          embedUrl: parsed.embedUrl,
          watchUrl: parsed.watchUrl,
          thumbnailUrl: parsed.thumbnailUrl,
          ehPlaylist: parsed.ehPlaylist,
        },
      ];
    });
  }, [jogo, videosOficiais]);

  const itensPlaylists = useMemo<ItemMidiaNormalizado[]>(() => {
    return playlistsCatalogo.map((pl) => ({
      id: `pl-${pl.id}`,
      titulo: pl.titulo,
      canal: nomeExibicaoDaFonte(pl.canal),
      subtitulo: `${nomeExibicaoDaFonte(pl.canal)} (${pl.quantidadeVideos} ${pl.quantidadeVideos === 1 ? 'vídeo' : 'vídeos'}, ${formatarDataBR(pl.publicadoEm)})`,
      embedUrl: embedDePlaylistId(pl.id).replace('&autoplay=1', ''),
      watchUrl: urlYoutubeDoItem(pl.id, 'playlists'),
      thumbnailUrl: pl.miniatura || null,
      ehPlaylist: true,
    }));
  }, [playlistsCatalogo]);

  const abasDisponiveis = useMemo(() => {
    const lista: {
      chave: AbaMidia;
      label: string;
      itens: ItemMidiaNormalizado[];
      aviso?: string;
    }[] = [];
    if (itensLives.length > 0) {
      lista.push({ chave: 'lives', label: 'Lives', itens: itensLives, aviso: lives?.aviso });
    }
    if (itensOficiais.length > 0) {
      lista.push({
        chave: 'videos',
        label: 'Vídeos oficiais',
        itens: itensOficiais,
        aviso: videosOficiais?.aviso,
      });
    }
    if (itensPlaylists.length > 0) {
      lista.push({
        chave: 'playlists',
        label: 'Playlists do Catálogo',
        itens: itensPlaylists,
      });
    }
    return lista;
  }, [
    itensLives,
    itensOficiais,
    itensPlaylists,
    lives?.aviso,
    videosOficiais?.aviso,
  ]);

  const [abaAtiva, setAbaAtiva] = useState<AbaMidia>(
    abasDisponiveis[0]?.chave ?? 'lives',
  );
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);

  const abaAtual =
    abasDisponiveis.find((a) => a.chave === abaAtiva) ?? abasDisponiveis[0] ?? null;

  const buscaCatalogoUrl = `/?q=${encodeURIComponent(jogo)}`;

  if (!abaAtual) {
    return (
      <section id="midia" className="pt-4">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
          <div>
            <h2 className="heading-display text-xl font-bold text-[var(--ink)]">
              Vídeos e playlists sobre {jogo}
            </h2>
            <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
              Nenhuma playlist curada está vinculada direto a este Care Package ainda, mas você pode procurar no Catálogo completo.
            </p>
          </div>
          <Link
            href={buscaCatalogoUrl}
            className="btn-primary inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-5 text-sm font-semibold"
          >
            Buscar no Catálogo
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  const itemAtual = abaAtual.itens[indiceSelecionado] ?? abaAtual.itens[0];
  const temMultiplasFontes = abaAtual.itens.length > 1;

  function trocarAba(chave: AbaMidia) {
    setAbaAtiva(chave);
    setIndiceSelecionado(0);
  }

  return (
    <section id="midia" className="pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="heading-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            Lives, vídeos e playlists
          </h2>
          <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
            Escolha a série ou canal e assista aqui mesmo com carregamento sob demanda.
          </p>
        </div>
        <Link
          href={buscaCatalogoUrl}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--accent-text)] hover:underline"
        >
          Mais sobre {jogo} no Catálogo
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Abas táteis de mídia */}
      <div
        role="tablist"
        aria-label={`Mídias de ${jogo}`}
        className="mt-6 inline-flex w-full flex-wrap gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-1.5 sm:w-auto"
      >
        {abasDisponiveis.map((aba) => {
          const selecionada = aba.chave === abaAtual.chave;
          return (
            <button
              key={aba.chave}
              type="button"
              role="tab"
              aria-selected={selecionada}
              onClick={() => trocarAba(aba.chave)}
              className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors sm:flex-none ${
                selecionada
                  ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                  : 'text-[var(--ink-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)]'
              }`}
            >
              <span>{aba.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  selecionada
                    ? 'bg-black/15 text-[var(--accent-ink)]'
                    : 'bg-[var(--surface-elevated)] text-[var(--ink-muted)]'
                }`}
              >
                {aba.itens.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Player + trilho lateral de seleção quando houver múltiplas fontes */}
      <div
        className={`mt-5 grid grid-cols-1 gap-6 ${
          temMultiplasFontes
            ? 'lg:grid-cols-[minmax(0,1fr)_340px]'
            : 'max-w-4xl'
        }`}
      >
        <div className="min-w-0">
          <YoutubeFacade
            key={itemAtual.id}
            embedUrl={itemAtual.embedUrl}
            watchUrl={itemAtual.watchUrl}
            titulo={itemAtual.titulo}
            subtitulo={itemAtual.subtitulo}
            thumbnailUrl={itemAtual.thumbnailUrl}
            ehPlaylist={itemAtual.ehPlaylist}
          />

          {abaAtual.aviso ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--warn-border)] bg-[var(--warn-bg)] px-4 py-3.5 text-sm leading-relaxed text-[var(--warn-ink)]">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{abaAtual.aviso}</p>
            </div>
          ) : null}
        </div>

        {temMultiplasFontes ? (
          <aside className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3.5 text-xs font-semibold text-[var(--ink-secondary)] tabular-nums">
              {abaAtual.itens.length} opções em {abaAtual.label}
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {abaAtual.itens.map((opcao, idx) => {
                const ativa = idx === indiceSelecionado;
                return (
                  <li key={opcao.id}>
                    <button
                      type="button"
                      onClick={() => setIndiceSelecionado(idx)}
                      aria-pressed={ativa}
                      className={`flex min-h-16 w-full cursor-pointer items-start gap-3.5 px-4 py-3.5 text-left transition-colors ${
                        ativa
                          ? 'bg-[var(--accent-soft)] text-[var(--ink)]'
                          : 'bg-[var(--surface)] text-[var(--ink-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          ativa
                            ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                            : 'bg-[var(--surface-elevated)] text-[var(--ink-muted)]'
                        }`}
                      >
                        {opcao.ehPlaylist ? (
                          <ListVideoIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-snug text-[var(--ink)]">
                          {opcao.titulo}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">
                          {opcao.canal}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
