import { normalizarTexto } from './text';

const DOTTED_ACRONYM_RE = /\b(?:[a-z]\.){2,}[a-z]?/g;
const APOSTROPHE_RE = /['’`]/g;
const NON_ALNUM_SPACE_RE = /[^a-z0-9]+/g;

const STOP_WORDS_PT = new Set([
  'a',
  'as',
  'o',
  'os',
  'e',
  'de',
  'do',
  'da',
  'dos',
  'das',
  'no',
  'na',
  'nos',
  'nas',
  'em',
  'um',
  'uma',
  'com',
  'para',
  'por',
]);

interface RegraAlias {
  padrao: RegExp;
  alias: string | ((match: RegExpMatchArray) => string);
}

const REGRAS_ALIAS: RegraAlias[] = [
  // Need for Speed
  { padrao: /\b(?:nfs|need for speed)\b/, alias: 'need for speed nfs' },
  {
    padrao: /\b(?:nfs|need for speed)\b.*\bmw\b|\bmw\b.*\b(?:nfs|need for speed)\b/,
    alias: 'most wanted',
  },
  {
    padrao: /\b(?:nfs|need for speed)\b.*\bug\s*2\b/,
    alias: 'underground 2',
  },
  // Resident Evil
  {
    padrao: /\b(?:re\s*([0-9])|resident evil\s*([0-9]))\b/g,
    alias: (m) => {
      const n = m[1] ?? m[2];
      return `resident evil re${n} re ${n}`;
    },
  },
  {
    padrao: /\b(?:resident evil|re\s*(?:cv|code veronica|remake|classic|outbreak|zero))\b/,
    alias: 'resident evil re',
  },
  // GTA / Grand Theft Auto
  {
    padrao: /\b(?:gta|grand theft auto)\s*(?:iv|4)\b/,
    alias: 'gta 4 gta iv gta4 gtaiv grand theft auto 4',
  },
  {
    padrao: /\b(?:gta|grand theft auto)\s*(?:vi|6)\b/,
    alias: 'gta 6 gta vi gta6 gtavi grand theft auto 6',
  },
  {
    padrao: /\b(?:gta|grand theft auto)\s*(?:v|5)\b/,
    alias: 'gta 5 gta v gta5 gtav grand theft auto 5',
  },
  {
    padrao: /\b(?:gta|grand theft auto)\s*(?:iii|3)\b/,
    alias: 'gta 3 gta iii gta3 gtaiii grand theft auto 3',
  },
  {
    padrao: /\b(?:gta|grand theft auto)\s*(?:sa|san andreas)\b|\bsan andreas\b/,
    alias: 'gta sa gtasa gta san andreas grand theft auto san andreas',
  },
  { padrao: /\b(?:gta|grand theft auto)\b/, alias: 'gta grand theft auto' },
  // Final Fantasy
  {
    padrao: /\b(?:ff|final fantasy)\s*(?:xiii|13)\s*(?:3|iii)\b|\blightning returns\b/,
    alias: 'final fantasy 13 3 xiii 3 ffxiii3 ff13 lightning returns',
  },
  {
    padrao: /\b(?:ff|final fantasy)\s*(?:xiii|13)\b/,
    alias: 'final fantasy 13 xiii ff13 ffxiii',
  },
  {
    padrao: /\b(?:ff|final fantasy)\s*(?:xii|12)\b/,
    alias: 'final fantasy 12 xii ff12 ffxii',
  },
  {
    padrao: /\b(?:ff|final fantasy)\s*(?:vii|7)\b/,
    alias: 'final fantasy 7 vii ff7 ffvii',
  },
  {
    padrao: /\b(?:ff|final fantasy)\s*(?:xiv|14)\b/,
    alias: 'final fantasy 14 xiv ff14 ffxiv',
  },
  {
    padrao: /\b(?:ff|final fantasy)\s*(?:xv|15)\b/,
    alias: 'final fantasy 15 xv ff15 ffxv',
  },
  {
    padrao: /\b(?:ff|final fantasy)\s*(?:xvi|16)\b/,
    alias: 'final fantasy 16 xvi ff16 ffxvi',
  },
  {
    padrao: /\b(?:final fantasy|ff\s*(?:[0-9]{1,2}|vii|viii|ix|x|xii|xiii|xiv|xv|xvi))\b/,
    alias: 'final fantasy ff',
  },
  // Dragon's Dogma
  {
    padrao: /\b(?:dd\s*2|dragons dogma\s*2)\b/,
    alias: 'dragons dogma 2 dd2 dd 2',
  },
  {
    padrao: /\b(?:dragons dogma|dd2)\b/,
    alias: 'dragons dogma dd',
  },
  // Monster Hunter
  {
    padrao: /\b(?:mhw|monster hunter world)\b/,
    alias: 'monster hunter world mhw mh',
  },
  {
    padrao: /\b(?:mhr|mh rise|monster hunter rise)\b/,
    alias: 'monster hunter rise mhr mh',
  },
  {
    padrao: /\b(?:mh wilds|monster hunter wilds)\b/,
    alias: 'monster hunter wilds mh',
  },
  {
    padrao: /\b(?:monster hunter|mh\s*(?:world|rise|wilds|gu|4u|3u))\b/,
    alias: 'monster hunter mh',
  },
  // Baldur's Gate
  {
    padrao: /\b(?:bg\s*3|baldurs gate\s*3)\b/,
    alias: 'baldurs gate 3 bg3 bg 3',
  },
  { padrao: /\bbaldurs gate\b/, alias: 'baldurs gate bg' },
  // The Witcher
  {
    padrao: /\b(?:tw\s*3|(?:the )?witcher\s*3)\b/,
    alias: 'the witcher 3 witcher 3 tw3 tw 3',
  },
  // Fallout
  {
    padrao: /\b(?:fnv|fallout\s*(?:new\s*vegas|newvegas|nv))\b|\bnew\s*vegas\b|\bnewvegas\b/,
    alias: 'fallout new vegas newvegas fnv',
  },
  {
    padrao: /\b(?:fo\s*([1234]|76)|fallout\s*([1234]|76))\b/g,
    alias: (m) => {
      const n = m[1] ?? m[2];
      return `fallout ${n} fo${n}`;
    },
  },
  // The Elder Scrolls
  {
    padrao: /\b(?:tes\s*(?:iv|4)|elder scrolls\s*(?:iv|4)|oblivion)\b/,
    alias: 'the elder scrolls 4 iv oblivion tes4 tesiv',
  },
  {
    padrao: /\b(?:tes\s*(?:v|5)|elder scrolls\s*(?:v|5)|skyrim)\b/,
    alias: 'the elder scrolls 5 v skyrim tes5 tesv',
  },
  {
    padrao: /\b(?:eso|elder scrolls online)\b/,
    alias: 'elder scrolls online eso tes',
  },
  // Dark Souls
  {
    padrao: /\b(?:ds\s*([123])|dark souls\s*([123]))\b/g,
    alias: (m) => {
      const n = m[1] ?? m[2];
      return `dark souls ${n} ds${n} ds ${n}`;
    },
  },
  { padrao: /\bdark souls\b/, alias: 'dark souls ds' },
  // Silent Hill
  {
    padrao: /\b(?:sh\s*([1234])|silent hill\s*([1234]))\b/g,
    alias: (m) => {
      const n = m[1] ?? m[2];
      return `silent hill ${n} sh${n} sh ${n}`;
    },
  },
  { padrao: /\bsilent hill\b/, alias: 'silent hill sh' },
  // Metal Gear Solid
  {
    padrao: /\b(?:mgs\s*(?:v|5)|metal gear solid\s*(?:v|5)|phantom pain)\b/,
    alias: 'metal gear solid 5 v mgs5 mgsv phantom pain',
  },
  { padrao: /\b(?:metal gear|mgs)\b/, alias: 'metal gear solid mgs' },
  // Red Dead Redemption
  {
    padrao: /\b(?:rdr\s*2|red dead redemption\s*2)\b/,
    alias: 'red dead redemption 2 rdr2 rdr 2',
  },
  { padrao: /\b(?:red dead|rdr)\b/, alias: 'red dead redemption rdr' },
  // Cyberpunk 2077
  {
    padrao: /\b(?:cp\s*2077|cyberpunk(?:\s*2077)?)\b/,
    alias: 'cyberpunk 2077 cp2077',
  },
  // Yu-Gi-Oh!
  { padrao: /\b(?:yu\s*gi\s*oh|yugioh|ygo)\b/, alias: 'yu gi oh yugioh ygo' },
  // Watch Dogs
  { padrao: /\b(?:watch\s*dogs|watchdogs)\b/, alias: 'watch dogs watchdogs' },
  // Assassin's Creed
  {
    padrao: /\b(?:ac\s*(?:iv|4)|assassins creed\s*(?:iv|4))\b/,
    alias: 'assassins creed 4 iv ac4 aciv',
  },
  {
    padrao: /\b(?:ac\s*(?:iii|3)|assassins creed\s*(?:iii|3))\b/,
    alias: 'assassins creed 3 iii ac3 aciii',
  },
  { padrao: /\bassassins creed\b/, alias: 'assassins creed ac' },
  // Saints Row
  { padrao: /\bsaints row\s*(?:iv|4)\b/, alias: 'saints row 4 iv' },
  // Far Cry
  {
    padrao: /\b(?:fc\s*([23456])|far cry\s*([23456]))\b/g,
    alias: (m) => {
      const n = m[1] ?? m[2];
      return `far cry ${n} fc${n} fc ${n}`;
    },
  },
  // Midnight Club / Gran Turismo / Borderlands / CS2 / TLOU / DMC / KCD / GoW / COD / Elden Ring
  { padrao: /\b(?:mc\s*3|midnight club\s*3)\b/, alias: 'midnight club 3 mc3' },
  { padrao: /\b(?:gt\s*4|gran turismo\s*4)\b/, alias: 'gran turismo 4 gt4' },
  {
    padrao: /\b(?:bl\s*([1234])|borderlands\s*([1234]))\b/g,
    alias: (m) => {
      const n = m[1] ?? m[2];
      return `borderlands ${n} bl${n} bl ${n}`;
    },
  },
  { padrao: /\b(?:cs\s*2|counter strike\s*2)\b/, alias: 'counter strike 2 cs2 cs 2' },
  { padrao: /\b(?:tlou|the last of us|last of us)\b/, alias: 'the last of us tlou' },
  { padrao: /\b(?:dmc|devil may cry)\b/, alias: 'devil may cry dmc' },
  { padrao: /\b(?:kcd|kingdom come)\b/, alias: 'kingdom come deliverance kcd' },
  { padrao: /\b(?:gow|god of war)\b/, alias: 'god of war gow' },
  { padrao: /\b(?:cod|call of duty)\b/, alias: 'call of duty cod' },
  {
    padrao: /\bshadow of the erdtree\b/,
    alias: 'elden ring shadow of the erdtree',
  },
  // Filipe / Felipe / Vrilipe
  {
    padrao: /\b(?:filipe|felipe)\s*ramos\b|\bvrilipe\b/,
    alias: 'filipe ramos felipe ramos vrilipe',
  },
];

export interface CampoIndexado {
  texto: string;
  tokens: string[];
  tokensSet: ReadonlySet<string>;
  compacto: string;
}

export interface ConsultaBusca {
  frase: string;
  compacta: string;
  termos: string[];
}

/** Normaliza texto para busca: remove acentos, pontos de siglas (S.T.A.L.K.E.R.), apóstrofos e pontuação. */
export function normalizarParaBusca(texto: string): string {
  return normalizarTexto(texto)
    .replace(DOTTED_ACRONYM_RE, (sigla) => sigla.replace(/\./g, ''))
    .replace(APOSTROPHE_RE, '')
    .replace(NON_ALNUM_SPACE_RE, ' ')
    .trim();
}

/** Expande siglas, abreviações e números romanos/arábicos de franquias conhecidas do catálogo. */
export function expandirAliasesBusca(textoNormalizado: string): string {
  if (!textoNormalizado) return '';
  const extras: string[] = [];

  for (const regra of REGRAS_ALIAS) {
    if (regra.padrao.global) {
      for (const match of textoNormalizado.matchAll(regra.padrao)) {
        const valor =
          typeof regra.alias === 'function' ? regra.alias(match) : regra.alias;
        extras.push(valor);
      }
    } else {
      const match = textoNormalizado.match(regra.padrao);
      if (match) {
        const valor =
          typeof regra.alias === 'function' ? regra.alias(match) : regra.alias;
        extras.push(valor);
      }
    }
  }

  if (extras.length === 0) return textoNormalizado;
  return `${textoNormalizado} ${extras.join(' ')}`;
}

export function indexarCampoBusca(textoBruto: string): CampoIndexado {
  const normalizado = normalizarParaBusca(textoBruto);
  const expandido = expandirAliasesBusca(normalizado);
  const tokens = expandido ? expandido.split(' ') : [];
  return {
    texto: expandido,
    tokens,
    tokensSet: new Set(tokens),
    compacto: expandido.replace(/ /g, ''),
  };
}

export function prepararConsultaBusca(busca: string): ConsultaBusca {
  const frase = normalizarParaBusca(busca);
  if (!frase) {
    return { frase: '', compacta: '', termos: [] };
  }
  const brutos = frase.split(' ').filter(Boolean);
  const semStopWords = brutos.filter((t) => !STOP_WORDS_PT.has(t));
  const termos = semStopWords.length > 0 ? semStopWords : brutos;
  return {
    frase,
    compacta: frase.replace(/ /g, ''),
    termos,
  };
}

/** Distância de Damerau-Levenshtein <= 1 (1 troca, inserção, remoção ou transposição adjacente). */
function distanciaEdicaoAte1(a: string, b: string): boolean {
  const lenA = a.length;
  const lenB = b.length;
  if (Math.abs(lenA - lenB) > 1) return false;
  if (a === b) return true;

  let i = 0;
  let j = 0;
  let erros = 0;

  while (i < lenA && j < lenB) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }

    erros++;
    if (erros > 1) return false;

    // Transposição adjacente (ex.: "wictehr" / "follaut")
    if (
      i + 1 < lenA &&
      j + 1 < lenB &&
      a[i] === b[j + 1] &&
      a[i + 1] === b[j]
    ) {
      i += 2;
      j += 2;
      continue;
    }

    if (lenA > lenB) {
      i++;
    } else if (lenB > lenA) {
      j++;
    } else {
      i++;
      j++;
    }
  }

  if (i < lenA || j < lenB) {
    erros++;
  }
  return erros <= 1;
}

