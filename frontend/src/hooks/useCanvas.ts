import { useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { useEditorStore, type Side } from '../stores/editorStore';
import { getEditorGridArea, getPhotoTemplate } from '../lib/garments';
import { getTintedTemplate } from '../lib/garmentTemplate';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

const createGridGuides = (visible: boolean): fabric.FabricObject[] => {
  const { x, y, width, height } = getEditorGridArea(useEditorStore.getState().garmentType);
  const guides: fabric.FabricObject[] = [
    new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      fill: 'transparent',
      stroke: 'rgba(125, 211, 252, 0.65)',
      strokeDashArray: [5, 5],
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      visible,
    }),
  ];

  for (let column = 1; column < 4; column += 1) {
    const centerLine = column === 2;
    guides.push(new fabric.Line([x + (width / 4) * column, y, x + (width / 4) * column, y + height], {
      stroke: centerLine ? 'rgba(56, 189, 248, 0.95)' : 'rgba(125, 211, 252, 0.4)',
      strokeDashArray: centerLine ? [7, 4] : [3, 5],
      strokeWidth: centerLine ? 1.5 : 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      visible,
    }));
  }

  for (let row = 1; row < 6; row += 1) {
    const centerLine = row === 3;
    guides.push(new fabric.Line([x, y + (height / 6) * row, x + width, y + (height / 6) * row], {
      stroke: centerLine ? 'rgba(56, 189, 248, 0.95)' : 'rgba(125, 211, 252, 0.4)',
      strokeDashArray: centerLine ? [7, 4] : [3, 5],
      strokeWidth: centerLine ? 1.5 : 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      visible,
    }));
  }

  return guides;
};

export function useCanvas(side: Side) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const templateRef = useRef<fabric.FabricImage | null>(null);
  const gridRef = useRef<fabric.FabricObject[]>([]);
  const { setFrontCanvas, setBackCanvas, tshirtColor, garmentType, showGrid } = useEditorStore();

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
    gridRef.current = createGridGuides(useEditorStore.getState().showGrid);
    gridRef.current.forEach((guide) => canvas.add(guide));

    const templateUrl = getPhotoTemplate(useEditorStore.getState().garmentType, side);
    void getTintedTemplate(templateUrl, useEditorStore.getState().tshirtColor).then((tintedUrl) => fabric.FabricImage.fromURL(tintedUrl)).then((template) => {
      if (fabricRef.current !== canvas) return;
      template.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        scaleX: CANVAS_WIDTH / (template.width || CANVAS_WIDTH),
        scaleY: CANVAS_HEIGHT / (template.height || CANVAS_HEIGHT),
      });
      templateRef.current = template;
      canvas.add(template);
      canvas.sendObjectToBack(template);
      gridRef.current.forEach((guide) => canvas.bringObjectToFront(guide));
      canvas.renderAll();
    });

    // Store reference
    if (side === 'front') {
      setFrontCanvas(canvas);
    } else {
      setBackCanvas(canvas);
    }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      templateRef.current = null;
      gridRef.current = [];
    };
  }, [side]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = fabricRef.current;
    gridRef.current.forEach((guide) => guide.set({ visible: showGrid }));
    if (showGrid && canvas) gridRef.current.forEach((guide) => canvas.bringObjectToFront(guide));
    canvas?.renderAll();
  }, [showGrid]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // The printable chest area changes with the garment silhouette. Rebuild only
    // the non-exported guides, leaving the customer's artwork in place.
    gridRef.current.forEach((guide) => canvas.remove(guide));
    gridRef.current = createGridGuides(showGrid);
    gridRef.current.forEach((guide) => canvas.add(guide));
    gridRef.current.forEach((guide) => canvas.bringObjectToFront(guide));
    canvas.renderAll();
  }, [garmentType]);

  useEffect(() => {
    const canvas = fabricRef.current;
    const template = templateRef.current;
    if (!canvas || !template) return;
    const templateUrl = getPhotoTemplate(useEditorStore.getState().garmentType, side);
    let cancelled = false;

    void getTintedTemplate(templateUrl, tshirtColor).then(async (tintedUrl) => {
      if (cancelled) return;
      await template.setSrc(tintedUrl);
      if (!cancelled) {
        template.set({
          scaleX: CANVAS_WIDTH / (template.width || CANVAS_WIDTH),
          scaleY: CANVAS_HEIGHT / (template.height || CANVAS_HEIGHT),
        });
        canvas.renderAll();
      }
    });
    return () => { cancelled = true; };
  }, [side, tshirtColor, garmentType]);

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
      gridRef.current.forEach((guide) => canvas.bringObjectToFront(guide));
      canvas.setActiveObject(img);
      canvas.renderAll();
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  }, []);

  const addText = useCallback((text: string = 'Hello World') => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const textObj = new fabric.IText(text, {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2 - 50,
      originX: 'center',
      originY: 'center',
      fontSize: 32,
      fill: '#000000',
      fontFamily: 'Arial',
      editable: true,
    });

    canvas.add(textObj);
    gridRef.current.forEach((guide) => canvas.bringObjectToFront(guide));
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    active.forEach((obj) => {
      // Don't delete the garment template
      if (!obj.selectable) return;
      canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.renderAll();
  }, []);

  const clearDesign = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Remove all except the garment template
    const objects = canvas.getObjects().filter(
      (obj) => obj.selectable
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
