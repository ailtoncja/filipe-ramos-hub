import { LivesDoJogo } from '../models/modpack.model';

/**
 * Lives de cada jogo, pelo nome exato do jogo em modpacks.data.ts.
 * Jogo que não aparece aqui não tem live.
 */
export const LIVES: Record<string, LivesDoJogo> = {
  "Baldur's Gate 3": {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLQ1pWjTQJp3alerjbA-IwLeWU061q-dY5', canal: 'Não é o Filipe Ramos' }]
  },
  'Beat Down: Fists of Vengeance': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLPzSfeUQk6eQ', canal: 'Divine Path' }]
  },
  'Bloodborne': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLHwAPnpU6XP8', canal: 'Divine Path' }]
  },
  'Borderlands 3': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLWixkA5OlOssWgD-H6DGrF7q1VqBizpCQ', canal: 'Baú de Lives96' }]
  },
  'Cyberpunk 2077': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLQ1pWjTQJp3ad8YsS9Y_wQ2j-nJ7S55mH', canal: 'Não é o Filipe Ramos' }]
  },
  'Dark Souls': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLELteBVDjmY8', canal: 'Divine Path' }]
  },
  "Dragon's Dogma 2": {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLWixkA5OlOss3UnABEcl6WqVcRU_CocSR', canal: 'Baú de Lives96' }]
  },
  'Fallout 2': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLQ1pWjTQJp3ZsRnm-3VssX0Jj7sLgtIGD', canal: 'Não é o Filipe Ramos' }]
  },
  'Fallout 76': {
    fontes: [
      { url: 'https://www.youtube.com/playlist?list=PLWixkA5OlOsv7KbWY4DqNd8TeK2MDTSyD', canal: 'Baú de Lives96' },
      { url: 'https://www.youtube.com/playlist?list=PLQ1pWjTQJp3YqLeB5twAr5dVAqRVUWrg8', canal: 'Não é o Filipe Ramos' }
    ],
    aviso: 'Tem mais lives avulsas se pesquisar no YouTube.'
  },
  'Fallout: New Vegas': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLYBVZGAaMB4I', canal: 'Filipe Ramos - Baú de Lives' }]
  },
  'Final Fantasy XII': {
    fontes: [
      { url: 'https://www.youtube.com/playlist?list=PLW0ps8BYf-tY', canal: 'Divine Path', titulo: 'Nova' },
      { url: 'https://www.youtube.com/playlist?list=PLQ1pWjTQJp3YVIqiE5nuJRmjlZcJWk2OY', canal: 'Não é o Filipe Ramos', titulo: 'Antiga' }
    ]
  },
  'God Hand': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLaNQfxZAgp60', canal: 'Divine Path' }]
  },
  'Gran Turismo 4': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLbd6ZdEnKHEs', canal: 'Não é o Filipe Ramos' }]
  },
  'GTA IV': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLYFAWGW3PLEY', canal: 'Filipe Ramos - Baú de Lives' }]
  },
  'GTA: San Andreas': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLQ1pWjTQJp3b4k6vqpTjrmQ8iZL0vQ_-i', canal: 'Não é o Filipe Ramos' }]
  },
  'Midnight Club 3: DUB Edition Remix': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLE94u5m-YVsU', canal: 'Divine Path' }]
  },
  'Monster Hunter: World': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLHB19CQ5PUz8', canal: 'Divine Path' }]
  },
  'Need for Speed (2015)': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLHD5BhEA4vds', canal: 'Divine Path' }]
  },
  'Need for Speed: Most Wanted': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLR2b8Khskp2E', canal: 'Filipe Ramos - Baú de Lives' }]
  },
  'Need for Speed: Underground 2': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLSUPzNgarACQ', canal: 'Divine Path' }]
  },
  'Resident Evil 4 (Clássico)': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=EN2fTXiaRXA&t=5764s', canal: 'Filipe Ramos - Baú de Lives' }]
  },
  'Resident Evil 4 Remake': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PL4S3PiAFlYxMoZaMuKdafzMb-E_NxR1_l', canal: 'Filipe' }]
  },
  'Resident Evil 5': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=_OZhZAhTT58', canal: 'aeithales' }]
  },
  'Resident Evil Requiem': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLdMo3rSXP0LE', canal: 'Divine Path' }]
  },
  'Resident Evil: Revelations 2': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLFhBfWdb35XQ', canal: 'Divine Path' }]
  },
  'S.T.A.L.K.E.R.: Shadow of Chernobyl': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLGwL5O8DUECI', canal: 'Divine Path' }]
  },
  'S.T.A.L.K.E.R.: Call of Pripyat': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLCB7MP-J3ZwI', canal: 'Divine Path' }]
  },
  'S.T.A.L.K.E.R.: Clear Sky': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLTwvlAeGHOnQ', canal: 'Divine Path' }]
  },
  'Sons of the Forest': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLQ1pWjTQJp3ZAGJ1dUm2r2RPmzPLSHlMP', canal: 'Não é o Filipe Ramos' }]
  },
  'Terraria': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLP7wvB2Gk3mY', canal: 'Divine Path' }]
  },
  'The Elder Scrolls IV: Oblivion Remastered': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLMH8O4HxQDTI', canal: 'Divine Path' }]
  },
  'Yu-Gi-Oh! Capsule Monster Coliseum': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=qgwud537s9s', canal: 'Não é o Filipe Ramos' }]
  },
  'Yu-Gi-Oh! Forbidden Memories': {
    fontes: [{ url: 'https://www.youtube.com/watch?v=pLu3F-Pco0E', canal: 'Baú de Lives96' }]
  },
  'Yu-Gi-Oh! GX Tag Force': {
    fontes: [{ url: 'https://www.youtube.com/playlist?list=PLYk01mbn1WWA', canal: 'Divine Path' }]
  }
};
