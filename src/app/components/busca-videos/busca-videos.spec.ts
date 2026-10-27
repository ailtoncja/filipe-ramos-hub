import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BuscaVideos } from './busca-videos';

describe('BuscaVideos', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('busca títulos e descrições sem acentos e filtra por canal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ atualizadoEm: '2026-01-01T00:00:00Z', videos: [
      { id: '1', titulo: 'A aventura', descricao: 'Explorando Elden Ring', canal: 'Canal A', fontes: ['@FilipeRamos96'], publicadoEm: '2025-01-01T00:00:00Z', miniatura: '', visualizacoes: 100 },
      { id: '2', titulo: 'Elden Ring', descricao: '', canal: 'Canal B', fontes: ['@filiperamoslives'], publicadoEm: '2024-01-01T00:00:00Z', miniatura: '', visualizacoes: 1250 },
    ] }) }));
    const fixture = TestBed.createComponent(BuscaVideos);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    await vi.waitFor(() => { fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('2 vídeos encontrados'); });
    const ordem = fixture.nativeElement.querySelectorAll('select')[1] as HTMLSelectElement;
    ordem.value = 'vistos'; ordem.dispatchEvent(new Event('change')); fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('a');
    expect(cards[0].textContent).toContain('Canal B');
    expect(cards[0].textContent).toContain('1.250 visualizações');
    expect(cards[1].textContent).toContain('Canal A');
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'aventura'; input.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Canal A');
    expect(fixture.nativeElement.textContent).not.toContain('Canal B');
    input.value = 'elden ring'; input.dispatchEvent(new Event('input'));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '@filiperamoslives'; select.dispatchEvent(new Event('change')); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Canal B');
    expect(fixture.nativeElement.textContent).not.toContain('Canal A');
  });
});
