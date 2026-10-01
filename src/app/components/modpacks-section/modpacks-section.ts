import {
  Component,
  ElementRef,
  computed,
  inject,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LIVES } from '../../data/lives.data';
import { MODPACKS } from '../../data/modpacks.data';
import { FonteDeLives, GrupoDeMods, Modpack, ModpackItem } from '../../models/modpack.model';

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
  return (
    TIPOS_DE_ITEM.find((tipo) => tipo.padrao?.test(label)) ??
    TIPOS_DE_ITEM[TIPOS_DE_ITEM.length - 1]
  );
}

/** Filtro extra que não depende dos itens: jogos com playlist de lives. Fica em primeiro na barra. */
const FILTRO_LIVES: TipoItem = { chave: 'lives', label: 'Com lives', icone: '🔴', padrao: null };

function tiposDoModpack(modpack: Modpack): Set<string> {
  const tipos = new Set(modpack.itens.map((item) => tipoDoItem(item.label).chave));
  if (modpack.grupos?.length) {
    tipos.add('pack');
  }
  if (modpack.lives) {
    tipos.add(FILTRO_LIVES.chave);
  }
  return tipos;
}

type Aba = 'mods' | 'lives';

/** Link de playlist vira o player da playlist; link de vídeo avulso vira o player do vídeo. */
function urlDoPlayerDeLive(url: string): string | null {
  try {
    const lista = new URL(url).searchParams.get('list');
    if (lista) {
      return `https://www.youtube-nocookie.com/embed/videoseries?list=${lista}`;
    }
  } catch {
    return null;
  }
  return urlDoPlayerYoutube(url);
}

const PADRAO_DESATUALIZADO = /desatualizad|vers[aã]o antiga|antigo/i;

/** Converte um link do YouTube no endereço do player embutido, mantendo o tempo inicial (&t=). */
function urlDoPlayerYoutube(url: string): string | null {
  let link: URL;
  try {
    link = new URL(url);
  } catch {
    return null;
  }
  const host = link.hostname.replace(/^www\./, '');
  const id =
    host === 'youtu.be'
      ? link.pathname.slice(1)
      : host === 'youtube.com'
        ? link.searchParams.get('v')
        : null;
  if (!id) {
    return null;
  }
  const inicio = parseInt(link.searchParams.get('t') ?? '', 10);
  return `https://www.youtube-nocookie.com/embed/${id}` + (inicio > 0 ? `?start=${inicio}` : '');
}

const TODOS_OS_MODPACKS: Modpack[] = MODPACKS.map((modpack) => ({
  ...modpack,
  lives: LIVES[modpack.jogo] ?? modpack.lives,
})).sort((a, b) => a.jogo.localeCompare(b.jogo, 'pt-BR'));

if (isDevMode()) {
  // Avisa se algum nome em lives.data.ts não bate com um jogo (a live ficaria escondida).
  const jogos = new Set(MODPACKS.map((modpack) => modpack.jogo));
  for (const jogo of Object.keys(LIVES).filter((jogo) => !jogos.has(jogo))) {
    console.warn(`lives.data.ts: "${jogo}" não corresponde a nenhum jogo em modpacks.data.ts`);
  }
}

@Component({
  selector: 'app-modpacks-section',
  imports: [],
  templateUrl: './modpacks-section.html',
  styleUrl: './modpacks-section.scss',
})
export class ModpacksSection {
  protected readonly filtrosDisponiveis = [FILTRO_LIVES, ...TIPOS_DE_ITEM];
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
      const tipos = tiposDoModpack(modpack);
      return [...filtros].some((chave) => tipos.has(chave));
    });
  });

  protected readonly modpackAberto = signal<Modpack | null>(null);
  private readonly dialogoMods = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoMods');
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Conteúdo da janela aberta: vídeos do YouTube viram player e o resto vira lista.
   * Fica num computed para as URLs do player não serem recriadas (o que recarregaria o vídeo).
   */
  protected readonly conteudoAberto = computed(() => {
    const modpack = this.modpackAberto();
    if (!modpack) {
      return null;
    }
    const videos: { label: string; player: SafeResourceUrl }[] = [];
    const links: ModpackItem[] = [];
    for (const item of modpack.itens) {
      const player = urlDoPlayerYoutube(item.url);
      if (player) {
        videos.push({
          label: item.label,
          player: this.sanitizer.bypassSecurityTrustResourceUrl(player),
        });
      } else {
        links.push(item);
      }
    }
    const lives: { fonte: FonteDeLives; player: SafeResourceUrl }[] = [];
    for (const fonte of modpack.lives?.fontes ?? []) {
      const player = urlDoPlayerDeLive(fonte.url);
      if (player) {
        lives.push({ fonte, player: this.sanitizer.bypassSecurityTrustResourceUrl(player) });
      }
    }
    return { modpack, videos, links, lives };
  });

  protected readonly abaAtiva = signal<Aba>('mods');
  /** Qual fonte de lives está no player, quando o jogo tem mais de uma. */
  protected readonly liveSelecionada = signal(0);

  protected readonly iconeParaItem = (label: string) => tipoDoItem(label).icone;
  protected readonly ehDesatualizado = (label: string) => PADRAO_DESATUALIZADO.test(label);
  protected readonly totalDeMods = (modpack: Modpack) =>
    modpack.grupos?.reduce((total, grupo) => total + grupo.mods.length, 0) ?? 0;
  protected readonly textoDoBotao = (modpack: Modpack) =>
    modpack.grupos?.length
      ? `Ver os ${this.totalDeMods(modpack)} mods`
      : `Ver tudo (${modpack.itens.length} ${modpack.itens.length === 1 ? 'item' : 'itens'})`;
  protected readonly temDescricoes = (grupo: GrupoDeMods) =>
    grupo.mods.some((mod) => mod.descricao);

  protected readonly codigoCopiado = signal<string | null>(null);

  protected async copiar(codigo: string): Promise<void> {
    await navigator.clipboard.writeText(codigo);
    this.codigoCopiado.set(codigo);
    setTimeout(() => this.codigoCopiado.set(null), 2000);
  }

  protected abrirMods(modpack: Modpack, aba: Aba = 'mods'): void {
    this.abaAtiva.set(aba);
    this.liveSelecionada.set(0);
    this.modpackAberto.set(modpack);
    this.dialogoMods().nativeElement.showModal();
  }

  protected fecharMods(): void {
    this.dialogoMods().nativeElement.close();
  }

  protected onDialogoFechado(): void {
    // O evento "close" chega depois do fechamento; se outra janela já foi aberta nesse meio-tempo, não limpa.
    if (!this.dialogoMods().nativeElement.open) {
      this.modpackAberto.set(null);
    }
  }

  protected onCliqueNoDialogo(event: MouseEvent): void {
    // Clique no fundo escuro (fora do conteúdo) fecha a janela.
    if (event.target === this.dialogoMods().nativeElement) {
      this.fecharMods();
    }
  }

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
