import { useRef, useCallback, useEffect, useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { uploadImage, listImages, deleteImage } from '../../api/client';

export default function ImageUploader() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadedImages, addUploadedImage, removeUploadedImage, setUploadedImages, getActiveCanvas } = useEditorStore();
  const [uploading, setUploading] = useState(false);

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
      alert('Upload failed. Please check file size and format.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [addUploadedImage]);

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
