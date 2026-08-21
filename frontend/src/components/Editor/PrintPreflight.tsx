import { useCallback, useEffect, useState } from 'react';
import { type PreflightResult, fitObjectInsidePrintArea, getPrintableLayerName, runPrintPreflight } from '../../lib/printPreflight';
import { useEditorStore } from '../../stores/editorStore';

export default function PrintPreflight() {
  const { activeSide, garmentType, getActiveCanvas } = useEditorStore();
  const [result, setResult] = useState<PreflightResult | null>(null);

  useEffect(() => {
    setResult(null);
  }, [activeSide, garmentType]);

  const runCheck = useCallback(() => {
    setResult(runPrintPreflight(getActiveCanvas(), garmentType));
  }, [garmentType, getActiveCanvas]);

  const handleFit = useCallback((issue: PreflightResult['issues'][number]) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    fitObjectInsidePrintArea(canvas, issue.object, garmentType);
    setResult(runPrintPreflight(canvas, garmentType));
  }, [garmentType, getActiveCanvas]);

  const placementIssues = result?.issues.filter((issue) => issue.code === 'outside-safe-area') ?? [];
  const smallLayerIssues = result?.issues.filter((issue) => issue.code === 'small-layer') ?? [];
  const placementPasses = result && result.artworkCount > 0 && placementIssues.length === 0;

  return (
    <section className="print-preflight" aria-label="Print readiness check">
      <div className="section-heading">
        <span>Print readiness</span>
        <small>{activeSide} side</small>
      </div>
      <p className="print-preflight__intro">Checks the current side against this garment&apos;s safe print area and offers one-click placement fixes.</p>
      <button type="button" className="btn btn-secondary btn-block" onClick={runCheck}>
        ✓ Run print check
      </button>

      {result && (
        <div className="print-preflight__results" role="status">
          {result.artworkCount === 0 && <p className="print-preflight__result is-error">Add artwork before sending this side to print.</p>}
          {placementPasses && <p className="print-preflight__result is-pass">Placement passes for {result.artworkCount} printable {result.artworkCount === 1 ? 'layer' : 'layers'}.</p>}
          {placementIssues.map((issue) => (
            <div className="print-preflight__issue is-error" key={`${issue.objectIndex}-${issue.code}`}>
              <p><strong>{getPrintableLayerName(issue.object, issue.objectIndex)}</strong> · {issue.message}</p>
              <button type="button" className="print-preflight__fix" onClick={() => handleFit(issue)}>Fit inside safe area</button>
            </div>
          ))}
          {smallLayerIssues.map((issue) => (
            <p className="print-preflight__issue is-warning" key={`${issue.objectIndex}-${issue.code}`}>
              <strong>{getPrintableLayerName(issue.object, issue.objectIndex)}</strong> · {issue.message}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
