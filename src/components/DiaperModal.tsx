import type { DiaperKind } from '../types';

const options: Array<{ value: DiaperKind; label: string }> = [
  { value: 'xixi', label: 'Xixi' },
  { value: 'coco', label: 'Cocô' },
  { value: 'xixi_coco', label: 'Xixi + cocô' },
  { value: 'dry', label: 'Fralda seca' },
];

type DiaperModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (kind: DiaperKind) => void;
};

export function diaperLabel(kind?: unknown) {
  return options.find((option) => option.value === kind)?.label ?? 'Fralda';
}

export function DiaperModal({ open, onClose, onSelect }: DiaperModalProps) {
  if (!open) return null;

  return (
    <div className="sheetOverlay" role="presentation" onClick={onClose}>
      <section className="bottomSheet" role="dialog" aria-modal="true" aria-labelledby="diaper-title" onClick={(event) => event.stopPropagation()}>
        <div className="sheetHandle" />
        <h2 id="diaper-title">Troca de fralda</h2>
        <div className="sheetOptions">
          {options.map((option) => (
            <button key={option.value} type="button" onClick={() => onSelect(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
        <button className="ghostButton" type="button" onClick={onClose}>
          Cancelar
        </button>
      </section>
    </div>
  );
}
