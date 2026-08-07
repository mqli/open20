import { describe, it, expect, beforeEach } from 'vitest';
import { usePaperStore } from '@/stores/paperStore';

describe('paperStore', () => {
  beforeEach(() => {
    // Reset by calling setters back to defaults
    const store = usePaperStore.getState();
    store.setPreset('A4');
    store.setOrientation('portrait');
    store.setMargin(15);
    store.setMarginTop(null);
    store.setMarginBottom(null);
    store.setMarginLeft(null);
    store.setMarginRight(null);
    store.setOverlap(5);
    store.setOutputDpi(150);
    store.setScaleLocked(true);
  });

  it('starts with A4 defaults', () => {
    const state = usePaperStore.getState();
    expect(state.preset).toBe('A4');
    expect(state.getPaperWidth()).toBe(210);
    expect(state.getPaperHeight()).toBe(297);
    expect(state.margin).toBe(15);
    expect(state.overlap).toBe(5);
    expect(state.outputDpi).toBe(150);
    expect(state.scaleLocked).toBe(true);
  });

  it('resolves per-edge margins from uniform default', () => {
    // All null → use uniform margin
    expect(usePaperStore.getState().getMarginTop()).toBe(15);
    expect(usePaperStore.getState().getMarginBottom()).toBe(15);
    expect(usePaperStore.getState().getMarginLeft()).toBe(15);
    expect(usePaperStore.getState().getMarginRight()).toBe(15);
  });

  it('uses per-edge override when set', () => {
    usePaperStore.getState().setMarginTop(20);
    expect(usePaperStore.getState().getMarginTop()).toBe(20);
    // Other edges still use uniform
    expect(usePaperStore.getState().getMarginBottom()).toBe(15);
  });

  it('resetting per-edge to null falls back to uniform', () => {
    usePaperStore.getState().setMarginTop(20);
    usePaperStore.getState().setMarginTop(null);
    expect(usePaperStore.getState().getMarginTop()).toBe(15);
  });

  it('handles LETTER preset', () => {
    usePaperStore.getState().setPreset('LETTER');
    expect(usePaperStore.getState().getPaperWidth()).toBe(215.9);
    expect(usePaperStore.getState().getPaperHeight()).toBe(279.4);
  });

  it('handles A3 preset', () => {
    usePaperStore.getState().setPreset('A3');
    expect(usePaperStore.getState().getPaperWidth()).toBe(297);
    expect(usePaperStore.getState().getPaperHeight()).toBe(420);
  });

  it('handles TABLOID preset', () => {
    usePaperStore.getState().setPreset('TABLOID');
    expect(usePaperStore.getState().getPaperWidth()).toBe(279.4);
    expect(usePaperStore.getState().getPaperHeight()).toBe(431.8);
  });

  it('handles CUSTOM dimensions', () => {
    usePaperStore.getState().setPreset('CUSTOM');
    usePaperStore.getState().setCustomDimensions(300, 400);
    expect(usePaperStore.getState().getPaperWidth()).toBe(300);
    expect(usePaperStore.getState().getPaperHeight()).toBe(400);
  });

  it('enforces minimum 15mm margin for tile label', () => {
    usePaperStore.getState().setMargin(-5);
    expect(usePaperStore.getState().margin).toBe(15);
  });

  it('enforces non-negative overlap', () => {
    usePaperStore.getState().setOverlap(-10);
    expect(usePaperStore.getState().overlap).toBe(0);
  });

  it('enforces minimum 72 DPI output', () => {
    usePaperStore.getState().setOutputDpi(50);
    expect(usePaperStore.getState().outputDpi).toBe(72);
  });

  it('toggles scale lock', () => {
    usePaperStore.getState().setScaleLocked(false);
    expect(usePaperStore.getState().scaleLocked).toBe(false);
    usePaperStore.getState().setScaleLocked(true);
    expect(usePaperStore.getState().scaleLocked).toBe(true);
  });
});
