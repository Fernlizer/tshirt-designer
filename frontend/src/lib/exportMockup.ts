import type { Canvas as FabricCanvas } from 'fabric';
import type { GarmentType } from './garments';
import { getPhotoTemplate } from './garments';
import { exportArtworkOnly } from './exportArtwork';
import { getTintedTemplate } from './garmentTemplate';
import { getGarmentSurfaceTheme } from './garmentSurface';

const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = url;
});

const drawSurface = (context: CanvasRenderingContext2D, width: number, height: number, color: string) => {
  const lightSurface = getGarmentSurfaceTheme(color) === 'garment-surface--light';
  context.fillStyle = lightSurface ? '#edf1f6' : '#111524';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = lightSurface ? 'rgba(86, 108, 134, 0.16)' : 'rgba(115, 157, 211, 0.18)';
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
};

export async function exportCombinedMockup({
  garmentType,
  tshirtColor,
  frontCanvas,
  backCanvas,
  credit,
}: {
  garmentType: GarmentType;
  tshirtColor: string;
  frontCanvas: FabricCanvas | null;
  backCanvas: FabricCanvas | null;
  credit: string;
}): Promise<string> {
  const [frontTemplate, backTemplate, frontArtwork, backArtwork] = await Promise.all([
    getTintedTemplate(getPhotoTemplate(garmentType, 'front'), tshirtColor),
    getTintedTemplate(getPhotoTemplate(garmentType, 'back'), tshirtColor),
    frontCanvas ? Promise.resolve(exportArtworkOnly(frontCanvas)) : Promise.resolve(null),
    backCanvas ? Promise.resolve(exportArtworkOnly(backCanvas)) : Promise.resolve(null),
  ]);
  const [frontTemplateImage, backTemplateImage, frontArtworkImage, backArtworkImage] = await Promise.all([
    loadImage(frontTemplate),
    loadImage(backTemplate),
    frontArtwork ? loadImage(frontArtwork) : Promise.resolve(null),
    backArtwork ? loadImage(backArtwork) : Promise.resolve(null),
  ]);

  const sideWidth = frontTemplateImage.naturalWidth;
  const sideHeight = frontTemplateImage.naturalHeight;
  const gutter = 72;
  const header = 92;
  const footer = credit.trim() ? 92 : 48;
  const output = document.createElement('canvas');
  output.width = sideWidth * 2 + gutter * 3;
  output.height = sideHeight + header + footer + gutter;
  const context = output.getContext('2d');
  if (!context) throw new Error('Could not create mockup export');

  drawSurface(context, output.width, output.height, tshirtColor);
  context.fillStyle = getGarmentSurfaceTheme(tshirtColor) === 'garment-surface--light' ? '#23324b' : '#e9f3ff';
  context.font = '700 30px system-ui, sans-serif';
  context.textAlign = 'center';
  context.fillText('FRONT', gutter + sideWidth / 2, 54);
  context.fillText('BACK', gutter * 2 + sideWidth + sideWidth / 2, 54);

  const drawSide = (template: HTMLImageElement, artwork: HTMLImageElement | null, x: number) => {
    const y = header;
    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.28)';
    context.shadowBlur = 26;
    context.shadowOffsetY = 12;
    context.drawImage(template, x, y, sideWidth, sideHeight);
    context.restore();
    if (artwork) context.drawImage(artwork, x, y, sideWidth, sideHeight);
  };

  drawSide(frontTemplateImage, frontArtworkImage, gutter);
  drawSide(backTemplateImage, backArtworkImage, gutter * 2 + sideWidth);

  if (credit.trim()) {
    context.fillStyle = getGarmentSurfaceTheme(tshirtColor) === 'garment-surface--light' ? '#42536a' : '#afc0d8';
    context.font = '500 24px system-ui, sans-serif';
    context.textAlign = 'right';
    context.fillText(credit.trim(), output.width - gutter, output.height - 34);
  }

  return output.toDataURL('image/png');
}
