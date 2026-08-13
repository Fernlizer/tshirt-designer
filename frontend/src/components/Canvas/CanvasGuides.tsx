import { useCallback, useState } from 'react';
import * as fabric from 'fabric';
import { getEditorPrintArea } from '../../lib/garments';
import { useEditorStore } from '../../stores/editorStore';

export default function CanvasGuides() {
  const { showGrid, setShowGrid, getActiveCanvas, garmentType } = useEditorStore();
  const [notice, setNotice] = useState('');

  const getSelectedLayer = useCallback(() => {
    const canvas = getActiveCanvas();
    const selected = canvas?.getActiveObject();
    if (!canvas || !selected) {
      setNotice('Select an image or text layer first.');
      return null;
    }

    return { canvas, selected };
  }, [getActiveCanvas]);

  const handleCenterHorizontally = useCallback(() => {
    const selection = getSelectedLayer();
    if (!selection) return;

    const { canvas, selected } = selection;
    const area = getEditorPrintArea(garmentType);
    const currentCenter = selected.getCenterPoint();
    selected.setPositionByOrigin(
      new fabric.Point(area.x + area.width / 2, currentCenter.y),
      'center',
      'center',
    );
    selected.setCoords();
    canvas.requestRenderAll();
    setNotice('Centered horizontally; vertical position unchanged.');
  }, [garmentType, getSelectedLayer]);

  const handleCenter = useCallback(() => {
    const selection = getSelectedLayer();
    if (!selection) return;

    const { canvas, selected } = selection;
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
  }, [garmentType, getSelectedLayer]);

  const handleDelete = useCallback(() => {
    const canvas = getActiveCanvas();
    const selected = canvas?.getActiveObjects() ?? [];
    const deletable = selected.filter((object) => object.selectable);
    if (!canvas || deletable.length === 0) {
      setNotice('Select an image or text layer first.');
      return;
    }

    deletable.forEach((object) => canvas.remove(object));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setNotice('Selected layer deleted. Choose another image to replace it.');
  }, [getActiveCanvas]);

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
      <button type="button" className="guide-center-x" onClick={handleCenterHorizontally}>
        ↔ Center horizontally
      </button>
      <button type="button" className="guide-center" onClick={handleCenter}>
        ◎ Center in print area
      </button>
      <button type="button" className="guide-delete" onClick={handleDelete}>
        🗑 Delete selected
      </button>
      {notice && <span className="guide-notice" role="status">{notice}</span>}
    </div>
  );
}
