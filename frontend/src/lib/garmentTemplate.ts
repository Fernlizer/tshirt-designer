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

  // Apply the chosen color at full strength inside the garment alpha mask first.
  // The old translucent overlay mixed white template pixels back into dark colors.
  context.drawImage(image, 0, 0);
  context.globalCompositeOperation = 'source-in';
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Reapply the photograph with multiply so seams and fabric shadows remain.
  context.globalCompositeOperation = 'multiply';
  context.drawImage(image, 0, 0);
  context.globalCompositeOperation = 'source-over';

  return canvas.toDataURL('image/png');
}
