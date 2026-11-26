'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  alternarAssistido,
  alternarNaFila,
  alternarSalvo,
  BIBLIOTECA_STORAGE_KEY,
  BIBLIOTECA_VAZIA,
  definirFila,
  type EstadoBibliotecaLocal,
  limparRecentesBiblioteca,
  moverNaFila,
  parsearBibliotecaLocal,
  registrarRecente,
  removerMaratonaLocal,
  salvarMaratonaLocal,
} from '@/lib/biblioteca-local';
import type { TipoCatalogo } from '@/lib/types';

function persistir(estado: EstadoBibliotecaLocal) {
  try {
    window.localStorage.setItem(BIBLIOTECA_STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // storage bloqueado ou cheio
  }
}

export function useBibliotecaLocal() {
  const [estado, setEstado] = useState<EstadoBibliotecaLocal>(BIBLIOTECA_VAZIA);

  useEffect(() => {
    try {
      const inicial = parsearBibliotecaLocal(
        window.localStorage.getItem(BIBLIOTECA_STORAGE_KEY),
      );
      setEstado(inicial);
    } catch {
      // storage indisponível
    }

    function aoMudarStorage(event: StorageEvent) {
      if (event.key !== BIBLIOTECA_STORAGE_KEY) return;
      setEstado(parsearBibliotecaLocal(event.newValue));
    }

    window.addEventListener('storage', aoMudarStorage);
    return () => window.removeEventListener('storage', aoMudarStorage);
  }, []);

  const salvosVideosSet = useMemo(
    () => new Set(estado.salvosVideos),
    [estado.salvosVideos],
  );
  const salvosPlaylistsSet = useMemo(
    () => new Set(estado.salvosPlaylists),
    [estado.salvosPlaylists],
  );
  const assistidosVideosSet = useMemo(
    () => new Set(estado.assistidosVideos),
    [estado.assistidosVideos],
  );
  const filaAtualSet = useMemo(
    () => new Set(estado.filaAtual),
    [estado.filaAtual],
  );

  const toggleSalvo = useCallback((id: string, tipo: TipoCatalogo) => {
    setEstado((atual) => {
      const proximo = alternarSalvo(atual, id, tipo);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const toggleAssistido = useCallback((videoId: string) => {
    setEstado((atual) => {
      const proximo = alternarAssistido(atual, videoId);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const registrarAbertura = useCallback((id: string, tipo: TipoCatalogo) => {
    setEstado((atual) => {
      const proximo = registrarRecente(atual, id, tipo);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const limparHistoricoRecente = useCallback(() => {
    setEstado((atual) => {
      const proximo = limparRecentesBiblioteca(atual);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const toggleNaFila = useCallback((videoId: string) => {
    setEstado((atual) => {
      const proximo = alternarNaFila(atual, videoId);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const carregarNaFila = useCallback((videoIds: readonly string[]) => {
    setEstado((atual) => {
      const proximo = definirFila(atual, videoIds);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const moverItemFila = useCallback((videoId: string, direcao: -1 | 1) => {
    setEstado((atual) => {
      const proximo = moverNaFila(atual, videoId, direcao);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const limparFila = useCallback(() => {
    setEstado((atual) => {
      const proximo = definirFila(atual, []);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const criarMaratona = useCallback((titulo: string, videoIds: readonly string[]) => {
    setEstado((atual) => {
      const proximo = salvarMaratonaLocal(atual, titulo, videoIds);
      persistir(proximo);
      return proximo;
    });
  }, []);

  const excluirMaratona = useCallback((maratonaId: string) => {
    setEstado((atual) => {
      const proximo = removerMaratonaLocal(atual, maratonaId);
      persistir(proximo);
      return proximo;
    });
  }, []);

  return {
    salvosVideosSet,
    salvosPlaylistsSet,
    assistidosVideosSet,
    filaAtual: estado.filaAtual,
    filaAtualSet,
    maratonas: estado.maratonas,
    recentes: estado.recentes,
    totalSalvosVideos: estado.salvosVideos.length,
    totalSalvosPlaylists: estado.salvosPlaylists.length,
    totalAssistidos: estado.assistidosVideos.length,
    toggleSalvo,
    toggleAssistido,
    registrarAbertura,
    limparHistoricoRecente,
    toggleNaFila,
    carregarNaFila,
    moverItemFila,
    limparFila,
    criarMaratona,
    excluirMaratona,
  };
}
