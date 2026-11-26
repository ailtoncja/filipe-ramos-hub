export interface JogoDestaque {
  label: string;
  busca: string;
}

/** 12 Jogos mais procurados no Hub (com e sem Care Package) para atalho de 1 clique na busca. */
export const JOGOS_DESTAQUE: readonly JogoDestaque[] = [
  { label: 'GTA 6', busca: 'GTA 6' },
  { label: 'Fallout: New Vegas', busca: 'Fallout New Vegas' },
  { label: 'The Witcher 3', busca: 'The Witcher 3' },
  { label: 'Need for Speed', busca: 'Need for Speed' },
  { label: 'Resident Evil', busca: 'Resident Evil' },
  { label: 'Cyberpunk 2077', busca: 'Cyberpunk 2077' },
  { label: 'Elden Ring', busca: 'Elden Ring' },
  { label: 'Dark Souls', busca: 'Dark Souls' },
  { label: 'S.T.A.L.K.E.R.', busca: 'STALKER' },
  { label: "Baldur's Gate 3", busca: "Baldur's Gate 3" },
  { label: 'GTA IV', busca: 'GTA IV' },
  { label: 'Red Dead Redemption 2', busca: 'Red Dead' },
];
