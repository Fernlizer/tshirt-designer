const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = url;
});

export async function getTintedTemplate(url: string, color: string): Promise<string> {
  if (color.toUpperCase() === '#FFFFFF') return url;

  const image = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) return url;

  context.drawImage(image, 0, 0);
  context.globalCompositeOperation = 'source-atop';
  context.fillStyle = color;
  context.globalAlpha = 0.9;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 1;
  context.globalCompositeOperation = 'multiply';
  context.drawImage(image, 0, 0);

  return canvas.toDataURL('image/png');
}
