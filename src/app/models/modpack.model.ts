export interface ModpackItem {
  label: string;
  url: string;
  descricao?: string;
}

export interface GrupoDeMods {
  titulo: string;
  mods: ModpackItem[];
}

export interface NotaDeMods {
  titulo: string;
  texto?: string;
  passos?: string[];
  dica?: string;
  codigo?: string;
}

export interface FonteDeLives {
  /** Link do YouTube: playlist (youtube.com/playlist?list=...) ou vídeo avulso (watch?v=...). */
  url: string;
  /** Canal dono da playlist/vídeo, para dar o crédito. */
  canal: string;
  /** Nome curto para diferenciar quando o jogo tem mais de uma fonte (ex.: "Nova", "Antiga"). */
  titulo?: string;
}

export interface LivesDoJogo {
  fontes: FonteDeLives[];
  aviso?: string;
}

export interface Modpack {
  jogo: string;
  descricao: string;
  imagemUrl: string;
  itens: ModpackItem[];
  grupos?: GrupoDeMods[];
  notas?: NotaDeMods[];
  lives?: LivesDoJogo;
}
