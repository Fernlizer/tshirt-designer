import { GARMENTS, GARMENT_TYPES, hasPhotoTemplate } from '../../lib/garments';
import { useEditorStore } from '../../stores/editorStore';

export default function GarmentPicker() {
  const { garmentType, setGarmentType } = useEditorStore();

  return (
    <section className="sidebar-section garment-picker">
      <div className="section-heading">
        <span>Garment</span>
        <small>Style</small>
      </div>
      <div className="garment-options" role="radiogroup" aria-label="Garment style">
        {GARMENT_TYPES.map((type) => {
          const garment = GARMENTS[type];
          const isAvailable = hasPhotoTemplate(type);
          return (
            <button
              key={type}
              className={`garment-option ${garmentType === type ? 'is-active' : ''}`}
              onClick={() => setGarmentType(type)}
              disabled={!isAvailable}
              type="button"
              role="radio"
              aria-checked={garmentType === type}
            >
              <strong>{garment.label}</strong>
              <span>{isAvailable ? garment.description : 'Photo template coming next'}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
