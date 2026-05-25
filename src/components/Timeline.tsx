import type { AppEvent, RoutineHistoryEvent } from '../types';
import { diaperLabel } from './DiaperModal';
import { getFeedingPayload } from '../utils/summary';
import { formatBreastMinutes } from '../utils/feeding';
import { routineActionLabel } from '../utils/routine';
import { formatClock } from '../utils/time';

type TimelineEntry =
  | { kind: 'baby'; event: AppEvent }
  | { kind: 'routine'; event: RoutineHistoryEvent };

type TimelineProps = {
  events: AppEvent[];
  routineEvents?: RoutineHistoryEvent[];
  compact?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (event: AppEvent) => void;
};

const feedingDescription = (event: AppEvent) => {
  const feeding = getFeedingPayload(event.payload);
  const breastParts = [
    feeding.breast.leftSeconds > 0 ? `E ${formatBreastMinutes(feeding.breast.leftSeconds)}` : '',
    feeding.breast.rightSeconds > 0 ? `D ${formatBreastMinutes(feeding.breast.rightSeconds)}` : '',
  ].filter(Boolean);
  const amount = feeding.amountMl ? `${feeding.amountMl} ml` : 'Sem quantidade';
  return [...breastParts, amount].join(' • ');
};

const describeBabyEvent = (event: AppEvent) => {
  switch (event.type) {
    case 'feeding':
      return { title: 'Mamou', description: feedingDescription(event) };
    case 'sleep_start':
      return { title: 'Dormiu', description: 'Início do sono' };
    case 'sleep_end':
      return { title: 'Acordou', description: 'Fim do sono' };
    case 'diaper':
      return { title: 'Fralda', description: diaperLabel(event.payload?.kind) };
    case 'formula_opened':
      return { title: 'Fórmula aberta', description: String(event.payload?.name ?? 'Lata cadastrada') };
    case 'formula_finished':
      return { title: 'Fórmula finalizada', description: String(event.payload?.name ?? 'Lata finalizada') };
    default:
      return { title: 'Registro', description: '' };
  }
};

const describeRoutineEvent = (event: RoutineHistoryEvent) => ({
  title: routineActionLabel[event.action],
  description: `Rotina • ${event.name}`,
});

export function Timeline({ events, routineEvents = [], compact = false, onDelete, onEdit }: TimelineProps) {
  const entries: TimelineEntry[] = [
    ...events.map((event) => ({ kind: 'baby' as const, event })),
    ...routineEvents.map((event) => ({ kind: 'routine' as const, event })),
  ]
    .sort((a, b) => new Date(b.event.createdAt).getTime() - new Date(a.event.createdAt).getTime())
    .slice(0, compact ? 5 : undefined);

  if (!entries.length) {
    return (
      <section className="emptyState">
        <strong>Nenhum registro ainda</strong>
        <span>Os registros aparecem aqui conforme a rotina acontece.</span>
      </section>
    );
  }

  return (
    <div className="timeline">
      {entries.map((entry) => {
        const details = entry.kind === 'baby' ? describeBabyEvent(entry.event as AppEvent) : describeRoutineEvent(entry.event as RoutineHistoryEvent);
        return (
          <article className="timelineItem" key={`${entry.kind}-${entry.event.id}`}>
            <time>{formatClock(entry.event.createdAt)}</time>
            <section>
              <h3>{details.title}</h3>
              {details.description ? <p>{details.description}</p> : null}
              {!compact && entry.kind === 'baby' && onDelete ? (
                <div className="rowActions">
                  {onEdit ? (
                    <button type="button" onClick={() => onEdit(entry.event as AppEvent)}>
                      Editar
                    </button>
                  ) : null}
                  <button type="button" onClick={() => onDelete(entry.event.id)}>
                    Excluir
                  </button>
                </div>
              ) : null}
            </section>
          </article>
        );
      })}
    </div>
  );
}
