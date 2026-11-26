import type { VideoCatalogo } from '@/lib/types';

/**
 * Transmissões avulsas preservadas manualmente pela comunidade que não pertencem
 * a uma das 13 fontes monitoradas automaticamente.
 */
export const EXTRAS_CATALOGO: VideoCatalogo[] = [
  {
    id: '_QC05QckzLs',
    titulo: 'Far Cry 2 - Matando a saudade',
    descricao: 'Live avulsa preservada pela comunidade no canal jose machado.',
    canal: 'jose machado',
    fontes: ['comunidade-avulsa'],
    publicadoEm: '2021-01-01T00:00:00Z',
    miniatura: 'https://i.ytimg.com/vi/_QC05QckzLs/mqdefault.jpg',
  },
];
