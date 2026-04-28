import type { AppEvent } from '../types';
import { Timeline } from '../components/Timeline';

type HistoryProps = {
  events: AppEvent[];
  onDelete: (eventId: string) => void;
  onEdit: (event: AppEvent) => void;
};

export function History({ events, onDelete, onEdit }: HistoryProps) {
  return (
    <main className="screen">
      <header className="screenHeader">
        <div>
          <p>Todos os registros</p>
          <h1>Histórico</h1>
        </div>
      </header>
      <Timeline events={events} onDelete={onDelete} onEdit={onEdit} />
    </main>
  );
}
