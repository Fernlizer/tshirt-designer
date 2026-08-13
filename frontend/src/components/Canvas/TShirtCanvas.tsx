import { useCanvas } from '../../hooks/useCanvas';
import type { Side } from '../../stores/editorStore';

interface Props {
  side: Side;
}

export default function TShirtCanvas({ side }: Props) {
  const { canvasRef } = useCanvas(side);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} />
    </div>
  );
}
