export interface ModpackItem {
  label: string;
  url: string;
}

export interface Modpack {
  jogo: string;
  descricao: string;
  imagemUrl: string;
  itens: ModpackItem[];
  configuracao?: string;
}
