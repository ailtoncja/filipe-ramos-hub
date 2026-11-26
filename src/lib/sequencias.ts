import { ehFonteOficial } from '@/data/fontes';
import { expandirAliasesBusca, normalizarParaBusca } from './search';
import type { VideoCatalogo } from './types';

export const MAX_VIDEOS_MARATONA = 50;

const VIDEO_ID_VALIDO_RE = /^[A-Za-z0-9_-]{6,20}$/;

const EPISODIO_PADROES = [
  /#\s*(\d{1,3})\b/i,
  /\b(?:pt|parte|ep|episodio|live)\.?\s*(\d{1,3})\b/i,
];

const SUBPARTE_RE = /\b(\d{1,2})\s*\/\s*(\d{1,2})\b/;
const PARTE_SECUNDARIA_RE = /\b(?:parte|pt)\.?\s*(\d{1,2})\b/i;

export interface InfoEpisodio {
  chaveBase: string;
  episodio: number | null;
  subparte: number | null;
}

/**
 * Extrai número de episódio, sub-parte (ex.: "1/2", "Parte 2") e título-base normalizado
 * para agrupar episódios da mesma Sequência dentro de uma mesma Fonte.
 */
export function extrairInfoEpisodio(titulo: string): InfoEpisodio {
  let episodio: number | null = null;
  let subparte: number | null = null;

  const semAcento = titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const re of EPISODIO_PADROES) {
    const m = semAcento.match(re);
    if (m) {
      episodio = Number.parseInt(m[1], 10);
      break;
    }
  }

  const subMatch = semAcento.match(SUBPARTE_RE);
  if (subMatch) {
    subparte = Number.parseInt(subMatch[1], 10);
  } else if (/#\s*\d+/.test(semAcento)) {
    const ptSec = semAcento.match(PARTE_SECUNDARIA_RE);
    if (ptSec) {
      subparte = Number.parseInt(ptSec[1], 10);
    }
  }

  // Remove numeração de episódio, sub-partes e sufixos comuns de live para gerar chave-base limpa
  const limpo = semAcento
    .replace(/\(\s*#\s*\d{1,3}\s*\)/gi, ' ')
    .replace(/#\s*\d{1,3}\b/gi, ' ')
    .replace(/\b(?:pt|parte|ep|episodio)\.?\s*\d{1,3}\b/gi, ' ')
    .replace(/\b\d{1,2}\s*\/\s*\d{1,2}\b/g, ' ')
    .replace(/\(\s*live\s+do\s+filipe\s+ramos\s*\)/gi, ' ')
    .replace(/\bfinal\b/gi, ' ');

  const chaveBase = normalizarParaBusca(limpo);
  return { chaveBase, episodio, subparte };
}

function compararOrdemEpisodios(
  a: { video: VideoCatalogo; info: InfoEpisodio },
  b: { video: VideoCatalogo; info: InfoEpisodio },
): number {
  const epA = a.info.episodio;
  const epB = b.info.episodio;

  if (epA !== null && epB !== null && epA !== epB) {
    return epA - epB;
  }

  if (epA !== null && epB !== null && epA === epB) {
    const subA = a.info.subparte ?? 0;
    const subB = b.info.subparte ?? 0;
    if (subA !== subB) return subA - subB;
  }

  return a.video.publicadoEm.localeCompare(b.video.publicadoEm);
}

/**
 * Detecta automaticamente a Sequência de episódios de um Vídeo dentro da mesma Fonte.
 * Retorna lista ordenada (`#1 -> #N`) quando houver >= 2 vídeos correspondentes; caso contrário `[]`.
 */
export function encontrarSequenciaDoVideo(
  video: VideoCatalogo,
  todosVideos: VideoCatalogo[],
): VideoCatalogo[] {
  const infoAlvo = extrairInfoEpisodio(video.titulo);
  if (infoAlvo.chaveBase.length < 6) return [];

  const fontesAlvo = new Set(video.fontes);
  const fontePrincipal = video.fontes[0];

  const candidatos: { video: VideoCatalogo; info: InfoEpisodio }[] = [];

  for (const candidato of todosVideos) {
    const mesmaFonte = fontePrincipal
      ? candidato.fontes.includes(fontePrincipal)
      : candidato.fontes.some((f) => fontesAlvo.has(f));
    if (!mesmaFonte) continue;

    const info = extrairInfoEpisodio(candidato.titulo);
    if (info.chaveBase !== infoAlvo.chaveBase) continue;
    candidatos.push({ video: candidato, info });
  }

  if (candidatos.length < 2) return [];

  // Garante que ao menos um vídeo da sequência tenha numeração explícita (evita agrupar avulsos sem relação)
  const temNumerado = candidatos.some(
    (c) => c.info.episodio !== null || c.info.subparte !== null,
  );
  if (!temNumerado) return [];

  return candidatos
    .toSorted(compararOrdemEpisodios)
    .slice(0, MAX_VIDEOS_MARATONA)
    .map((c) => c.video);
}

/** Ordena uma lista de resultados de busca em ordem crescente (episódio/data) para maratonar. */
export function ordenarVideosParaMaratona(
  videos: VideoCatalogo[],
): VideoCatalogo[] {
  const selecionados = videos.slice(0, MAX_VIDEOS_MARATONA);
  return selecionados
    .map((video) => ({ video, info: extrairInfoEpisodio(video.titulo) }))
    .toSorted((a, b) => {
      // Se todos/ambos compartilham a mesma chave-base, ordena por episódio
      if (a.info.chaveBase === b.info.chaveBase) {
        return compararOrdemEpisodios(a, b);
      }
      return a.video.publicadoEm.localeCompare(b.video.publicadoEm);
    })
    .map((c) => c.video);
}

/** Gera URL relativa compartilhável para uma Maratona (`/?maratona=id1,id2&titulo=...`). */
export function montarUrlMaratona(
  videoIds: readonly string[],
  titulo?: string,
): string {
  const limpos = videoIds
    .filter((id) => VIDEO_ID_VALIDO_RE.test(id))
    .slice(0, MAX_VIDEOS_MARATONA);
  if (limpos.length === 0) return '/';
  const params = new URLSearchParams();
  params.set('maratona', limpos.join(','));
  const t = titulo?.trim();
  if (t) params.set('titulo', t.slice(0, 80));
  return `/?${params.toString()}`;
}

/** Interpreta parâmetros de URL de uma Maratona compartilhada com sanitização segura. */
export function parsearMaratonaDaUrl(
  maratonaRaw: string | null | undefined,
  tituloRaw?: string | null,
): { videoIds: string[]; titulo: string } | null {
  if (!maratonaRaw) return null;
  const vistos = new Set<string>();
  const videoIds: string[] = [];
  for (const parte of maratonaRaw.split(',')) {
    const id = parte.trim();
    if (!VIDEO_ID_VALIDO_RE.test(id) || vistos.has(id)) continue;
    vistos.add(id);
    videoIds.push(id);
    if (videoIds.length >= MAX_VIDEOS_MARATONA) break;
  }
  if (videoIds.length === 0) return null;
  const titulo = tituloRaw?.trim().slice(0, 80) || 'Maratona compartilhada';
  return { videoIds, titulo };
}

interface RegraJogo {
  nome: string;
  busca: string;
  padrao: RegExp;
}

/**
 * Regras ordenadas do mais específico para o mais genérico (sobre título normalizado + aliases),
 * garantindo recomendações precisas de vídeos do mesmo Jogo sem misturar títulos distintos.
 */
const REGRAS_JOGO_RELACIONADO: readonly RegraJogo[] = [
  // GTA
  { nome: 'GTA 6', busca: 'GTA 6', padrao: /\bgta\s*(?:6|vi)\b/ },
  { nome: 'GTA San Andreas', busca: 'GTA San Andreas', padrao: /\bsan andreas\b|\bgtasa\b/ },
  { nome: 'GTA IV', busca: 'GTA IV', padrao: /\bgta\s*(?:4|iv)\b|\bgtaiv\b/ },
  { nome: 'GTA V', busca: 'GTA V', padrao: /\bgta\s*(?:5|v)\b|\bgtav\b/ },
  // Need for Speed
  { nome: 'Need for Speed: Unbound', busca: 'Need for Speed Unbound', padrao: /\bunbound\b/ },
  { nome: 'Need for Speed: Most Wanted', busca: 'Need for Speed Most Wanted', padrao: /\bmost wanted\b/ },
  { nome: 'Need for Speed: Underground 2', busca: 'Need for Speed Underground 2', padrao: /\bunderground\s*2\b/ },
  { nome: 'Need for Speed: Heat', busca: 'NFS Heat', padrao: /\bnfs\s*heat\b|\bneed for speed\s*heat\b/ },
  { nome: 'Need for Speed (2015)', busca: 'NFS 2015', padrao: /\bnfs\s*2015\b|\bneed for speed\s*2015\b/ },
  { nome: 'Need for Speed: The Run', busca: 'Need for Speed The Run', padrao: /\bneed for speed\s*the run\b|\bnfs\s*the run\b/ },
  { nome: 'Need for Speed', busca: 'Need for Speed', padrao: /\bneed for speed\b|\bnfs\b/ },
  // Resident Evil
  { nome: 'Resident Evil Requiem (RE9)', busca: 'RE9', padrao: /\bre\s*9\b|\bresident evil\s*9\b|\brequiem\b/ },
  { nome: 'Resident Evil 4 Remake', busca: 'Resident Evil 4 Remake', padrao: /\bresident evil\s*4\s*remake\b|\bre\s*4\s*remake\b/ },
  { nome: 'Resident Evil 4', busca: 'Resident Evil 4', padrao: /\bresident evil\s*4\b|\bre\s*4\b/ },
  { nome: 'Resident Evil 2', busca: 'Resident Evil 2', padrao: /\bresident evil\s*2\b|\bre\s*2\b/ },
  { nome: 'Resident Evil 3', busca: 'Resident Evil 3', padrao: /\bresident evil\s*3\b|\bre\s*3\b/ },
  { nome: 'Resident Evil 5', busca: 'Resident Evil 5', padrao: /\bresident evil\s*5\b|\bre\s*5\b/ },
  { nome: 'Resident Evil 6', busca: 'Resident Evil 6', padrao: /\bresident evil\s*6\b|\bre\s*6\b/ },
  { nome: 'Resident Evil 7', busca: 'Resident Evil 7', padrao: /\bresident evil\s*7\b|\bre\s*7\b/ },
  { nome: 'Resident Evil: Revelations 2', busca: 'Revelations 2', padrao: /\brevelations\s*2\b/ },
  { nome: 'Resident Evil', busca: 'Resident Evil', padrao: /\bresident evil\b/ },
  // Fallout
  { nome: 'Fallout: New Vegas', busca: 'Fallout New Vegas', padrao: /\bnew\s*vegas\b|\bnewvegas\b|\bfnv\b/ },
  { nome: 'Fallout 76', busca: 'Fallout 76', padrao: /\bfallout\s*76\b/ },
  { nome: 'Fallout 4', busca: 'Fallout 4', padrao: /\bfallout\s*4\b/ },
  { nome: 'Fallout 2', busca: 'Fallout 2', padrao: /\bfallout\s*2\b/ },
  { nome: 'Fallout', busca: 'Fallout', padrao: /\bfallout\b/ },
  // S.T.A.L.K.E.R.
  { nome: 'S.T.A.L.K.E.R.: Call of Pripyat', busca: 'Call of Pripyat', padrao: /\bcall of pripyat\b/ },
  { nome: 'S.T.A.L.K.E.R.: Clear Sky', busca: 'Clear Sky', padrao: /\bclear sky\b/ },
  { nome: 'S.T.A.L.K.E.R.: Shadow of Chernobyl', busca: 'Shadow of Chernobyl', padrao: /\bshadow of chernobyl\b/ },
  { nome: 'S.T.A.L.K.E.R.', busca: 'STALKER', padrao: /\bstalker\b/ },
  // Soulsborne / FromSoftware
  { nome: 'Elden Ring', busca: 'Elden Ring', padrao: /\belden ring\b|\bshadow of the erdtree\b/ },
  { nome: 'Bloodborne', busca: 'Bloodborne', padrao: /\bbloodborne\b/ },
  { nome: 'Dark Souls 3', busca: 'Dark Souls 3', padrao: /\bdark souls\s*(?:3|iii)\b|\bds\s*3\b/ },
  { nome: 'Dark Souls 2', busca: 'Dark Souls 2', padrao: /\bdark souls\s*(?:2|ii)\b|\bds\s*2\b/ },
  { nome: 'Dark Souls', busca: 'Dark Souls', padrao: /\bdark souls\b/ },
  // RPGs & Open World
  { nome: 'The Witcher 3', busca: 'The Witcher 3', padrao: /\bwitcher\s*3\b|\btw\s*3\b|\bwitcher\b/ },
  { nome: 'Cyberpunk 2077', busca: 'Cyberpunk 2077', padrao: /\bcyberpunk\b|\bcp2077\b/ },
  { nome: "Baldur's Gate 3", busca: "Baldur's Gate 3", padrao: /\bbaldurs gate\b|\bbg\s*3\b/ },
  { nome: 'Oblivion', busca: 'Oblivion', padrao: /\boblivion\b/ },
  { nome: 'Skyrim', busca: 'Skyrim', padrao: /\bskyrim\b/ },
  { nome: 'Elder Scrolls Online', busca: 'Elder Scrolls Online', padrao: /\belder scrolls online\b|\beso\b/ },
  { nome: 'Red Dead Redemption 2', busca: 'Red Dead', padrao: /\bred dead\b|\brdr\s*2?\b/ },
  { nome: "Dragon's Dogma 2", busca: "Dragon's Dogma 2", padrao: /\bdragons dogma\s*2\b|\bdd\s*2\b/ },
  { nome: "Dragon's Dogma", busca: "Dragon's Dogma", padrao: /\bdragons dogma\b/ },
  { nome: 'Final Fantasy XII', busca: 'Final Fantasy XII', padrao: /\bfinal fantasy\s*(?:12|xii)\b|\bff\s*(?:12|xii)\b/ },
  { nome: 'Final Fantasy XIII', busca: 'Final Fantasy XIII', padrao: /\bfinal fantasy\s*(?:13|xiii)\b|\bff\s*(?:13|xiii)\b|\blightning returns\b/ },
  { nome: 'Monster Hunter: Wilds', busca: 'Monster Hunter Wilds', padrao: /\bmonster hunter\s*wilds\b|\bmh\s*wilds\b/ },
  { nome: 'Monster Hunter: Rise', busca: 'Monster Hunter Rise', padrao: /\bmonster hunter\s*rise\b|\bmh\s*rise\b|\bmhr\b/ },
  { nome: 'Monster Hunter: World', busca: 'Monster Hunter World', padrao: /\bmonster hunter\s*world\b|\bmhw\b/ },
  { nome: 'Monster Hunter', busca: 'Monster Hunter', padrao: /\bmonster hunter\b/ },
  // Ação, Corrida, Terror, Sobrevivência & Clássicos
  { nome: 'Silent Hill 2', busca: 'Silent Hill 2', padrao: /\bsilent hill\s*2\b|\bsh\s*2\b/ },
  { nome: 'Silent Hill', busca: 'Silent Hill', padrao: /\bsilent hill\b/ },
  { nome: 'Pathologic', busca: 'Pathologic', padrao: /\bpathologic\b/ },
  { nome: 'Borderlands 3', busca: 'Borderlands 3', padrao: /\bborderlands\s*3\b|\bbl\s*3\b/ },
  { nome: 'Borderlands 2', busca: 'Borderlands 2', padrao: /\bborderlands\s*2\b|\bbl\s*2\b/ },
  { nome: 'Borderlands', busca: 'Borderlands', padrao: /\bborderlands\b/ },
  { nome: 'The Division 2', busca: 'The Division 2', padrao: /\bthe division\s*2\b|\bdivision\s*2\b/ },
  { nome: 'The Division', busca: 'The Division', padrao: /\bthe division\b/ },
  { nome: 'Metal Gear Solid V', busca: 'Metal Gear Solid V', padrao: /\bmetal gear\b|\bmgsv\b|\bphantom pain\b/ },
  { nome: "Assassin's Creed", busca: "Assassin's Creed", padrao: /\bassassins creed\b|\bblack flag\b/ },
  { nome: 'Far Cry 6', busca: 'Far Cry 6', padrao: /\bfar\s*cry\s*6\b|\bfarcry\s*6\b/ },
  { nome: 'Far Cry', busca: 'Far Cry', padrao: /\bfar\s*cry\b|\bfarcry\b/ },
  { nome: 'Watch Dogs', busca: 'Watch Dogs', padrao: /\bwatch\s*dogs\b|\bwatchdogs\b/ },
  { nome: 'Gran Turismo 4', busca: 'Gran Turismo 4', padrao: /\bgran turismo\s*4\b|\bgt\s*4\b/ },
  { nome: 'Midnight Club 3', busca: 'Midnight Club 3', padrao: /\bmidnight club\b|\bmc\s*3\b/ },
  { nome: 'The Crew', busca: 'The Crew', padrao: /\bthe crew\b/ },
  { nome: 'Sons of the Forest', busca: 'Sons of the Forest', padrao: /\bsons of the forest\b/ },
  { nome: 'Terraria', busca: 'Terraria', padrao: /\bterraria\b/ },
  { nome: 'Dune: Awakening', busca: 'Dune Awakening', padrao: /\bdune\b/ },
  { nome: 'God Hand', busca: 'God Hand', padrao: /\bgod hand\b/ },
  { nome: 'Beat Down', busca: 'Beat Down', padrao: /\bbeat down\b/ },
  { nome: 'Yu-Gi-Oh!', busca: 'Yu-Gi-Oh', padrao: /\byu\s*gi\s*oh\b|\byugioh\b|\bygo\b/ },
  { nome: 'Dishonored', busca: 'Dishonored', padrao: /\bdishonored\b/ },
  { nome: 'BioShock Infinite', busca: 'Bioshock', padrao: /\bbioshock\b/ },
  { nome: 'Dragon Age: Inquisition', busca: 'Dragon Age', padrao: /\bdragon age\b/ },
  { nome: 'Saints Row IV', busca: 'Saints Row', padrao: /\bsaints row\b/ },
  { nome: 'Tomb Raider', busca: 'Tomb Raider', padrao: /\btomb raider\b/ },
  { nome: 'Dead Island', busca: 'Dead Island', padrao: /\bdead island\b/ },
  { nome: 'Ghost Recon Wildlands', busca: 'Wildlands', padrao: /\bwildlands\b/ },
];

const STOP_TOKENS_RELACIONADOS = new Set([
  'filipe',
  'felipe',
  'ramos',
  'vrilipe',
  'live',
  'lives',
  'jogando',
  'zerando',
  'matando',
  'saudade',
  'continuando',
  'parte',
  'final',
  'mods',
  'moddado',
  'gameplay',
  'gameplays',
  'cortes',
  'corte',
  'cortezinho',
  'melhores',
  'momentos',
  'clipes',
  'video',
  'videos',
  'oficial',
  'novo',
  'nova',
  'mais',
  'muito',
  'tudo',
  'como',
  'para',
  'pelo',
  'pela',
  'nessa',
  'nesse',
  'sobre',
  'hoje',
  'agora',
  'aqui',
  'dicas',
  'guia',
  'analise',
  'completo',
  'completa',
  'rejogando',
  'explorando',
  'brincando',
  'voltando',
  'chegou',
  'vamo',
  'bora',
  'historia',
  'episodio',
  'resumo',
  'compilado',
  'primeira',
  'primeiro',
  'jogo',
  'jogos',
  'tico',
  'pouco',
  'ainda',
  'quase',
]);

export interface ResultadoRelacionados {
  nomeJogo: string | null;
  buscaJogo: string | null;
  videos: VideoCatalogo[];
}

export function identificarJogoDoVideo(
  titulo: string,
): { nome: string; busca: string; padrao: RegExp } | null {
  const expandido = expandirAliasesBusca(normalizarParaBusca(titulo));
  if (!expandido) return null;
  for (const regra of REGRAS_JOGO_RELACIONADO) {
    if (regra.padrao.test(expandido)) {
      return regra;
    }
  }
  return null;
}

/**
 * Encontra até `limite` vídeos relacionados ao mesmo Jogo, excluindo o vídeo atual
 * e qualquer episódio já listado na Sequência/Maratona ativa.
 */
export function encontrarVideosRelacionadosAoJogo(
  video: VideoCatalogo,
  todosVideos: VideoCatalogo[],
  idsExcluir: Iterable<string> = [],
  limite = 6,
): ResultadoRelacionados {
  const excluidos = new Set<string>(idsExcluir);
  excluidos.add(video.id);

  const regra = identificarJogoDoVideo(video.titulo);
  const candidatos: { video: VideoCatalogo; score: number }[] = [];

  if (regra) {
    for (const outro of todosVideos) {
      if (excluidos.has(outro.id)) continue;
      const expandido = expandirAliasesBusca(normalizarParaBusca(outro.titulo));
      if (!regra.padrao.test(expandido)) continue;

      const oficialBonus = ehFonteOficial(outro.fontes) ? 2 : 0;
      const outraFonteBonus = outro.fontes[0] !== video.fontes[0] ? 1 : 0;
      candidatos.push({
        video: outro,
        score: oficialBonus + outraFonteBonus,
      });
    }

    const ordenados = candidatos
      .toSorted(
        (a, b) =>
          b.score - a.score ||
          (b.video.visualizacoes ?? 0) - (a.video.visualizacoes ?? 0) ||
          b.video.publicadoEm.localeCompare(a.video.publicadoEm),
      )
      .slice(0, limite)
      .map((c) => c.video);

    return {
      nomeJogo: regra.nome,
      buscaJogo: regra.busca,
      videos: ordenados,
    };
  }

  // Fallback por tokens fortes do título quando o jogo não está na tabela curada
  const tokensAlvo = extrairInfoEpisodio(video.titulo)
    .chaveBase.split(' ')
    .filter((t) => t.length >= 4 && !STOP_TOKENS_RELACIONADOS.has(t));
  if (tokensAlvo.length === 0) {
    return { nomeJogo: null, buscaJogo: null, videos: [] };
  }
  const setAlvo = new Set(tokensAlvo);
  const minimoComum = tokensAlvo.length >= 2 ? 2 : 1;

  for (const outro of todosVideos) {
    if (excluidos.has(outro.id)) continue;
    const tokensOutro = extrairInfoEpisodio(outro.titulo)
      .chaveBase.split(' ')
      .filter((t) => t.length >= 4 && !STOP_TOKENS_RELACIONADOS.has(t));
    let emComum = 0;
    for (const tok of new Set(tokensOutro)) {
      if (setAlvo.has(tok)) emComum++;
    }
    if (emComum < minimoComum) continue;
    const oficialBonus = ehFonteOficial(outro.fontes) ? 1 : 0;
    candidatos.push({ video: outro, score: emComum * 2 + oficialBonus });
  }

  const ordenados = candidatos
    .toSorted(
      (a, b) =>
        b.score - a.score ||
        (b.video.visualizacoes ?? 0) - (a.video.visualizacoes ?? 0) ||
        b.video.publicadoEm.localeCompare(a.video.publicadoEm),
    )
    .slice(0, limite)
    .map((c) => c.video);

  return {
    nomeJogo: null,
    buscaJogo: null,
    videos: ordenados,
  };
}