function termoCasaNoCampo(termo: string, campo: CampoIndexado): boolean {
  if (campo.tokensSet.has(termo)) return true;

  // Tokens curtos (1-2 chars): exige correspondência inteira ou prefixo seguido de dígito (ex.: "re" -> "re4")
  if (termo.length <= 2) {
    if (termo.length === 2 && /^[a-z]{2}$/.test(termo)) {
      return campo.tokens.some(
        (tok) => tok.startsWith(termo) && tok.length > 2 && /[0-9]/.test(tok[2]),
      );
    }
    return false;
  }

  // Tokens de 3 chars (ex.: "nfs", "gta", "for", "mod"): exige início de palavra
  if (termo.length === 3) {
    return campo.tokens.some((tok) => tok.startsWith(termo));
  }

  // Tokens >= 4 chars: substring normal ou colado sem espaços (ex.: "newvegas", "darksouls")
  if (campo.texto.includes(termo) || campo.compacto.includes(termo)) {
    return true;
  }

  // Pequena tolerância a erro de digitação para palavras >= 5 letras (ex.: "unboud", "wicher", "patologic")
  if (termo.length >= 5) {
    return campo.tokens.some(
      (tok) => tok.length >= 4 && distanciaEdicaoAte1(termo, tok),
    );
  }

  return false;
}

/**
 * Avalia correspondência de uma consulta em um campo indexado.
 * Retorna:
 * - 0: não corresponde
 * - 1: corresponde por termos
 * - 2: corresponde pela frase exata ou forma compacta
 */
export function pontuarCampoBusca(
  consulta: ConsultaBusca,
  campo: CampoIndexado,
): number {
  if (consulta.termos.length === 0) return 1;

  if (
    consulta.compacta.length >= 4 &&
    (campo.texto.includes(consulta.frase) || campo.compacto.includes(consulta.compacta))
  ) {
    return 2;
  }

  for (const termo of consulta.termos) {
    if (!termoCasaNoCampo(termo, campo)) return 0;
  }
  return 1;
}
