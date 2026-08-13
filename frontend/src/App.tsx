import Toolbar from './components/Editor/Toolbar';
import TShirtCanvas from './components/Canvas/TShirtCanvas';
import CanvasTabs from './components/Canvas/CanvasTabs';
import ImageUploader from './components/Upload/ImageUploader';
import ColorPicker from './components/Editor/ColorPicker';
import MockupPreview from './components/Mockup/MockupPreview';
import { useEditorStore } from './stores/editorStore';

export default function App() {
  const activeSide = useEditorStore((s) => s.activeSide);

  return (
    <div className="app">
      <Toolbar />

      <div className="main-layout">
        {/* Left sidebar: Upload + Color */}
        <div className="sidebar-left">
          <ImageUploader />
          <ColorPicker />
        </div>

        {/* Center: Canvas */}
        <div className="canvas-area">
          <CanvasTabs />
          <TShirtCanvas key={`canvas-${activeSide}`} side={activeSide} />
        </div>

        {/* Right sidebar: Mockup */}
        <div className="sidebar-right">
          <MockupPreview />
        </div>
      </div>
    </div>
  );
}
