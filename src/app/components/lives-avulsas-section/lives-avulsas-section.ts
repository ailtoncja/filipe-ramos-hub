import { Component } from '@angular/core';
import { LIVES_AVULSAS } from '../../data/lives-avulsas.data';
import { LiveAvulsaCard } from '../live-avulsa-card/live-avulsa-card';

const porTitulo = (a: { titulo: string }, b: { titulo: string }) => a.titulo.localeCompare(b.titulo, 'pt-BR');

@Component({
  selector: 'app-lives-avulsas-section',
  imports: [LiveAvulsaCard],
  templateUrl: './lives-avulsas-section.html',
  styleUrl: './lives-avulsas-section.scss',
})
export class LivesAvulsasSection {
  protected readonly livesAvulsas = [...LIVES_AVULSAS].sort(porTitulo);
}
