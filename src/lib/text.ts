const DIACRITICS_RE = /[\u0300-\u036f]/g;
const NON_ALNUM_RE = /[^a-z0-9]+/g;
const TRIM_DASH_RE = /^-+|-+$/g;
const LEADING_EMOJI_RE = /^[\p{Extended_Pictographic}\uFE0F\u200D\u26A0\u2699\u23EA\u2753]+\s*/u;

const INT_FORMATTER = new Intl.NumberFormat('pt-BR');
const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase();
}

export function slugifyJogo(jogo: string): string {
  return normalizarTexto(jogo)
    .replace(/['’]/g, '')
    .replace(NON_ALNUM_RE, '-')
    .replace(TRIM_DASH_RE, '');
}

export function formatarNumero(valor: number): string {
  return INT_FORMATTER.format(valor);
}

export function formatarDataBR(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '—';
  return DATE_FORMATTER.format(parsed);
}

/** Remove emojis decorativos no início de títulos de notas mantendo o texto íntegro. */
export function limparPrefixoEmoji(titulo: string): string {
  return titulo.replace(LEADING_EMOJI_RE, '').trim();
}
