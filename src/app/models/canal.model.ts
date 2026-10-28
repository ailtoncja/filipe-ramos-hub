export type CategoriaCanal = 'oficial' | 'nao-oficial';

export interface Canal {
  nome: string;
  nomeExibicao: string;
  descricao: string;
  categoria: CategoriaCanal;
  avatarUrl: string;
  youtubeUrl: string;
}
