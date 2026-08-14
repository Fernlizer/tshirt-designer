import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Tone = 'success' | 'error' | 'info';

interface Toast {
  title: string;
  message?: string;
  tone: Tone;
}

interface Confirmation {
  title: string;
  message: string;
  confirmLabel: string;
  tone: 'danger' | 'primary';
}

interface FeedbackContextValue {
  notify: (toast: Toast) => void;
  confirm: (confirmation: Confirmation) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const toastTimer = useRef<number | null>(null);
  const confirmResolver = useRef<((confirmed: boolean) => void) | null>(null);

  const notify = useCallback((nextToast: Toast) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(nextToast);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  const confirm = useCallback((nextConfirmation: Confirmation) => new Promise<boolean>((resolve) => {
    confirmResolver.current = resolve;
    setConfirmation(nextConfirmation);
  }), []);

  const resolveConfirmation = useCallback((confirmed: boolean) => {
    confirmResolver.current?.(confirmed);
    confirmResolver.current = null;
    setConfirmation(null);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    confirmResolver.current?.(false);
  }, []);

  return (
    <FeedbackContext.Provider value={{ notify, confirm }}>
      {children}
      {toast && (
        <div className={`app-toast app-toast--${toast.tone}`} role="status" aria-live="polite">
          <span className="app-toast__icon">{toast.tone === 'success' ? '✓' : toast.tone === 'error' ? '!' : 'i'}</span>
          <div><strong>{toast.title}</strong>{toast.message && <p>{toast.message}</p>}</div>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}
      {confirmation && (
        <div className="feedback-dialog-backdrop" role="presentation">
          <section className="feedback-dialog" role="alertdialog" aria-modal="true" aria-labelledby="feedback-dialog-title">
            <span className={`feedback-dialog__icon feedback-dialog__icon--${confirmation.tone}`}>{confirmation.tone === 'danger' ? '!' : '?'}</span>
            <h2 id="feedback-dialog-title">{confirmation.title}</h2>
            <p>{confirmation.message}</p>
            <div className="feedback-dialog__actions">
              <button type="button" className="btn btn-secondary" onClick={() => resolveConfirmation(false)}>Cancel</button>
              <button type="button" className={`btn ${confirmation.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={() => resolveConfirmation(true)}>{confirmation.confirmLabel}</button>
            </div>
          </section>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const feedback = useContext(FeedbackContext);
  if (!feedback) throw new Error('useFeedback must be used inside FeedbackProvider');
  return feedback;
}
