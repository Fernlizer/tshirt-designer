import { useCanvas } from '../../hooks/useCanvas';
import type { Side } from '../../stores/editorStore';

interface Props {
  side: Side;
  isActive: boolean;
}

export default function TShirtCanvas({ side, isActive }: Props) {
  const { canvasRef } = useCanvas(side);

  return (
    <div className={`canvas-wrapper ${isActive ? 'is-active' : ''}`} aria-hidden={!isActive}>
      <canvas ref={canvasRef} />
    </div>
  );
}
