import { useRef, useCallback, useEffect, useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { uploadImage, listImages, deleteImage, removeImageBackground } from '../../api/client';
import { useFeedback } from '../Feedback/FeedbackProvider';

export default function ImageUploader() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadedImages, addUploadedImage, removeUploadedImage, setUploadedImages, getActiveCanvas } = useEditorStore();
  const [uploading, setUploading] = useState(false);
  const [removingBackground, setRemovingBackground] = useState<string | null>(null);
  const { notify } = useFeedback();

  // Load existing images on mount
  useEffect(() => {
    listImages()
      .then(setUploadedImages)
      .catch(() => {}); // ignore on first load
  }, [setUploadedImages]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadImage(file);
      addUploadedImage(result);
    } catch (err) {
      console.error('Upload failed:', err);
      notify({ tone: 'error', title: 'Upload failed', message: 'Use PNG, JPG, SVG, or WebP up to 10 MB.' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [addUploadedImage, notify]);

  const handleAddToCanvas = useCallback((url: string) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    import('fabric').then(async (fabric) => {
      try {
        const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
        const maxW = 200;
        const maxH = 250;
        const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);

        img.set({
          left: 250,
          top: 250,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      } catch (err) {
        console.error('Failed to add image:', err);
      }
    });
  }, [getActiveCanvas]);

  const handleDelete = useCallback(async (filename: string) => {
    try {
      await deleteImage(filename);
      removeUploadedImage(filename);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, [removeUploadedImage]);

  const handleRemoveBackground = useCallback(async (filename: string) => {
    setRemovingBackground(filename);
    try {
      const result = await removeImageBackground(filename);
      addUploadedImage(result);
      notify({ tone: 'success', title: 'Background removed', message: 'A transparent PNG was added to your images.' });
    } catch (error) {
      console.error('Background removal failed:', error);
      notify({ tone: 'error', title: 'Could not remove background', message: 'Use an image uploaded in this session and try again later.' });
    } finally {
      setRemovingBackground(null);
    }
  }, [addUploadedImage, notify]);

  return (
    <div className="sidebar-section">
      <h3>📤 Images</h3>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />

      <div
        className="upload-area"
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <p>⏳ Uploading...</p>
        ) : (
          <>
            <span style={{ fontSize: 24 }}>📁</span>
            <p>Click to upload image<br />PNG, JPG, SVG, WebP (max 10MB)</p>
          </>
        )}
      </div>

      {uploadedImages.length > 0 && (
        <div className="image-grid">
          {uploadedImages.map((img) => (
            <div key={img.filename} className="image-thumb">
              <img
                src={img.url}
                alt={img.filename}
                title="Click to add to canvas"
                onClick={() => handleAddToCanvas(img.url)}
              />
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(img.filename);
                }}
                title="Delete image"
              >
                ✕
              </button>
              <button
                className="remove-background-btn"
                onClick={(event) => { event.stopPropagation(); void handleRemoveBackground(img.filename); }}
                disabled={removingBackground === img.filename}
                title="Remove background"
              >
                {removingBackground === img.filename ? '…' : '✦'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
