import type { Canvas as FabricCanvas, FabricObject } from 'fabric';

/**
 * Produces the printable artwork only. Garment templates and editor guides are
 * deliberately non-selectable, so they are hidden for this one synchronous export.
 */
export function exportArtworkOnly(canvas: FabricCanvas): string {
  const hiddenObjects = canvas.getObjects().filter((object) => !object.selectable && object.visible);

  hiddenObjects.forEach((object: FabricObject) => object.set({ visible: false }));
  canvas.renderAll();

  try {
    return canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
  } finally {
    hiddenObjects.forEach((object: FabricObject) => object.set({ visible: true }));
    canvas.renderAll();
  }
}
