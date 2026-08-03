import { Component, computed, signal } from '@angular/core';
import { MODPACKS } from '../../data/modpacks.data';
import { ModpackItem } from '../../models/modpack.model';

interface TipoItem {
  chave: string;
  label: string;
  icone: string;
  padrao: RegExp | null;
}

const TIPOS_DE_ITEM: TipoItem[] = [
  { chave: 'mapa', label: 'Mapas', icone: '🗺️', padrao: /mapa/i },
  { chave: 'projeto', label: 'Projetos', icone: '🎨', padrao: /\.psd|projeto/i },
  { chave: 'retextura', label: 'Retexturas', icone: '🖼️', padrao: /retextura/i },
  { chave: 'infografico', label: 'Infográficos', icone: '📊', padrao: /infográfico/i },
  { chave: 'cheat', label: 'Cheats', icone: '⚡', padrao: /cheat/i },
  { chave: 'video', label: 'Vídeos/Tutoriais', icone: '🎬', padrao: /vídeo|tutorial/i },
  { chave: 'tabela', label: 'Tabelas', icone: '⚔️', padrao: /tabela|arma/i },
  { chave: 'texto', label: 'Textos', icone: '📄', padrao: /\.txt/i },
  { chave: 'pack', label: 'Packs/Mods', icone: '📦', padrao: null },
];

function tipoDoItem(label: string): TipoItem {
  return TIPOS_DE_ITEM.find((tipo) => tipo.padrao?.test(label)) ?? TIPOS_DE_ITEM[TIPOS_DE_ITEM.length - 1];
}

function tiposDoModpack(itens: ModpackItem[]): Set<string> {
  return new Set(itens.map((item) => tipoDoItem(item.label).chave));
}

const PADRAO_DESATUALIZADO = /desatualizad|vers[aã]o antiga|antigo/i;

const TODOS_OS_MODPACKS = [...MODPACKS].sort((a, b) => a.jogo.localeCompare(b.jogo, 'pt-BR'));

@Component({
  selector: 'app-modpacks-section',
  imports: [],
  templateUrl: './modpacks-section.html',
  styleUrl: './modpacks-section.scss',
})
export class ModpacksSection {
  protected readonly filtrosDisponiveis = TIPOS_DE_ITEM;
  protected readonly busca = signal('');
  protected readonly filtrosAtivos = signal<ReadonlySet<string>>(new Set());

  protected readonly modpacks = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const filtros = this.filtrosAtivos();

    return TODOS_OS_MODPACKS.filter((modpack) => {
      const combinaBusca = !termo || modpack.jogo.toLowerCase().includes(termo);
      if (!combinaBusca) {
        return false;
      }
      if (filtros.size === 0) {
        return true;
      }
      const tipos = tiposDoModpack(modpack.itens);
      return [...filtros].some((chave) => tipos.has(chave));
    });
  });

  protected readonly iconeParaItem = (label: string) => tipoDoItem(label).icone;
  protected readonly ehDesatualizado = (label: string) => PADRAO_DESATUALIZADO.test(label);

  protected onBuscaChange(event: Event): void {
    this.busca.set((event.target as HTMLInputElement).value);
  }

  protected toggleFiltro(chave: string): void {
    this.filtrosAtivos.update((atuais) => {
      const novos = new Set(atuais);
      novos.has(chave) ? novos.delete(chave) : novos.add(chave);
      return novos;
    });
  }

  protected limparFiltros(): void {
    this.filtrosAtivos.set(new Set());
  }
}
