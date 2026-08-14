import type { Canvas, FabricObject } from 'fabric';

/** Project JSON has only artwork; retain the garment template and print guides. */
export async function loadProjectArtwork(canvas: Canvas, json: string): Promise<void> {
  const fixedLayers = canvas.getObjects().filter((object) => object.excludeFromExport) as FabricObject[];

  await canvas.loadFromJSON(json);

  fixedLayers.forEach((object) => canvas.add(object));
  const garmentTemplate = fixedLayers.find((object) => object.type.toLowerCase() === 'image');
  if (garmentTemplate) canvas.sendObjectToBack(garmentTemplate);
  fixedLayers
    .filter((object) => object !== garmentTemplate)
    .forEach((guide) => canvas.bringObjectToFront(guide));
  canvas.requestRenderAll();
}
