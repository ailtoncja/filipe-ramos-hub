import { LivesDoJogo } from '../models/modpack.model';

/**
 * Vídeos do canal oficial (@FilipeRamos96) de cada jogo, pelo nome exato do jogo em modpacks.data.ts.
 * Playlists começam no primeiro vídeo (watch?v=...&list=...).
 */
export const VIDEOS_OFICIAIS: Record<string, LivesDoJogo> = {
  'Borderlands 2': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=j6_AVV3cD7w&list=PL39F8uGxjECr9EpaLPBKq03cb45VvVUtO', canal: 'Filipe Ramos' }]
  },
  'Borderlands 3': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=56l4uhWvFJI&list=PL39F8uGxjECrP88UpZvoFIOa2Agx7fsm8', canal: 'Filipe Ramos' }]
  },
  'Dark Souls': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=GAPAowgX_Sg&list=PL93114C5DB258A426', canal: 'Filipe Ramos' }]
  },
  "Dragon's Dogma": {
    fontes: [{ url: 'https://www.youtube.com/watch?v=Nb8CEUuTtX8&list=PL39F8uGxjECq4YCoq1VssyI-O5ViCd1hm', canal: 'Filipe Ramos' }]
  },
  'Fallout 76': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=tYDCd_njiFw', canal: 'Filipe Ramos', titulo: 'Análise: Tudo que Você Precisa Saber (desatualizada)' }]
  },
  'Final Fantasy XII': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=231i5p9b1z8&list=PL39F8uGxjECoHJlbR68j6yENUHXmxm9Yh', canal: 'Filipe Ramos' }]
  },
  'GTA IV': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=amZG_jjx5zs&list=PL39F8uGxjECrgUq-myDNuWQqVtyi7TVhw', canal: 'Filipe Ramos' }]
  },
  'GTA: San Andreas': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=CbYM_kua-Os', canal: 'Filipe Ramos', titulo: 'Matando a Saudade #7' }]
  },
  'Lightning Returns: Final Fantasy XIII': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=rnKdZwck3j0&list=PL39F8uGxjECqrlh2iDCZOs8Z2eVIyV3oH', canal: 'Filipe Ramos' }]
  },
  'Monster Hunter: World': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=k5yYJLAXsYI&list=PL39F8uGxjECq5H5ryvbALCRtwPVu0vLf4', canal: 'Filipe Ramos' }]
  },
  'Need for Speed: Most Wanted': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=Pvjr5qnz83Q', canal: 'Filipe Ramos', titulo: 'Matando a Saudade #2' }]
  },
  'Need for Speed: Underground 2': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=w0NNF2wcmGw', canal: 'Filipe Ramos', titulo: 'Matando a Saudade #6' }]
  },
  'Resident Evil: Revelations 2': {
    fontes: [
      { url: 'https://www.youtube.com/watch?v=g5ea2YRR9sM', canal: 'Filipe Ramos', titulo: 'Jogando o Modo Raid' },
      { url: 'https://www.youtube.com/watch?v=ChRencMSgVc', canal: 'Filipe Ramos', titulo: 'Análise' }
    ]
  },
  'Skyrim': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=cut88UmRXYE&list=PL0871A30A2FE15C6C', canal: 'Filipe Ramos' }]
  },
  'The Witcher 3: Wild Hunt': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PL39F8uGxjECoftz__IXfdYU0zbBtvZaEc', canal: 'Filipe Ramos' }]
  },
  'Watch Dogs': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=0zyxrYs6fx4&list=PL39F8uGxjECrYT3GaiL-hl3m7KBh8tA3Q', canal: 'Filipe Ramos' }]
  },
  'Yu-Gi-Oh! Forbidden Memories': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=xUgssQ7o8NI', canal: 'Filipe Ramos', titulo: 'Matando a Saudade #8' }]
  }
};
