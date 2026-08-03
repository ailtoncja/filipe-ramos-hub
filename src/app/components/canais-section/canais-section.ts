import { Component } from '@angular/core';
import { CANAIS } from '../../data/canais.data';
import { CanalCard } from '../canal-card/canal-card';

const porNome = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome, 'pt-BR');

@Component({
  selector: 'app-canais-section',
  imports: [CanalCard],
  templateUrl: './canais-section.html',
  styleUrl: './canais-section.scss',
})
export class CanaisSection {
  protected readonly canaisOficiais = CANAIS.filter((canal) => canal.categoria === 'oficial').sort(porNome);
  protected readonly canaisNaoOficiais = CANAIS.filter((canal) => canal.categoria === 'nao-oficial').sort(porNome);
}
