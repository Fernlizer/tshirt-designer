export const GARMENT_TYPES = ['tshirt', 'oversized', 'hoodie'] as const;

export type GarmentType = (typeof GARMENT_TYPES)[number];

export interface GarmentDefinition {
  id: GarmentType;
  label: string;
  description: string;
  editorPath: string;
  previewPath: string;
  collarPath: string;
  printArea: { x: number; y: number; width: number; height: number };
  templates?: { front: string; back: string };
}

export const GARMENTS: Record<GarmentType, GarmentDefinition> = {
  tshirt: {
    id: 'tshirt',
    label: 'Classic Tee',
    description: 'Regular fit · short sleeve',
    editorPath: 'M 150 80 L 100 120 L 30 160 L 70 260 L 150 220 L 150 520 L 350 520 L 350 220 L 430 260 L 470 160 L 400 120 L 350 80 L 300 50 L 250 70 L 200 50 Z',
    previewPath: 'M 205 110 L 139 151 L 45 204 L 91 355 L 191 304 L 191 658 L 449 658 L 449 304 L 549 355 L 595 204 L 501 151 L 435 110 C 406 143 372 160 320 160 C 268 160 234 143 205 110 Z',
    collarPath: 'M 244 117 C 257 159 284 181 320 181 C 356 181 383 159 396 117 C 371 140 350 149 320 149 C 290 149 269 140 244 117 Z',
    // Deliberately generous: artwork can reach the upper chest and extend toward
    // the side seams without crossing the collar, sleeves, or bottom hem.
    printArea: { x: 190, y: 195, width: 260, height: 340 },
    templates: {
      front: '/garments/templates/tshirt-front-v1.png',
      back: '/garments/templates/tshirt-back-v1.png',
    },
  },
  oversized: {
    id: 'oversized',
    label: 'Oversized Tee',
    description: 'Dropped shoulder · boxy half sleeve',
    editorPath: 'M 118 88 L 65 120 L 18 155 L 55 285 L 130 250 L 130 540 L 370 540 L 370 250 L 445 285 L 482 155 L 435 120 L 382 88 L 315 58 L 250 85 L 185 58 Z',
    previewPath: 'M 190 112 L 104 141 L 30 190 L 77 382 L 178 340 L 178 680 L 462 680 L 462 340 L 563 382 L 610 190 L 536 141 L 450 112 L 386 95 C 369 135 348 153 320 153 C 292 153 271 135 254 95 Z',
    collarPath: 'M 253 107 C 268 145 289 166 320 166 C 351 166 372 145 387 107 C 368 128 346 137 320 137 C 294 137 272 128 253 107 Z',
    printArea: { x: 185, y: 220, width: 270, height: 260 },
    templates: {
      front: '/garments/templates/oversized-front-v1.png',
      back: '/garments/templates/oversized-back-v1.png',
    },
  },
  hoodie: {
    id: 'hoodie',
    label: 'Hoodie',
    description: 'Pullover · front pocket',
    editorPath: 'M 165 125 L 112 145 L 45 190 L 80 305 L 158 270 L 158 530 L 342 530 L 342 270 L 420 305 L 455 190 L 388 145 L 335 125 L 310 55 L 250 35 L 190 55 Z',
    previewPath: 'M 218 165 L 143 180 L 52 238 L 97 408 L 190 365 L 190 680 L 450 680 L 450 365 L 543 408 L 588 238 L 497 180 L 422 165 L 402 76 C 380 39 350 22 320 22 C 290 22 260 39 238 76 Z',
    collarPath: 'M 238 76 C 250 144 278 181 320 181 C 362 181 390 144 402 76 C 371 102 352 114 320 114 C 288 114 269 102 238 76 Z',
    printArea: { x: 229, y: 246, width: 182, height: 245 },
  },
};

export const isGarmentType = (value: unknown): value is GarmentType =>
  typeof value === 'string' && GARMENT_TYPES.includes(value as GarmentType);

export const hasPhotoTemplate = (type: GarmentType): boolean =>
  Boolean(GARMENTS[type].templates);

export const getPhotoTemplate = (type: GarmentType, side: 'front' | 'back'): string =>
  GARMENTS[type].templates?.[side] ?? GARMENTS.tshirt.templates![side];

/** The photo template is rendered into a 500 × 600 Fabric canvas. */
export const getEditorPrintArea = (type: GarmentType) => {
  const area = GARMENTS[type].printArea;
  return {
    x: area.x * (500 / 640),
    y: area.y * (600 / 720),
    width: area.width * (500 / 640),
    height: area.height * (600 / 720),
  };
};
