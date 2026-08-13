import { useCallback, useEffect, useState } from 'react';
import { GARMENTS, getPhotoTemplate } from '../../lib/garments';
import { exportArtworkOnly } from '../../lib/exportArtwork';
import { getTintedTemplate } from '../../lib/garmentTemplate';
import { getGarmentSurfaceTheme } from '../../lib/garmentSurface';
import { useEditorStore } from '../../stores/editorStore';

export default function MockupPreview() {
  const { activeSide, garmentType, tshirtColor } = useEditorStore();
  const garment = GARMENTS[garmentType];
  const templateUrl = getPhotoTemplate(garmentType, activeSide);
  const surfaceTheme = getGarmentSurfaceTheme(tshirtColor);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [tintedTemplateUrl, setTintedTemplateUrl] = useState(templateUrl);

  const handlePreview = useCallback(() => {
    const canvas = activeSide === 'front'
      ? useEditorStore.getState().frontCanvas
      : useEditorStore.getState().backCanvas;
    if (!canvas) return;
    setDesignUrl(exportArtworkOnly(canvas));
  }, [activeSide]);

  useEffect(() => {
    setDesignUrl(null);
  }, [activeSide, garmentType]);

  useEffect(() => {
    let cancelled = false;
    void getTintedTemplate(templateUrl, tshirtColor).then((url) => {
      if (!cancelled) setTintedTemplateUrl(url);
    });
    return () => { cancelled = true; };
  }, [templateUrl, tshirtColor]);

  return (
    <section className="mockup-panel">
      <div className="section-heading mockup-heading">
        <span>Garment preview</span>
        <small>{garment.label} · {activeSide}</small>
      </div>
      <div className={`photo-mockup garment-surface ${surfaceTheme}`} aria-label={`${garment.label} ${activeSide} preview`}>
        <img className="photo-mockup__template" src={tintedTemplateUrl} alt="Blank garment template" />
        {designUrl && <img className="photo-mockup__artwork" src={designUrl} alt="Your design on the garment" />}
      </div>
      <button type="button" className="btn btn-primary btn-block" onClick={handlePreview}>
        {designUrl ? '↻ Update preview' : '✦ Preview artwork'}
      </button>
      <p className="mockup-note">This is the same photorealistic garment template used in the editor. The artwork layer exports without the shirt background.</p>
    </section>
  );
}
