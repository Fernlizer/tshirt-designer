export type GarmentSurfaceTheme = 'garment-surface--light' | 'garment-surface--dark';

/**
 * Keeps the garment visible against its stage. Black tees receive a light studio
 * surface; white and every other color retain the dark product-preview surface.
 */
export function getGarmentSurfaceTheme(color: string): GarmentSurfaceTheme {
  const match = /^#([\da-f]{6})$/i.exec(color.trim());
  if (!match) return 'garment-surface--dark';

  const channels = [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16));
  const isBlack = channels.every((channel) => channel <= 32);

  return isBlack ? 'garment-surface--light' : 'garment-surface--dark';
}
