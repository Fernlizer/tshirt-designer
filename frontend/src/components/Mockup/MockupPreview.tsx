import { useCallback, useEffect, useState } from 'react';
import { GARMENTS, getPhotoTemplate } from '../../lib/garments';
import { exportArtworkOnly } from '../../lib/exportArtwork';
import { exportCombinedMockup } from '../../lib/exportMockup';
import { getTintedTemplate } from '../../lib/garmentTemplate';
import { getGarmentSurfaceTheme } from '../../lib/garmentSurface';
import { useEditorStore, type Side } from '../../stores/editorStore';

type SideUrls = Record<Side, string | null>;

const emptySideUrls: SideUrls = { front: null, back: null };

export default function MockupPreview() {
  const { garmentType, tshirtColor, mockupCredit, setMockupCredit } = useEditorStore();
  const garment = GARMENTS[garmentType];
  const surfaceTheme = getGarmentSurfaceTheme(tshirtColor);
  const [designUrls, setDesignUrls] = useState<SideUrls>(emptySideUrls);
  const [templateUrls, setTemplateUrls] = useState<SideUrls>({
    front: getPhotoTemplate(garmentType, 'front'),
    back: getPhotoTemplate(garmentType, 'back'),
  });
  const [isExporting, setIsExporting] = useState(false);

  const handlePreview = useCallback(() => {
    const { frontCanvas, backCanvas } = useEditorStore.getState();
    setDesignUrls({
      front: frontCanvas ? exportArtworkOnly(frontCanvas) : null,
      back: backCanvas ? exportArtworkOnly(backCanvas) : null,
    });
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const { frontCanvas, backCanvas } = useEditorStore.getState();
      const dataUrl = await exportCombinedMockup({
        garmentType,
        tshirtColor,
        frontCanvas,
        backCanvas,
        credit: mockupCredit,
      });
      const link = document.createElement('a');
      link.download = 'tshirt-front-back-mockup.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export combined mockup:', error);
      alert('Could not export the combined mockup. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [garmentType, mockupCredit, tshirtColor]);

  useEffect(() => {
    setDesignUrls(emptySideUrls);
  }, [garmentType]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all((['front', 'back'] as Side[]).map(async (side) => [
      side,
      await getTintedTemplate(getPhotoTemplate(garmentType, side), tshirtColor),
    ] as const)).then((entries) => {
      if (!cancelled) setTemplateUrls(Object.fromEntries(entries) as SideUrls);
    });
    return () => { cancelled = true; };
  }, [garmentType, tshirtColor]);

  return (
    <section className="mockup-panel">
      <div className="section-heading mockup-heading">
        <span>Garment preview</span>
        <small>{garment.label} · front + back</small>
      </div>
      <div className="mockup-pair" aria-label={`${garment.label} front and back preview`}>
        {(['front', 'back'] as Side[]).map((side) => (
          <article className="mockup-side" key={side}>
            <span className="mockup-side__label">{side}</span>
            <div className={`photo-mockup garment-surface ${surfaceTheme}`}>
              <img className="photo-mockup__template" src={templateUrls[side] ?? undefined} alt={`Blank garment ${side}`} />
              {designUrls[side] && <img className="photo-mockup__artwork" src={designUrls[side]} alt={`Your ${side} design`} />}
            </div>
          </article>
        ))}
      </div>
      <label className="mockup-credit">
        <span>Export credit <small>optional</small></span>
        <input
          type="text"
          value={mockupCredit}
          onChange={(event) => setMockupCredit(event.target.value.slice(0, 160))}
          placeholder="e.g. © Studio Name 2026"
          maxLength={160}
        />
      </label>
      <button type="button" className="btn btn-primary btn-block" onClick={handlePreview}>
        {designUrls.front || designUrls.back ? '↻ Update both previews' : '✦ Preview front + back'}
      </button>
      <button type="button" className="btn btn-secondary btn-block" onClick={() => void handleExport()} disabled={isExporting}>
        {isExporting ? '⏳ Exporting…' : '⇩ Export combined PNG'}
      </button>
      <p className="mockup-note">The export combines both garment sides in one PNG and adds your credit in the lower-right corner.</p>
    </section>
  );
}
