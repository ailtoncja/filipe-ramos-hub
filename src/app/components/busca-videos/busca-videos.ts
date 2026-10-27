import { DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { CANAIS } from '../../data/canais.data';

interface Video {
  id: string;
  titulo: string;
  descricao: string;
  canal: string;
  fontes: string[];
  publicadoEm: string;
  miniatura: string;
  visualizacoes?: number;
}
interface Catalogo { atualizadoEm: string | null; videos: Video[]; }
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

@Component({
  selector: 'app-busca-videos',
  imports: [DatePipe],
  templateUrl: './busca-videos.html',
})
export class BuscaVideos {
  protected readonly formatarVisualizacoes = (valor: number) => new Intl.NumberFormat('pt-BR').format(valor);
  protected readonly canais = [...CANAIS].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  protected readonly busca = signal('');
  protected readonly canal = signal('');
  protected readonly ordem = signal('recentes');
  protected readonly limite = signal(24);
  protected readonly catalogo = signal<Catalogo | null>(null);
  protected readonly erro = signal(false);
  protected readonly resultados = computed(() => {
    const termos = normalizar(this.busca().trim()).split(/\s+/).filter(Boolean);
    const canal = this.canal();
    return (this.catalogo()?.videos ?? []).filter((video) => {
      const texto = normalizar(`${video.titulo} ${video.descricao}`);
      return termos.every((termo) => texto.includes(termo)) && (!canal || video.fontes.includes(canal));
    }).sort((a, b) => {
      if (this.ordem() === 'vistos') {
        return (b.visualizacoes ?? -1) - (a.visualizacoes ?? -1) || b.publicadoEm.localeCompare(a.publicadoEm);
      }
      return this.ordem() === 'antigos'
        ? a.publicadoEm.localeCompare(b.publicadoEm)
        : b.publicadoEm.localeCompare(a.publicadoEm);
    });
  });
  protected readonly visiveis = computed(() => this.resultados().slice(0, this.limite()));

  constructor() {
    fetch('data/videos.json').then((response) => {
      if (!response.ok) throw new Error('Catálogo indisponível');
      return response.json() as Promise<Catalogo>;
    }).then((catalogo) => this.catalogo.set(catalogo)).catch(() => this.erro.set(true));
  }
  protected alterarBusca(event: Event): void { this.busca.set((event.target as HTMLInputElement).value); this.limite.set(24); }
  protected alterarCanal(event: Event): void { this.canal.set((event.target as HTMLSelectElement).value); this.limite.set(24); }
  protected alterarOrdem(event: Event): void { this.ordem.set((event.target as HTMLSelectElement).value); this.limite.set(24); }
}
