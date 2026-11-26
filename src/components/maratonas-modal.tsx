'use client';

import { useEffect, useRef, useState } from 'react';
import { nomeExibicaoDaFonte } from '@/data/fontes';
import { montarUrlMaratona } from '@/lib/sequencias';
import type { MaratonaLocal, VideoCatalogo } from '@/lib/types';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  LinkChainIcon,
  PlayIcon,
  QueueListIcon,
  TrashIcon,
} from './icons';

interface MaratonasModalProps {
  filaVideos: VideoCatalogo[];
  maratonas: MaratonaLocal[];
  videosPorId: ReadonlyMap<string, VideoCatalogo>;
  tituloInicial?: string;
  onMoverNaFila: (videoId: string, direcao: -1 | 1) => void;
  onRemoverDaFila: (videoId: string) => void;
  onLimparFila: () => void;
  onAssistirLista: (videos: VideoCatalogo[], titulo: string) => void;
  onSalvarMaratona: (titulo: string, videoIds: string[]) => void;
  onCarregarNaFila: (videoIds: string[], titulo: string) => void;
  onExcluirMaratona: (maratonaId: string) => void;
  onClose: () => void;
}

export function MaratonasModal({
  filaVideos,
  maratonas,
  videosPorId,
  tituloInicial = '',
  onMoverNaFila,
  onRemoverDaFila,
  onLimparFila,
  onAssistirLista,
  onSalvarMaratona,
  onCarregarNaFila,
  onExcluirMaratona,
  onClose,
}: MaratonasModalProps) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [salvaOk, setSalvaOk] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTitulo(tituloInicial);
  }, [tituloInicial]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  async function copiarLink(chave: string, videoIds: string[], nome: string) {
    try {
      const url = `${window.location.origin}${montarUrlMaratona(videoIds, nome)}`;
      await navigator.clipboard.writeText(url);
      setCopiadoId(chave);
      window.setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      // clipboard indisponível
    }
  }

  function handleSalvar() {
    if (filaVideos.length === 0) return;
    const nome = titulo.trim() || `Maratona (${filaVideos.length} vídeos)`;
    onSalvarMaratona(
      nome,
      filaVideos.map((v) => v.id),
    );
    setTitulo('');
    setSalvaOk(true);
    window.setTimeout(() => setSalvaOk(false), 2200);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="maratonas-modal-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim-strong)] p-3 backdrop-blur-sm sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="theater-panel flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <h2
              id="maratonas-modal-titulo"
              className="heading-display flex items-center gap-2 text-lg font-bold text-[var(--ink)] sm:text-xl"
            >
              <QueueListIcon className="h-5 w-5 text-[var(--accent-text)]" />
              Montador de Maratonas
            </h2>
            <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">
              Monte sequências misturando qualquer fonte, assista em ordem ou compartilhe por link.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar montador de maratonas"
            className="btn-secondary inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Fila atual */}
          <section aria-label="Fila atual">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[var(--ink)] tabular-nums">
                Fila atual ({filaVideos.length})
              </h3>
              {filaVideos.length > 0 ? (
                <button
                  type="button"
                  onClick={onLimparFila}
                  className="min-h-9 cursor-pointer px-2 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--accent-text)] hover:underline"
                >
                  Limpar fila
                </button>
              ) : null}
            </div>

            {filaVideos.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg)] px-4 py-6 text-center text-xs text-[var(--ink-secondary)]">
                Clique no botão <strong>+</strong> nos cards de vídeos (ou em{' '}
                <strong>Editar como Maratona</strong> dentro de uma sequência) para montar sua fila aqui.
              </div>
            ) : (
              <>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Nome da Maratona (ex.: GTA 6 Completo, NFS Unbound)..."
                    maxLength={80}
                    className="min-h-11 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onAssistirLista(
                          filaVideos,
                          titulo.trim() || `Maratona (${filaVideos.length} vídeos)`,
                        )
                      }
                      className="btn-primary inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-xs font-semibold"
                    >
                      <PlayIcon className="h-3.5 w-3.5" />
                      Assistir
                    </button>
                    <button
                      type="button"
                      onClick={handleSalvar}
                      className="btn-secondary inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
                    >
                      {salvaOk ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                          Salva
                        </>
                      ) : (
                        'Salvar'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        copiarLink(
                          'fila',
                          filaVideos.map((v) => v.id),
                          titulo.trim() || 'Maratona',
                        )
                      }
                      className="btn-secondary inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold"
                    >
                      {copiadoId === 'fila' ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <LinkChainIcon className="h-3.5 w-3.5" />
                          Link
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <ol className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1">
                  {filaVideos.map((video, idx) => (
                    <li
                      key={video.id}
                      className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2"
                    >
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-elevated)] text-[11px] font-bold text-[var(--ink-muted)] tabular-nums">
                        {idx + 1}
                      </span>
                      <div className="hidden aspect-video w-16 shrink-0 overflow-hidden rounded-md bg-[var(--player-bg)] sm:block">
                        {video.miniatura ? (
                          <img
                            src={video.miniatura}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[var(--ink)]">
                          {video.titulo}
                        </p>
                        <p className="truncate text-[11px] text-[var(--ink-muted)]">
                          {nomeExibicaoDaFonte(video.canal)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onMoverNaFila(video.id, -1)}
                          aria-label={`Subir "${video.titulo}"`}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filaVideos.length - 1}
                          onClick={() => onMoverNaFila(video.id, 1)}
                          aria-label={`Descer "${video.titulo}"`}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoverDaFila(video.id)}
                          aria-label={`Remover "${video.titulo}" da fila`}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)]"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          {/* Maratonas salvas localmente */}
          <section aria-label="Minhas Maratonas salvas" className="border-t border-[var(--border)] pt-5">
            <h3 className="text-sm font-bold text-[var(--ink)] tabular-nums">
              Minhas Maratonas salvas ({maratonas.length})
            </h3>
            {maratonas.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--ink-muted)]">
                Nenhuma Maratona salva ainda. Salve a fila acima ou salve qualquer sequência direto do player.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {maratonas.map((m) => {
                  const resolvidos = m.videoIds
                    .map((id) => videosPorId.get(id))
                    .filter((v): v is VideoCatalogo => Boolean(v));
                  return (
                    <li
                      key={m.id}
                      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--ink)]">
                          {m.titulo}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--ink-muted)] tabular-nums">
                          {resolvidos.length}{' '}
                          {resolvidos.length === 1 ? 'vídeo' : 'vídeos'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={resolvidos.length === 0}
                          onClick={() => onAssistirLista(resolvidos, m.titulo)}
                          className="btn-primary inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-semibold disabled:opacity-40"
                        >
                          <PlayIcon className="h-3.5 w-3.5" />
                          Assistir
                        </button>
                        <button
                          type="button"
                          onClick={() => onCarregarNaFila(m.videoIds, m.titulo)}
                          className="btn-secondary inline-flex min-h-9 cursor-pointer items-center rounded-lg px-3 text-xs font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => copiarLink(m.id, m.videoIds, m.titulo)}
                          className="btn-secondary inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg px-3 text-xs font-semibold"
                        >
                          {copiadoId === m.id ? (
                            <>
                              <CheckIcon className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <LinkChainIcon className="h-3.5 w-3.5" />
                              Link
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onExcluirMaratona(m.id)}
                          aria-label={`Excluir Maratona "${m.titulo}"`}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--ink)]"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
