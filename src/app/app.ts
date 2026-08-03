import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { StatsBar } from './components/stats-bar/stats-bar';
import { CanaisSection } from './components/canais-section/canais-section';
import { ModpacksSection } from './components/modpacks-section/modpacks-section';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [Header, StatsBar, CanaisSection, ModpacksSection, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
