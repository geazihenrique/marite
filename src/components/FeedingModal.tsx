import { useEffect, useState } from 'react';
import type { ActiveFeedingSession, BreastSide } from '../types';
import { formatTimer } from '../utils/feeding';
import './FeedingModal.css';

const quickAmounts = [30, 60, 90, 120, 150, 180];

type FeedingModalProps = {
  open: boolean;
  session: ActiveFeedingSession | null;
  now: Date;
  onClose: () => void;
  onToggleSide: (side: BreastSide) => void;
  onSave: (amountMl: number | null) => void;
};

export function FeedingModal({ open, session, now, onClose, onToggleSide, onSave }: FeedingModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedAmount(session?.amountMl ?? null);
      setCustomAmount('');
    }
  }, [open, session?.id]);

  if (!open || !session) return null;

  const hasUnsavedSession = Boolean(session.leftSeconds || session.rightSeconds || selectedAmount || customAmount);

  const closeWithConfirmation = () => {
    if (hasUnsavedSession && !window.confirm('Descartar esta mamada?')) return;
    onClose();
  };

  const saveWithAmount = () => {
    const parsedCustomAmount = Number(customAmount.replace(',', '.'));
    const amountMl = customAmount ? parsedCustomAmount : selectedAmount;

    if (customAmount && (!Number.isFinite(parsedCustomAmount) || parsedCustomAmount <= 0)) {
      window.alert('Informe uma quantidade válida em ml.');
      return;
    }

    onSave(amountMl && amountMl > 0 ? amountMl : null);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const saveWithoutAmount = () => {
    onSave(null);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const sideButton = (side: BreastSide, label: string, seconds: number) => (
    <button
      className={`breastSide ${session.runningSide === side ? 'active' : ''}`}
      type="button"
      onClick={() => onToggleSide(side)}
    >
      <span>{side === 'left' ? 'E' : 'D'}</span>
      <strong>{label}</strong>
      <time>{formatTimer(seconds)}</time>
    </button>
  );

  return (
    <div className="sheetOverlay" role="presentation" onClick={closeWithConfirmation}>
      <section className="bottomSheet" role="dialog" aria-modal="true" aria-labelledby="feeding-title" onClick={(event) => event.stopPropagation()}>
        <div className="sheetHandle" />
        <h2 id="feeding-title">Mamada</h2>
        <p className="sheetHint">Toque no lado que o bebê está mamando.</p>
        <div className="breastIllustration" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="breastGrid">
          {sideButton('left', 'Esquerdo', session.leftSeconds)}
          {sideButton('right', 'Direito', session.rightSeconds)}
        </div>
        <div className="quickAmountGrid">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              className={selectedAmount === amount ? 'selected' : ''}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
            >
              {amount} ml
            </button>
          ))}
        </div>
        <label className="amountField">
          Quantidade personalizada
          <span>
            <input
              inputMode="decimal"
              min="1"
              placeholder="0"
              type="number"
              value={customAmount}
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setSelectedAmount(null);
              }}
            />
            <strong>ml</strong>
          </span>
        </label>
        <div className="sheetActions">
          <button className="primaryButton" type="button" onClick={saveWithAmount}>
            Finalizar mamada
          </button>
          <button className="ghostButton" type="button" onClick={saveWithoutAmount}>
            Registrar sem ml
          </button>
          <button className="ghostButton" type="button" onClick={closeWithConfirmation}>
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}
