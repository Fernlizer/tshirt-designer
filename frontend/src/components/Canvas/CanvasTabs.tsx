import { useEditorStore } from '../../stores/editorStore';
import type { Side } from '../../stores/editorStore';

export default function CanvasTabs() {
  const { activeSide, setActiveSide } = useEditorStore();

  const sides: { label: string; value: Side }[] = [
    { label: '👕 Front', value: 'front' },
    { label: '👕 Back', value: 'back' },
  ];

  return (
    <div className="canvas-tabs">
      {sides.map((s) => (
        <button
          key={s.value}
          className={`canvas-tab ${activeSide === s.value ? 'active' : ''}`}
          onClick={() => setActiveSide(s.value)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
