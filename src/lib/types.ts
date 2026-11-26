export type CategoriaFonte = 'oficial' | 'nao-oficial';

export interface Fonte {
  nome: string;
  nomeExibicao: string;
  descricao: string;
  categoria: CategoriaFonte;
  avatarUrl: string;
  youtubeUrl: string;
  channelId?: string;
  playlistId?: string;
  playlistIds?: string[];
}

export interface VideoCatalogo {
  id: string;
  titulo: string;
  descricao: string;
  canal: string;
  fontes: string[];
  publicadoEm: string;
  miniatura: string;
  visualizacoes?: number;
}

export interface PlaylistCatalogo extends VideoCatalogo {
  quantidadeVideos: number;
}

export interface Catalogo {
  atualizadoEm: string | null;
  videos: VideoCatalogo[];
  playlists: PlaylistCatalogo[];
}

export type TipoCatalogo = 'videos' | 'playlists';
export type OrdemCatalogo = 'recentes' | 'antigos' | 'vistos';
export type FiltroCategoriaFonte = 'todos' | 'oficiais' | 'nao-oficiais';

export interface StatusTransmissaoTwitch {
  aoVivo: boolean;
  tempoAoVivo: string | null;
  jogo: string | null;
  titulo: string | null;
  canalUrl: string;
  carePackageSlug: string | null;
  carePackageNome: string | null;
  atualizadoEm: string;
}

export interface ItemRecenteLocal {
  id: string;
  tipo: TipoCatalogo;
  abertoEm: number;
}

export interface MaratonaLocal {
  id: string;
  titulo: string;
  videoIds: string[];
  criadaEm: number;
}

export interface ProgressoVideoLocal {
  tempo: number;
  duracao: number;
  atualizadoEm: number;
}

export interface RecursoCarePackage {
  label: string;
  url: string;
  descricao?: string;
}

export interface GrupoDeMods {
  titulo: string;
  mods: RecursoCarePackage[];
}

export interface NotaDeInstalacao {
  titulo: string;
  texto?: string;
  passos?: string[];
  dica?: string;
  codigo?: string;
}

export interface MidiaCurada {
  url: string;
  canal: string;
  titulo?: string;
}

export interface ColecaoMidia {
  fontes: MidiaCurada[];
  aviso?: string;
}

export interface CarePackageBase {
  jogo: string;
  descricao: string;
  imagemUrl: string;
  itens: RecursoCarePackage[];
  grupos?: GrupoDeMods[];
  notas?: NotaDeInstalacao[];
}

export interface CarePackage extends CarePackageBase {
  slug: string;
  lives?: ColecaoMidia;
  videosOficiais?: ColecaoMidia;
}

export type TipoRecursoChave =
  | 'lives'
  | 'pack'
  | 'mapa'
  | 'projeto'
  | 'retextura'
  | 'infografico'
  | 'cheat'
  | 'video'
  | 'tabela'
  | 'texto';
