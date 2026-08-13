import { create } from 'zustand';
import type { Canvas as FabricCanvas } from 'fabric';
import type { GarmentType } from '../lib/garments';

export type Side = 'front' | 'back';

interface UploadedImage {
  filename: string;
  original_name: string;
  url: string;
  width: number;
  height: number;
}

interface EditorState {
  // Canvas references
  frontCanvas: FabricCanvas | null;
  backCanvas: FabricCanvas | null;
  activeSide: Side;

  // Project
  projectId: string | null;
  projectName: string;
  tshirtColor: string;
  garmentType: GarmentType;
  mockupCredit: string;
  showGrid: boolean;

  // Images
  uploadedImages: UploadedImage[];

  // Mockup
  mockupFront: string | null;
  mockupBack: string | null;
  isGeneratingMockup: boolean;

  // UI
  activeTool: 'select' | 'upload' | 'text' | 'shape';

  // Actions
  setFrontCanvas: (canvas: FabricCanvas | null) => void;
  setBackCanvas: (canvas: FabricCanvas | null) => void;
  setActiveSide: (side: Side) => void;
  setProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setTshirtColor: (color: string) => void;
  setGarmentType: (type: GarmentType) => void;
  setMockupCredit: (credit: string) => void;
  setShowGrid: (visible: boolean) => void;
  addUploadedImage: (img: UploadedImage) => void;
  removeUploadedImage: (filename: string) => void;
  setUploadedImages: (images: UploadedImage[]) => void;
  setMockup: (side: Side, url: string | null) => void;
  setIsGeneratingMockup: (v: boolean) => void;
  setActiveTool: (tool: EditorState['activeTool']) => void;
  getActiveCanvas: () => FabricCanvas | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  frontCanvas: null,
  backCanvas: null,
  activeSide: 'front',
  projectId: null,
  projectName: 'Untitled Design',
  tshirtColor: '#FFFFFF',
  garmentType: 'tshirt',
  mockupCredit: '',
  showGrid: true,
  uploadedImages: [],
  mockupFront: null,
  mockupBack: null,
  isGeneratingMockup: false,
  activeTool: 'select',

  setFrontCanvas: (canvas) => set({ frontCanvas: canvas }),
  setBackCanvas: (canvas) => set({ backCanvas: canvas }),
  setActiveSide: (side) => set({ activeSide: side }),
  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  setTshirtColor: (color) => set({ tshirtColor: color }),
  setGarmentType: (garmentType) => set({ garmentType }),
  setMockupCredit: (mockupCredit) => set({ mockupCredit }),
  setShowGrid: (showGrid) => set({ showGrid }),
  addUploadedImage: (img) =>
    set((state) => ({ uploadedImages: [img, ...state.uploadedImages] })),
  removeUploadedImage: (filename) =>
    set((state) => ({
      uploadedImages: state.uploadedImages.filter((i) => i.filename !== filename),
    })),
  setUploadedImages: (images) => set({ uploadedImages: images }),
  setMockup: (side, url) =>
    set(side === 'front' ? { mockupFront: url } : { mockupBack: url }),
  setIsGeneratingMockup: (v) => set({ isGeneratingMockup: v }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  getActiveCanvas: () => {
    const state = get();
    return state.activeSide === 'front' ? state.frontCanvas : state.backCanvas;
  },
}));
