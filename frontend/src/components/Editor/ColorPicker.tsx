import { useCallback, useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';

const TSHIRT_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Navy', value: '#1a2744' },
  { name: 'Red', value: '#c0392b' },
  { name: 'Royal Blue', value: '#2980b9' },
  { name: 'Forest', value: '#27ae60' },
  { name: 'Gray', value: '#7f8c8d' },
  { name: 'Yellow', value: '#f1c40f' },
  { name: 'Pink', value: '#e91e8f' },
  { name: 'Orange', value: '#e67e22' },
  { name: 'Purple', value: '#8e44ad' },
  { name: 'Maroon', value: '#7b241c' },
];

export default function ColorPicker() {
  const { tshirtColor, setTshirtColor } = useEditorStore();
  const [customColor, setCustomColor] = useState(tshirtColor);
  const handleSelect = useCallback((color: string) => {
    setCustomColor(color);
    setTshirtColor(color);
  }, [setTshirtColor]);

  return (
    <div className="sidebar-section">
      <h3>🎨 Garment Color</h3>

      <p className="mockup-note">Color is tinted through the real garment mask, preserving the template's seams and shading.</p>

      <div className="color-presets">
        {TSHIRT_COLORS.map((c) => (
          <button
            type="button"
            key={c.value}
            className={`color-preset ${tshirtColor === c.value ? 'active' : ''}`}
            style={{ backgroundColor: c.value }}
            aria-label={c.name}
            aria-pressed={tshirtColor === c.value}
            onClick={() => handleSelect(c.value)}
          />
        ))}
      </div>

      <div className="color-row">
        <input
          type="color"
          className="color-swatch"
          value={customColor}
          onChange={(event) => handleSelect(event.target.value)}
        />
        <input
          type="text"
          className="color-input"
          value={customColor}
          onChange={(event) => {
            setCustomColor(event.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(event.target.value)) setTshirtColor(event.target.value);
          }}
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}
