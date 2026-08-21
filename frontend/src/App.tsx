import Toolbar from './components/Editor/Toolbar';
import TShirtCanvas from './components/Canvas/TShirtCanvas';
import CanvasTabs from './components/Canvas/CanvasTabs';
import CanvasGuides from './components/Canvas/CanvasGuides';
import ImageUploader from './components/Upload/ImageUploader';
import ColorPicker from './components/Editor/ColorPicker';
import GarmentPicker from './components/Editor/GarmentPicker';
import MockupPreview from './components/Mockup/MockupPreview';
import ProjectLibrary from './components/Editor/ProjectLibrary';
import TextAttributes from './components/Editor/TextAttributes';
import PrintPreflight from './components/Editor/PrintPreflight';
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
          <GarmentPicker />
          <ColorPicker />
          <ProjectLibrary />
        </div>

        {/* Center: Canvas */}
        <div className="canvas-area">
          <CanvasTabs />
          <CanvasGuides />
          <div className="canvas-stack">
            <TShirtCanvas side="front" isActive={activeSide === 'front'} />
            <TShirtCanvas side="back" isActive={activeSide === 'back'} />
          </div>
        </div>

        {/* Right sidebar: Mockup */}
        <div className="sidebar-right">
          <TextAttributes />
          <PrintPreflight />
          <MockupPreview />
        </div>
      </div>
    </div>
  );
}
