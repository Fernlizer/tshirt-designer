import { useCanvas } from '../../hooks/useCanvas';
import { getGarmentSurfaceTheme } from '../../lib/garmentSurface';
import { useEditorStore, type Side } from '../../stores/editorStore';

interface Props {
  side: Side;
  isActive: boolean;
}

export default function TShirtCanvas({ side, isActive }: Props) {
  const { canvasRef } = useCanvas(side);
  const tshirtColor = useEditorStore((state) => state.tshirtColor);
  const surfaceTheme = getGarmentSurfaceTheme(tshirtColor);

  return (
    <div className={`canvas-wrapper garment-surface ${surfaceTheme} ${isActive ? 'is-active' : ''}`} aria-hidden={!isActive}>
      <canvas ref={canvasRef} />
    </div>
  );
}
