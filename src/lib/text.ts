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

export type SegmentoTextoLink =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'link'; label: string; href: string };

const URL_NO_TEXTO_RE = /(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
const PONTUACAO_FINAL_RE = /[.,;:!?\]}>]+$/;

/**
 * Divide um texto (como a descrição de um Vídeo) em trechos de texto comum e links
 * clicáveis seguros (`http:` / `https:`), removendo pontuação colada ao final da URL.
 */
export function segmentarTextoComLinks(texto: string): SegmentoTextoLink[] {
  const normalizado = texto.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!normalizado) return [];

  const segmentos: SegmentoTextoLink[] = [];
  let cursor = 0;

  for (const match of normalizado.matchAll(URL_NO_TEXTO_RE)) {
    const inicio = match.index ?? 0;
    const bruto = match[0];

    if (inicio > cursor) {
      segmentos.push({ tipo: 'texto', valor: normalizado.slice(cursor, inicio) });
    }

    let urlTexto = bruto.replace(PONTUACAO_FINAL_RE, '');
    // Remove ')' final sobrando quando não há '(' balanceado dentro da URL
    while (urlTexto.endsWith(')')) {
      const abertos = (urlTexto.match(/\(/g) ?? []).length;
      const fechados = (urlTexto.match(/\)/g) ?? []).length;
      if (fechados > abertos) {
        urlTexto = urlTexto.slice(0, -1);
      } else {
        break;
      }
    }
    const sobra = bruto.slice(urlTexto.length);

    const candidatoHref = /^https?:\/\//i.test(urlTexto)
      ? urlTexto
      : `https://${urlTexto}`;

    let hrefValido: string | null = null;
    try {
      const parsed = new URL(candidatoHref);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        hrefValido = parsed.href;
      }
    } catch {
      hrefValido = null;
    }

    if (hrefValido) {
      segmentos.push({ tipo: 'link', label: urlTexto, href: hrefValido });
      if (sobra) segmentos.push({ tipo: 'texto', valor: sobra });
    } else {
      segmentos.push({ tipo: 'texto', valor: bruto });
    }

    cursor = inicio + bruto.length;
  }

  if (cursor < normalizado.length) {
    segmentos.push({ tipo: 'texto', valor: normalizado.slice(cursor) });
  }

  return segmentos;
}
