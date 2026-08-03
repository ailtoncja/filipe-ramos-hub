import { Component, computed, input } from '@angular/core';
import { LiveAvulsa, miniaturaUrl } from '../../models/live-avulsa.model';

@Component({
  selector: 'app-live-avulsa-card',
  imports: [],
  templateUrl: './live-avulsa-card.html',
  styleUrl: './live-avulsa-card.scss',
})
export class LiveAvulsaCard {
  readonly live = input.required<LiveAvulsa>();

  protected readonly thumbnailUrl = computed(() => miniaturaUrl(this.live().youtubeUrl));
}
