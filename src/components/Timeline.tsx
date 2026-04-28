import type { AppEvent } from '../types';
import { diaperLabel } from './DiaperModal';
import { formatClock, formatDateLabel } from '../utils/time';

type TimelineProps = {
  events: AppEvent[];
  compact?: boolean;
  onDelete?: (eventId: string) => void;
  onEdit?: (event: AppEvent) => void;
};

const getEventText = (event: AppEvent) => {
  switch (event.type) {
    case 'feeding':
      return { title: 'Mamou', description: 'Mamadeira ou amamentação registrada' };
    case 'sleep_start':
      return { title: 'Dormiu', description: 'Início do sono' };
    case 'sleep_end':
      return { title: 'Acordou', description: 'Fim do sono' };
    case 'diaper':
      return { title: 'Troca de fralda', description: diaperLabel(event.payload?.kind) };
    case 'medicine_taken':
      return { title: 'Dose tomada', description: String(event.payload?.medicineName ?? 'Remédio') };
    case 'medicine_skipped':
      return { title: 'Dose pulada', description: String(event.payload?.medicineName ?? 'Remédio') };
    default:
      return { title: 'Registro', description: 'Evento registrado' };
  }
};

export function Timeline({ events, compact = false, onDelete, onEdit }: TimelineProps) {
  const sorted = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const visible = compact ? sorted.slice(0, 5) : sorted;

  if (!visible.length) {
    return (
      <section className="emptyState">
        <strong>Nenhum registro ainda</strong>
        <span>Os próximos eventos aparecerão aqui.</span>
      </section>
    );
  }

  return (
    <div className="timeline">
      {visible.map((event) => {
        const text = getEventText(event);
        return (
          <article className="timelineItem" key={event.id}>
            <div>
              <time>{formatClock(event.createdAt)}</time>
              {!compact ? <small>{formatDateLabel(event.createdAt)}</small> : null}
            </div>
            <section>
              <h3>{text.title}</h3>
              <p>{text.description}</p>
              {!compact && (onDelete || onEdit) ? (
                <div className="rowActions">
                  {onEdit ? (
                    <button type="button" onClick={() => onEdit(event)}>
                      Editar
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button type="button" onClick={() => onDelete(event.id)}>
                      Excluir
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          </article>
        );
      })}
    </div>
  );
}
