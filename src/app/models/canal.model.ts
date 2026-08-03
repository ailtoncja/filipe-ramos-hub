export type CategoriaCanal = 'oficial' | 'nao-oficial';

export interface Canal {
  nome: string;
  descricao: string;
  categoria: CategoriaCanal;
  avatarUrl: string;
  youtubeUrl: string;
}
