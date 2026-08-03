import { Component, computed, input } from '@angular/core';
import { Canal } from '../../models/canal.model';

const BADGE_OFICIAL = 'bg-violet-500 text-white';
const BADGE_NAO_OFICIAL = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';

@Component({
  selector: 'app-canal-card',
  imports: [],
  templateUrl: './canal-card.html',
  styleUrl: './canal-card.scss',
})
export class CanalCard {
  readonly canal = input.required<Canal>();

  protected readonly badgeClasses = computed(() =>
    this.canal().categoria === 'oficial' ? BADGE_OFICIAL : BADGE_NAO_OFICIAL
  );
  protected readonly badgeLabel = computed(() => (this.canal().categoria === 'oficial' ? 'Oficial' : 'Não Oficial'));
}
