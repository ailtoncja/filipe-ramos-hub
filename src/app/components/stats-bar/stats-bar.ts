import { Component } from '@angular/core';
import { CANAIS } from '../../data/canais.data';
import { LIVES_AVULSAS } from '../../data/lives-avulsas.data';
import { MODPACKS } from '../../data/modpacks.data';

@Component({
  selector: 'app-stats-bar',
  imports: [],
  templateUrl: './stats-bar.html',
  styleUrl: './stats-bar.scss',
})
export class StatsBar {
  protected readonly stats = [
    { valor: CANAIS.filter((c) => c.categoria === 'oficial').length, rotulo: 'Canais oficiais' },
    { valor: CANAIS.filter((c) => c.categoria === 'nao-oficial').length, rotulo: 'Canais não oficiais' },
    { valor: LIVES_AVULSAS.length, rotulo: 'Lives avulsas' },
    { valor: MODPACKS.length, rotulo: 'Care Packages' },
  ];
}
