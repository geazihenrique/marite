import { useState } from 'react';
import './FeedingModal.css';

const quickAmounts = [30, 60, 90, 120, 150, 180];

type FeedingModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (amountMl: number | null) => void;
};

export function getFeedingAmount(eventPayload?: Record<string, unknown>) {
  const amount = eventPayload?.amountMl;
  return typeof amount === 'number' && Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function FeedingModal({ open, onClose, onSave }: FeedingModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  if (!open) return null;

  const resetAndClose = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    onClose();
  };

  const saveWithAmount = () => {
    const parsedCustomAmount = Number(customAmount.replace(',', '.'));
    const amountMl = customAmount ? parsedCustomAmount : selectedAmount;

    if (!amountMl || !Number.isFinite(amountMl) || amountMl <= 0) {
      window.alert('Informe uma quantidade válida em ml.');
      return;
    }

    onSave(amountMl);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const saveWithoutAmount = () => {
    onSave(null);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  return (
    <div className="sheetOverlay" role="presentation" onClick={resetAndClose}>
      <section className="bottomSheet" role="dialog" aria-modal="true" aria-labelledby="feeding-title" onClick={(event) => event.stopPropagation()}>
        <div className="sheetHandle" />
        <h2 id="feeding-title">Quanto o bebê mamou?</h2>
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
          <button className="primaryButton" type="button" disabled={!selectedAmount && !customAmount} onClick={saveWithAmount}>
            Salvar mamada
          </button>
          <button className="ghostButton" type="button" onClick={saveWithoutAmount}>
            Registrar sem ml
          </button>
          <button className="ghostButton" type="button" onClick={resetAndClose}>
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}
