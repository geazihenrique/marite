import type { AppEvent, DiaperKind, NextMedicineDose } from '../types';
import { ActionButton } from '../components/ActionButton';
import { StatusCard } from '../components/StatusCard';
import { SummaryCard } from '../components/SummaryCard';
import { Timeline } from '../components/Timeline';
import { diaperLabel } from '../components/DiaperModal';
import { elapsedText, formatClock, remainingText } from '../utils/time';
import { getDailySummary, getLastDiaper, getLastFeeding } from '../utils/summary';

type HomeProps = {
  babyName: string;
  events: AppEvent[];
  now: Date;
  sleepingSince?: AppEvent;
  lastWake?: AppEvent;
  nextMedicine: NextMedicineDose | null;
  onFeeding: () => void;
  onSleepStart: () => void;
  onWake: () => void;
  onOpenDiaper: () => void;
  onMedicineTaken: (dose: NextMedicineDose) => void;
};

export function Home({
  babyName,
  events,
  now,
  sleepingSince,
  lastWake,
  nextMedicine,
  onFeeding,
  onSleepStart,
  onWake,
  onOpenDiaper,
  onMedicineTaken,
}: HomeProps) {
  const lastFeeding = getLastFeeding(events);
  const lastDiaper = getLastDiaper(events);
  const summary = getDailySummary(events, now);
  const statusTitle = sleepingSince
    ? `Dormindo há ${elapsedText(sleepingSince.createdAt, now)}`
    : lastWake
      ? `Acordado há ${elapsedText(lastWake.createdAt, now)}`
      : 'Acordado';

  return (
    <main className="screen">
      <header className="hero">
        <p>{babyName ? `Rotina de ${babyName}` : 'Rotina do bebê'}</p>
        <h1>Rotina do bebê</h1>
      </header>

      <StatusCard
        eyebrow={sleepingSince ? 'Sono agora' : 'Status agora'}
        title={statusTitle}
        subtitle={lastFeeding ? `Mamou há ${elapsedText(lastFeeding.createdAt, now)}` : 'Nenhuma mamada registrada hoje'}
      />

      <section className={`medicineCard ${nextMedicine?.status === 'due' ? 'medicineCard--due' : ''}`}>
        <div>
          <p>Próximo remédio</p>
          {nextMedicine ? (
            <>
              <h2>{nextMedicine.medicine.name}</h2>
              <span>
                {formatClock(nextMedicine.scheduledAt)} · {remainingText(nextMedicine.scheduledAt, now)}
              </span>
            </>
          ) : (
            <>
              <h2>Nenhum lembrete pendente</h2>
              <span>Adicione horários na tela Remédios.</span>
            </>
          )}
        </div>
        {nextMedicine ? (
          <button type="button" onClick={() => onMedicineTaken(nextMedicine)}>
            Tomou agora
          </button>
        ) : null}
      </section>

      <section className="quickActions" aria-label="Ações rápidas">
        <ActionButton icon="M" label="Mamou agora" tone="primary" onClick={onFeeding} />
        <ActionButton icon="Zz" label="Dormiu agora" tone="sleep" onClick={onSleepStart} />
        <ActionButton icon="Sol" label="Acordou agora" tone="wake" onClick={onWake} />
        <ActionButton
          icon="F"
          label="Troca de fralda"
          hint={lastDiaper ? `Última: ${diaperLabel(lastDiaper.payload?.kind)} às ${formatClock(lastDiaper.createdAt)}` : 'Escolher tipo'}
          onClick={onOpenDiaper}
        />
      </section>

      <SummaryCard {...summary} />

      <section className="panel">
        <div className="sectionHeader">
          <h2>Histórico recente</h2>
        </div>
        <Timeline events={events} compact />
      </section>
    </main>
  );
}
