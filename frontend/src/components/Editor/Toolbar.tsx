import { useState, useCallback } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { updateProject, createProject, type ProjectPayload } from '../../api/client';
import { exportArtworkOnly } from '../../lib/exportArtwork';
import { hasPrintPlacementErrors, runPrintPreflight } from '../../lib/printPreflight';
import { useFeedback } from '../Feedback/FeedbackProvider';

export default function Toolbar() {
  const {
    getActiveCanvas, activeSide, tshirtColor,
    projectId, setProjectId, projectName, setProjectName, garmentType, mockupCredit,
  } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const { notify } = useFeedback();

  const handleAddText = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    import('fabric').then((fabric) => {
      const text = new fabric.IText('Your Text', {
        left: 250,
        top: 250,
        originX: 'center',
        originY: 'center',
        fontSize: 32,
        fill: '#000000',
        fontFamily: 'Arial',
        editable: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    });
  }, [getActiveCanvas]);

  const handleDeleteSelected = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    active.forEach((obj) => {
      if (!obj.selectable) return;
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.renderAll();
  }, [getActiveCanvas]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const frontCanvas = useEditorStore.getState().frontCanvas;
      const backCanvas = useEditorStore.getState().backCanvas;
      const frontJson = frontCanvas ? JSON.stringify(frontCanvas.toJSON()) : null;
      const backJson = backCanvas ? JSON.stringify(backCanvas.toJSON()) : null;

      const project: ProjectPayload = {
        name: projectName.trim() || 'Untitled Design',
        tshirt_color: tshirtColor,
        garment_type: garmentType,
        mockup_credit: mockupCredit,
        front_canvas_json: frontJson,
        back_canvas_json: backJson,
      };

      if (projectId) {
        await updateProject(projectId, project);
      } else {
        const result = await createProject(project);
        setProjectId(result.id);
      }
      window.dispatchEvent(new Event('projects:changed'));
      notify({ tone: 'success', title: 'Project saved', message: 'Your front and back artwork are safely stored.' });
    } catch (err) {
      console.error('Save failed:', err);
      notify({ tone: 'error', title: 'Could not save project', message: 'Check the backend connection and try again.' });
    } finally {
      setSaving(false);
    }
  }, [projectId, projectName, tshirtColor, garmentType, mockupCredit, setProjectId, notify]);

  const handleExport = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const result = runPrintPreflight(canvas, garmentType);
    if (result.artworkCount === 0) {
      notify({ tone: 'error', title: 'Add artwork before export', message: 'The current side has no printable layers.' });
      return;
    }
    if (hasPrintPlacementErrors(result)) {
      notify({ tone: 'error', title: 'Fix print placement before export', message: 'Open Print readiness to fit layers inside the safe area.' });
      return;
    }

    const dataUrl = exportArtworkOnly(canvas);
    const link = document.createElement('a');
    link.download = `tshirt-${activeSide}.png`;
    link.href = dataUrl;
    link.click();
  }, [getActiveCanvas, activeSide, garmentType, notify]);

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1>👕 T-Shirt Studio</h1>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            background: '#0a0a1a',
            border: '1px solid #0f3460',
            color: '#eee',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 14,
            width: 200,
          }}
          placeholder="Project name"
        />
      </div>

      <div className="header-actions">
        <button className="btn btn-secondary" onClick={handleAddText}>
          ✏️ Text
        </button>
        <button className="btn btn-secondary" onClick={handleDeleteSelected}>
          🗑️ Delete
        </button>
        <button className="btn btn-secondary" onClick={handleExport}>
          📤 Export PNG
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '⏳ Saving...' : '💾 Save'}
        </button>
      </div>
    </div>
  );
}
