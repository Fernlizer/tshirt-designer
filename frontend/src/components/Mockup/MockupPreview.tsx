import { useState, useCallback } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { generateMockup } from '../../api/client';

export default function MockupPreview() {
  const { mockupFront, mockupBack, activeSide, tshirtColor, setMockup, isGeneratingMockup, setIsGeneratingMockup } = useEditorStore();

  const handleGenerate = useCallback(async () => {
    const canvas = activeSide === 'front'
      ? useEditorStore.getState().frontCanvas
      : useEditorStore.getState().backCanvas;

    if (!canvas) return;

    setIsGeneratingMockup(true);
    try {
      const dataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
      const b64 = dataUrl.split(',')[1];

      const result = await generateMockup(b64, activeSide, tshirtColor);
      setMockup(activeSide, result.url);
    } catch (err) {
      console.error('Mockup generation failed:', err);
      alert('Mockup generation failed');
    } finally {
      setIsGeneratingMockup(false);
    }
  }, [activeSide, tshirtColor, setMockup, setIsGeneratingMockup]);

  const currentMockup = activeSide === 'front' ? mockupFront : mockupBack;

  return (
    <div className="sidebar-section">
      <h3>🧍 Mockup Preview</h3>

      <button
        className="btn btn-primary btn-block"
        onClick={handleGenerate}
        disabled={isGeneratingMockup}
        style={{ marginBottom: 12 }}
      >
        {isGeneratingMockup ? '⏳ Generating...' : '✨ Generate Mockup'}
      </button>

      {currentMockup ? (
        <div className="mockup-container">
          <img src={currentMockup} alt={`T-shirt ${activeSide} mockup`} />
          <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
            {activeSide === 'front' ? 'Front' : 'Back'} view
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: 24,
          color: '#555',
          fontSize: 13,
          border: '1px dashed #0f3460',
          borderRadius: 8,
        }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>👕</p>
          <p>Design something and click<br />"Generate Mockup" to preview</p>
        </div>
      )}
    </div>
  );
}
