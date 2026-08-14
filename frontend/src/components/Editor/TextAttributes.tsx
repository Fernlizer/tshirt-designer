import { useCallback, useEffect, useState } from 'react';
import type { FabricObject } from 'fabric';
import { useEditorStore } from '../../stores/editorStore';

const FONT_FAMILIES = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Impact'];

type TextObject = FabricObject & {
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontWeight: string | number;
  fontStyle: string;
  underline: boolean;
  textAlign: string;
  set: (properties: Record<string, unknown>) => void;
};

function asTextObject(object: FabricObject | undefined): TextObject | null {
  return object && ['i-text', 'text', 'textbox'].includes(object.type) ? object as TextObject : null;
}

export default function TextAttributes() {
  const activeSide = useEditorStore((state) => state.activeSide);
  const canvas = useEditorStore((state) => activeSide === 'front' ? state.frontCanvas : state.backCanvas);
  const [selection, setSelection] = useState<{ object: TextObject | null; revision: number }>({ object: null, revision: 0 });
  const selectedText = selection.object;

  const refreshSelection = useCallback(() => {
    setSelection((current) => ({
      object: asTextObject(canvas?.getActiveObject()),
      // Fabric mutates the object in place, so retain a revision for React to
      // refresh the inspector after direct canvas edits as well.
      revision: current.revision + 1,
    }));
  }, [canvas]);

  useEffect(() => {
    refreshSelection();
    if (!canvas) return;

    canvas.on('selection:created', refreshSelection);
    canvas.on('selection:updated', refreshSelection);
    canvas.on('selection:cleared', refreshSelection);
    canvas.on('object:modified', refreshSelection);
    canvas.on('text:changed', refreshSelection);
    return () => {
      canvas.off('selection:created', refreshSelection);
      canvas.off('selection:updated', refreshSelection);
      canvas.off('selection:cleared', refreshSelection);
      canvas.off('object:modified', refreshSelection);
      canvas.off('text:changed', refreshSelection);
    };
  }, [canvas, refreshSelection]);

  const updateText = useCallback((properties: Record<string, unknown>) => {
    if (!canvas || !selectedText) return;
    selectedText.set(properties);
    canvas.requestRenderAll();
    refreshSelection();
  }, [canvas, refreshSelection, selectedText]);

  if (!selectedText) {
    return (
      <div className="sidebar-section text-attributes-empty">
        <h3>Text properties</h3>
        <p>Select a text layer to edit it. Double-click text on the shirt to type directly.</p>
      </div>
    );
  }

  const fontSize = Math.round(selectedText.fontSize || 32);
  const fill = typeof selectedText.fill === 'string' ? selectedText.fill : '#000000';
  const fontWeight = String(selectedText.fontWeight || 'normal');

  return (
    <section className="sidebar-section text-attributes">
      <div className="property-heading">
        <h3>Text properties</h3>
        <span>Selected</span>
      </div>

      <div className="prop-group">
        <label htmlFor="text-content">Text</label>
        <textarea
          id="text-content"
          className="prop-input text-content-input"
          value={selectedText.text || ''}
          onChange={(event) => updateText({ text: event.target.value })}
          rows={3}
        />
      </div>

      <div className="prop-group">
        <label htmlFor="font-family">Font family</label>
        <select id="font-family" className="prop-input" value={selectedText.fontFamily || 'Arial'} onChange={(event) => updateText({ fontFamily: event.target.value })}>
          {FONT_FAMILIES.map((font) => <option key={font} value={font}>{font}</option>)}
        </select>
      </div>

      <div className="property-row">
        <div className="prop-group">
          <label htmlFor="font-size">Size</label>
          <input id="font-size" className="prop-input" type="number" min="6" max="300" value={fontSize} onChange={(event) => updateText({ fontSize: Math.max(6, Math.min(300, Number(event.target.value) || 6)) })} />
        </div>
        <div className="prop-group">
          <label htmlFor="text-color">Color</label>
          <input id="text-color" className="text-color-input" type="color" value={fill} onChange={(event) => updateText({ fill: event.target.value })} />
        </div>
      </div>

      <div className="prop-group">
        <label>Style</label>
        <div className="text-style-controls">
          <button type="button" className={fontWeight === 'bold' || Number(fontWeight) >= 600 ? 'active' : ''} onClick={() => updateText({ fontWeight: fontWeight === 'bold' || Number(fontWeight) >= 600 ? 'normal' : 'bold' })}><strong>B</strong></button>
          <button type="button" className={selectedText.fontStyle === 'italic' ? 'active' : ''} onClick={() => updateText({ fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic' })}><em>I</em></button>
          <button type="button" className={selectedText.underline ? 'active' : ''} onClick={() => updateText({ underline: !selectedText.underline })}><u>U</u></button>
        </div>
      </div>

      <div className="prop-group">
        <label>Alignment</label>
        <div className="text-style-controls">
          {(['left', 'center', 'right'] as const).map((align) => <button key={align} type="button" className={selectedText.textAlign === align ? 'active' : ''} onClick={() => updateText({ textAlign: align })} aria-label={`${align} align`}>{align === 'left' ? '☰' : align === 'center' ? '≡' : '☷'}</button>)}
        </div>
      </div>
    </section>
  );
}
