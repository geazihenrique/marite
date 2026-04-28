import { durationText } from '../utils/time';

type SummaryCardProps = {
  feedings: number;
  sleepMs: number;
  diapers: number;
  medicinesTaken: number;
  medicinesSkipped: number;
};

export function SummaryCard({ feedings, sleepMs, diapers, medicinesTaken, medicinesSkipped }: SummaryCardProps) {
  return (
    <section className="panel">
      <div className="sectionHeader">
        <h2>Resumo de hoje</h2>
      </div>
      <div className="summaryGrid">
        <div>
          <strong>{feedings}</strong>
          <span>Mamadas</span>
        </div>
        <div>
          <strong>{durationText(sleepMs)}</strong>
          <span>Sono total</span>
        </div>
        <div>
          <strong>{diapers}</strong>
          <span>Fraldas</span>
        </div>
        <div>
          <strong>{medicinesTaken}/{medicinesTaken + medicinesSkipped}</strong>
          <span>Remédios</span>
        </div>
      </div>
    </section>
  );
}
