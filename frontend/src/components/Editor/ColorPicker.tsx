import { useState, useCallback } from 'react';
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
    setTshirtColor(color);
    setCustomColor(color);
  }, [setTshirtColor]);

  return (
    <div className="sidebar-section">
      <h3>🎨 T-Shirt Color</h3>

      <div className="color-presets">
        {TSHIRT_COLORS.map((c) => (
          <div
            key={c.value}
            className={`color-preset ${tshirtColor === c.value ? 'active' : ''}`}
            style={{ backgroundColor: c.value }}
            title={c.name}
            onClick={() => handleSelect(c.value)}
          />
        ))}
      </div>

      <div className="color-row">
        <input
          type="color"
          className="color-swatch"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            setTshirtColor(e.target.value);
          }}
        />
        <input
          type="text"
          className="color-input"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              setTshirtColor(e.target.value);
            }
          }}
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}
