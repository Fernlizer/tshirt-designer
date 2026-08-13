import { useCallback, useState } from 'react';
import * as fabric from 'fabric';
import { getEditorPrintArea } from '../../lib/garments';
import { useEditorStore } from '../../stores/editorStore';

export default function CanvasGuides() {
  const { showGrid, setShowGrid, getActiveCanvas, garmentType } = useEditorStore();
  const [notice, setNotice] = useState('');

  const handleCenter = useCallback(() => {
    const canvas = getActiveCanvas();
    const selected = canvas?.getActiveObject();
    if (!canvas || !selected) {
      setNotice('Select an image or text layer first.');
      return;
    }

    const area = getEditorPrintArea(garmentType);
    selected.set({ angle: 0 });
    selected.setPositionByOrigin(
      new fabric.Point(area.x + area.width / 2, area.y + area.height / 2),
      'center',
      'center',
    );
    selected.setCoords();
    canvas.requestRenderAll();
    setNotice('Centered and straightened in the print area.');
  }, [garmentType, getActiveCanvas]);

  return (
    <div className="canvas-guides" aria-label="Alignment controls">
      <button
        type="button"
        className={`guide-toggle ${showGrid ? 'is-active' : ''}`}
        onClick={() => setShowGrid(!showGrid)}
        aria-pressed={showGrid}
      >
        # Grid {showGrid ? 'on' : 'off'}
      </button>
      <button type="button" className="guide-center" onClick={handleCenter}>
        ◎ Center selected
      </button>
      {notice && <span className="guide-notice" role="status">{notice}</span>}
    </div>
  );
}
