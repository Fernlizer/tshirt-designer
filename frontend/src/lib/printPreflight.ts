import { Point, type Canvas, type FabricObject } from 'fabric';
import { getEditorPrintArea, type GarmentType } from './garments';

export type PreflightSeverity = 'error' | 'warning';

export interface PreflightIssue {
  severity: PreflightSeverity;
  code: 'outside-safe-area' | 'small-layer';
  message: string;
  object: FabricObject;
  objectIndex: number;
}

export interface PreflightResult {
  artworkCount: number;
  issues: PreflightIssue[];
}

const BOUNDARY_EPSILON = 1;
const SMALL_LAYER_RATIO = 0.08;

export function runPrintPreflight(canvas: Canvas | null, garmentType: GarmentType): PreflightResult {
  const artwork = canvas?.getObjects().filter((object) => object.selectable && object.visible !== false) ?? [];
  const printArea = getEditorPrintArea(garmentType);
  const smallLayerLimit = Math.min(printArea.width, printArea.height) * SMALL_LAYER_RATIO;

  return {
    artworkCount: artwork.length,
    issues: artwork.flatMap((object, objectIndex) => {
      object.setCoords();
      const bounds = object.getBoundingRect();
      const issues: PreflightIssue[] = [];
      const isOutside =
        bounds.left < printArea.x - BOUNDARY_EPSILON ||
        bounds.top < printArea.y - BOUNDARY_EPSILON ||
        bounds.left + bounds.width > printArea.x + printArea.width + BOUNDARY_EPSILON ||
        bounds.top + bounds.height > printArea.y + printArea.height + BOUNDARY_EPSILON;

      if (isOutside) {
        issues.push({
          severity: 'error',
          code: 'outside-safe-area',
          message: 'Part of this layer is outside the safe print area.',
          object,
          objectIndex,
        });
      }

      if (Math.min(bounds.width, bounds.height) < smallLayerLimit) {
        issues.push({
          severity: 'warning',
          code: 'small-layer',
          message: 'This layer may look very small when printed.',
          object,
          objectIndex,
        });
      }

      return issues;
    }),
  };
}

export function hasPrintPlacementErrors(result: PreflightResult): boolean {
  return result.issues.some((issue) => issue.severity === 'error');
}

export function getPrintableLayerName(object: FabricObject, index: number): string {
  if (object.type === 'i-text' || object.type === 'text') return `Text layer ${index + 1}`;
  if (object.type === 'image') return `Image layer ${index + 1}`;
  return `Layer ${index + 1}`;
}

/** Shrinks and centers an oversized layer without changing its rotation. */
export function fitObjectInsidePrintArea(canvas: Canvas, object: FabricObject, garmentType: GarmentType): void {
  const printArea = getEditorPrintArea(garmentType);
  object.setCoords();
  const bounds = object.getBoundingRect();
  const scale = Math.min(1, printArea.width / bounds.width, printArea.height / bounds.height);

  if (Number.isFinite(scale) && scale > 0 && scale < 1) {
    object.set({
      scaleX: (object.scaleX ?? 1) * scale,
      scaleY: (object.scaleY ?? 1) * scale,
    });
  }

  object.setPositionByOrigin(new Point(
    printArea.x + printArea.width / 2,
    printArea.y + printArea.height / 2,
  ), 'center', 'center');
  object.setCoords();
  canvas.setActiveObject(object);
  canvas.requestRenderAll();
}
