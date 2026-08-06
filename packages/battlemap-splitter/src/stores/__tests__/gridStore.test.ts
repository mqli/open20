import { describe, it, expect, beforeEach } from 'vitest';
import { useGridStore } from '@/stores/gridStore';

describe('gridStore', () => {
  beforeEach(() => {
    useGridStore.getState().reset();
  });

  it('starts with default 149.5 DPI', () => {
    const state = useGridStore.getState();
    expect(state.cellPx).toBe(149.5);
    expect(state.visible).toBe(true);
    expect(state.offsetX).toBe(0);
    expect(state.offsetY).toBe(0);
  });

  it('setCellPx enforces minimum 10', () => {
    useGridStore.getState().setCellPx(5);
    expect(useGridStore.getState().cellPx).toBe(10);
  });

  it('setCellPx accepts valid values', () => {
    useGridStore.getState().setCellPx(100);
    expect(useGridStore.getState().cellPx).toBe(100);
  });

  it('toggles visibility', () => {
    useGridStore.getState().toggleVisibility();
    expect(useGridStore.getState().visible).toBe(false);
    useGridStore.getState().toggleVisibility();
    expect(useGridStore.getState().visible).toBe(true);
  });

  it('sets color', () => {
    useGridStore.getState().setColor('rgba(0, 0, 255, 0.5)');
    expect(useGridStore.getState().color).toBe('rgba(0, 0, 255, 0.5)');
  });

  it('setOpacity clamps to 0-1', () => {
    useGridStore.getState().setOpacity(0.5);
    expect(useGridStore.getState().opacity).toBe(0.5);

    useGridStore.getState().setOpacity(1.5);
    expect(useGridStore.getState().opacity).toBe(1);

    useGridStore.getState().setOpacity(-0.5);
    expect(useGridStore.getState().opacity).toBe(0);
  });

  it('sets offset', () => {
    useGridStore.getState().setOffset(10, 20);
    expect(useGridStore.getState().offsetX).toBe(10);
    expect(useGridStore.getState().offsetY).toBe(20);
  });

  it('reset restores defaults', () => {
    useGridStore.getState().setCellPx(100);
    useGridStore.getState().setOffset(5, 5);
    useGridStore.getState().setColor('blue');
    useGridStore.getState().reset();

    const state = useGridStore.getState();
    expect(state.cellPx).toBe(149.5);
    expect(state.offsetX).toBe(0);
    expect(state.offsetY).toBe(0);
    expect(state.visible).toBe(true);
    expect(state.color).toBe('rgba(255, 0, 0, 0.8)');
  });
});
