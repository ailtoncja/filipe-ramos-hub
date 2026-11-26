'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';

interface CopyCodeBlockProps {
  codigo: string;
}

export function CopyCodeBlock({ codigo }: CopyCodeBlockProps) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard indisponível
    }
  }

  return (
    <div className="mt-5 -mx-6 -mb-6 overflow-hidden border-t border-[var(--border)] bg-[var(--surface-subtle)] sm:-mx-7 sm:-mb-7">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-2 sm:px-7">
        <span className="text-xs font-medium text-[var(--ink-muted)]">
          Código para copiar
        </span>
        <button
          type="button"
          onClick={copiar}
          className="btn-secondary inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3.5 text-xs font-semibold"
        >
          {copiado ? (
            <>
              <CheckIcon className="h-3.5 w-3.5 text-[var(--accent-text)]" />
              Copiado
            </>
          ) : (
            <>
              <CopyIcon className="h-3.5 w-3.5" />
              Copiar código
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-6 py-4 font-mono text-xs leading-relaxed text-[var(--ink)] sm:px-7">
        <code>{codigo}</code>
      </pre>
    </div>
  );
}
