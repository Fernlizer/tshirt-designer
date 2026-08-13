import { useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { useEditorStore, type Side } from '../stores/editorStore';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

// T-shirt shape points (normalized to canvas size)
const TSHIRT_PATH = `M 150 80 
  L 100 120 L 30 160 L 70 260 L 150 220 
  L 150 520 L 350 520 L 350 220 
  L 430 260 L 470 160 L 400 120 L 350 80 
  L 300 50 L 250 70 L 200 50 Z`;

export function useCanvas(side: Side) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const { setFrontCanvas, setBackCanvas, tshirtColor } = useEditorStore();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 'transparent',
      selection: true,
    });

    fabricRef.current = canvas;

    // Draw T-shirt shape as background
    const tshirt = new fabric.Path(TSHIRT_PATH, {
      fill: tshirtColor,
      stroke: '#cccccc',
      strokeWidth: 2,
      selectable: false,
      evented: false,
      excludeFromExport: false,
    });
    canvas.add(tshirt);
    canvas.sendObjectToBack(tshirt);

    // Store reference
    if (side === 'front') {
      setFrontCanvas(canvas);
    } else {
      setBackCanvas(canvas);
    }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [side]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update shirt color when it changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const tshirt = objects.find(
      (obj) => obj instanceof fabric.Path && !obj.selectable
    );
    if (tshirt) {
      tshirt.set('fill', tshirtColor);
      canvas.renderAll();
    }
  }, [tshirtColor]);

  const addImage = useCallback(async (imageUrl: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      const img = await fabric.FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous',
      });

      // Scale to fit within the print area
      const maxW = 200;
      const maxH = 250;
      const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);

      img.set({
        left: CANVAS_WIDTH / 2,
        top: CANVAS_HEIGHT / 2 - 50,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  }, []);

  const addText = useCallback((text: string = 'Hello World') => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const textObj = new fabric.FabricText(text, {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2 - 50,
      originX: 'center',
      originY: 'center',
      fontSize: 32,
      fill: '#000000',
      fontFamily: 'Arial',
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    active.forEach((obj) => {
      // Don't delete the t-shirt background
      if (obj instanceof fabric.Path && !obj.selectable) return;
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.renderAll();
  }, []);

  const clearDesign = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Remove all except t-shirt background
    const objects = canvas.getObjects().filter(
      (obj) => !(obj instanceof fabric.Path && !obj.selectable)
    );
    objects.forEach((obj) => canvas.remove(obj));
    canvas.renderAll();
  }, []);

  const exportPNG = useCallback((): string | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;

    return canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
  }, []);

  const getCanvasJSON = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    return JSON.stringify(canvas.toJSON());
  }, []);

  const loadCanvasJSON = useCallback(async (json: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    try {
      await canvas.loadFromJSON(json);
      canvas.renderAll();
    } catch (err) {
      console.error('Failed to load canvas JSON:', err);
    }
  }, []);

  return {
    canvasRef,
    fabricRef,
    addImage,
    addText,
    deleteSelected,
    clearDesign,
    exportPNG,
    getCanvasJSON,
    loadCanvasJSON,
  };
}
