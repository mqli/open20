import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '@/stores/mapStore';

describe('mapStore', () => {
  beforeEach(() => {
    useMapStore.getState().clear();
  });

  it('starts with no image', () => {
    const state = useMapStore.getState();
    expect(state.imageUrl).toBeNull();
    expect(state.width).toBe(0);
    expect(state.height).toBe(0);
  });

  it('sets zoom within bounds', () => {
    useMapStore.getState().setZoom(3);
    expect(useMapStore.getState().zoom).toBe(3);

    useMapStore.getState().setZoom(10); // exceeds max
    expect(useMapStore.getState().zoom).toBe(5);

    useMapStore.getState().setZoom(0.01); // below min
    expect(useMapStore.getState().zoom).toBe(0.1);
  });

  it('sets pan values', () => {
    useMapStore.getState().setPan(100, 200);
    expect(useMapStore.getState().panX).toBe(100);
    expect(useMapStore.getState().panY).toBe(200);
  });

  it('fitToScreen resets zoom and pan', () => {
    useMapStore.getState().setZoom(3);
    useMapStore.getState().setPan(50, 60);
    useMapStore.getState().fitToScreen();

    expect(useMapStore.getState().zoom).toBe(1);
    expect(useMapStore.getState().panX).toBe(0);
    expect(useMapStore.getState().panY).toBe(0);
  });

  it('clear resets to initial state', () => {
    useMapStore.getState().setZoom(2);
    useMapStore.getState().setPan(10, 20);
    useMapStore.getState().clear();

    const state = useMapStore.getState();
    expect(state.imageUrl).toBeNull();
    expect(state.width).toBe(0);
    expect(state.height).toBe(0);
    expect(state.zoom).toBe(1);
    expect(state.panX).toBe(0);
    expect(state.panY).toBe(0);
  });

  it.skip('loadImageFromFile creates a blob URL (requires real browser canvas)', async () => {
    // This test requires a real browser image decoder.
    // happy-dom's Image implementation doesn't decode PNG data.
    // Test in manual browser testing or e2e tests.
  });
});
