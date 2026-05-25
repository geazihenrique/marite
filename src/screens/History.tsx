import type { AppEvent, Baby, RoutineHistoryEvent } from '../types';
import { Timeline } from '../components/Timeline';

type HistoryProps = {
  baby: Baby;
  events: AppEvent[];
  routineHistory: RoutineHistoryEvent[];
  onDelete: (eventId: string) => void;
  onEdit?: (event: AppEvent) => void;
};

export function History({ baby, events, routineHistory, onDelete, onEdit }: HistoryProps) {
  return (
    <main className="screen">
      <header className="screenHeader">
        <div>
          <p>Histórico</p>
          <h1>{baby.name}</h1>
        </div>
      </header>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Registros do bebê</h2>
        </div>
        <Timeline events={events} routineEvents={routineHistory} onDelete={onDelete} onEdit={onEdit} />
      </section>
    </main>
  );
}
