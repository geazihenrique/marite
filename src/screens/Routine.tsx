import { useMemo, useState } from 'react';
import type { Baby, FormulaCan, RepetitionType, RoutineHistoryAction, RoutineItem, RoutineType, Weekday } from '../types';
import { getAverageCanDuration, getActiveCans, getFinishedCans, inclusiveDays, openedDays } from '../utils/formula';
import { repetitionLabel, routineActionLabel, routineTypeLabel } from '../utils/routine';

type RoutineProps = {
  baby: Baby;
  routineItems: RoutineItem[];
  now: Date;
  onSaveRoutine: (item: RoutineItem) => void;
  onDeleteRoutine: (itemId: string) => void;
  onRoutineAction: (item: RoutineItem, action: RoutineHistoryAction) => void;
  onSaveFormulaCan: (can: FormulaCan) => void;
  onFinishFormulaCan: (canId: string, finishedAt: string) => void;
  onDeleteFormulaCan: (canId: string) => void;
};

const blankRoutine = (): RoutineItem => ({
  id: crypto.randomUUID(),
  type: 'medicine',
  name: '',
  times: ['08:00'],
  date: new Date().toISOString().slice(0, 10),
  location: '',
  notes: '',
  repetition: 'daily',
  weekdays: [],
  active: true,
  createdAt: new Date().toISOString(),
});

const blankCan = (): FormulaCan => ({
  id: crypto.randomUUID(),
  name: '',
  sizeGrams: null,
  openedAt: new Date().toISOString().slice(0, 10),
  finishedAt: '',
  createdAt: new Date().toISOString(),
});

const weekdays: Array<{ value: Weekday; label: string }> = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const repetitions: RepetitionType[] = ['none', 'daily', 'weekdays', 'weekly', 'monthly'];
const types: RoutineType[] = ['medicine', 'task', 'appointment'];

export function Routine({
  baby,
  routineItems,
  now,
  onSaveRoutine,
  onDeleteRoutine,
  onRoutineAction,
  onSaveFormulaCan,
  onFinishFormulaCan,
  onDeleteFormulaCan,
}: RoutineProps) {
  const [editing, setEditing] = useState<RoutineItem | null>(null);
  const [editingCan, setEditingCan] = useState<FormulaCan | null>(null);
  const sortedItems = useMemo(() => [...routineItems].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [routineItems]);
  const activeCans = getActiveCans(baby.formulaCans);
  const finishedCans = getFinishedCans(baby.formulaCans);
  const average = getAverageCanDuration(baby.formulaCans);

  const saveRoutine = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      alert(editing.type === 'appointment' ? 'Informe o título.' : 'Informe o nome.');
      return;
    }
    onSaveRoutine({
      ...editing,
      name: editing.name.trim(),
      times: editing.type === 'appointment' ? editing.times.slice(0, 1) : editing.times.filter(Boolean),
      location: editing.location?.trim(),
      notes: editing.notes?.trim(),
    });
    setEditing(null);
  };

  const saveCan = () => {
    if (!editingCan) return;
    if (!editingCan.name.trim()) {
      alert('Informe o nome da fórmula.');
      return;
    }
    onSaveFormulaCan({
      ...editingCan,
      name: editingCan.name.trim(),
      openedAt: editingCan.openedAt || new Date().toISOString().slice(0, 10),
      finishedAt: editingCan.finishedAt || undefined,
    });
    setEditingCan(null);
  };

  return (
    <main className="screen">
      <header className="screenHeader">
        <div>
          <p>Rotina da família</p>
          <h1>Rotina</h1>
        </div>
        <button className="smallButton" type="button" onClick={() => setEditing(blankRoutine())}>
          Adicionar
        </button>
      </header>

      {editing ? (
        <section className="panel formPanel">
          <label>
            Tipo
            <select value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value as RoutineType })}>
              {types.map((type) => (
                <option key={type} value={type}>{routineTypeLabel[type]}</option>
              ))}
            </select>
          </label>

          <label>
            {editing.type === 'task' ? 'Nome da tarefa' : editing.type === 'appointment' ? 'Título' : 'Nome'}
            <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
          </label>

          {editing.type === 'appointment' ? (
            <>
              <label>
                Data
                <input type="date" value={editing.date ?? ''} onChange={(event) => setEditing({ ...editing, date: event.target.value })} />
              </label>
              <label>
                Horário
                <input
                  type="time"
                  value={editing.times[0] ?? ''}
                  onChange={(event) => setEditing({ ...editing, times: [event.target.value] })}
                />
              </label>
              <label>
                Local
                <input value={editing.location ?? ''} onChange={(event) => setEditing({ ...editing, location: event.target.value })} />
              </label>
            </>
          ) : (
            <label>
              {editing.type === 'task' ? 'Horário' : 'Horários'}
              <input
                value={editing.times.join(', ')}
                placeholder="08:00, 20:00"
                onChange={(event) => setEditing({ ...editing, times: event.target.value.split(',').map((item) => item.trim()) })}
              />
            </label>
          )}

          <label>
            Observação
            <textarea value={editing.notes ?? ''} onChange={(event) => setEditing({ ...editing, notes: event.target.value })} />
          </label>

          <label>
            Repetição
            <select value={editing.repetition} onChange={(event) => setEditing({ ...editing, repetition: event.target.value as RepetitionType })}>
              {repetitions.map((repetition) => (
                <option key={repetition} value={repetition}>{repetitionLabel[repetition]}</option>
              ))}
            </select>
          </label>

          {editing.repetition === 'weekdays' ? (
            <div className="weekdayGrid">
              {weekdays.map((day) => (
                <button
                  className={editing.weekdays.includes(day.value) ? 'selected' : ''}
                  key={day.value}
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      weekdays: editing.weekdays.includes(day.value)
                        ? editing.weekdays.filter((item) => item !== day.value)
                        : [...editing.weekdays, day.value],
                    })
                  }
                >
                  {day.label}
                </button>
              ))}
            </div>
          ) : null}

          <label className="toggleRow">
            Ativo
            <input type="checkbox" checked={editing.active} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} />
          </label>

          <div className="buttonRow">
            <button className="primaryButton" type="button" onClick={saveRoutine}>Salvar</button>
            <button className="ghostButton" type="button" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </section>
      ) : null}

      <section className="medicineList">
        {sortedItems.length ? (
          sortedItems.map((item) => (
            <article className="panel medicineItem" key={item.id}>
              <div className="medicineItem__top">
                <div>
                  <h2>{item.name}</h2>
                  <p>{routineTypeLabel[item.type]} · {item.active ? 'Ativo' : 'Inativo'} · {repetitionLabel[item.repetition]}</p>
                  <span>{item.type === 'appointment' ? `${item.date ?? 'Sem data'} ${item.times[0] ?? ''}` : item.times.join(', ') || 'Sem horário'}</span>
                </div>
                <button type="button" onClick={() => setEditing(item)}>Editar</button>
              </div>
              <div className="buttonRow">
                {item.type === 'medicine' ? (
                  <>
                    <button type="button" onClick={() => onRoutineAction(item, 'medicine_taken')}>Tomou agora</button>
                    <button type="button" onClick={() => onRoutineAction(item, 'medicine_skipped')}>Pular</button>
                  </>
                ) : (
                  <button type="button" onClick={() => onRoutineAction(item, item.type === 'task' ? 'task_completed' : 'appointment_completed')}>
                    Concluir
                  </button>
                )}
                <button className="dangerButton" type="button" onClick={() => onDeleteRoutine(item.id)}>Excluir</button>
              </div>
            </article>
          ))
        ) : (
          <section className="emptyState">
            <strong>Nenhum item de rotina</strong>
            <span>Remédios, tarefas e compromissos aparecem aqui.</span>
          </section>
        )}
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Fórmula</h2>
          <button className="smallButton" type="button" onClick={() => setEditingCan(blankCan())}>Adicionar lata</button>
        </div>
        {average ? <p className="mutedText">Média: {average} {average === 1 ? 'dia' : 'dias'} por lata</p> : null}

        {editingCan ? (
          <div className="formPanel formulaForm">
            <label>
              Nome da fórmula
              <input value={editingCan.name} onChange={(event) => setEditingCan({ ...editingCan, name: event.target.value })} />
            </label>
            <label>
              Tamanho da lata (g)
              <input
                inputMode="numeric"
                value={editingCan.sizeGrams ?? ''}
                onChange={(event) => setEditingCan({ ...editingCan, sizeGrams: Number(event.target.value) || null })}
              />
            </label>
            <label>
              Data de abertura
              <input type="date" value={editingCan.openedAt.slice(0, 10)} onChange={(event) => setEditingCan({ ...editingCan, openedAt: event.target.value })} />
            </label>
            <label>
              Data de término
              <input type="date" value={editingCan.finishedAt?.slice(0, 10) ?? ''} onChange={(event) => setEditingCan({ ...editingCan, finishedAt: event.target.value })} />
            </label>
            <div className="buttonRow">
              <button className="primaryButton" type="button" onClick={saveCan}>Salvar</button>
              <button className="ghostButton" type="button" onClick={() => setEditingCan(null)}>Cancelar</button>
            </div>
          </div>
        ) : null}

        <div className="formulaList">
          {[...activeCans, ...finishedCans].length ? (
            [...activeCans, ...finishedCans].map((can) => (
              <article className="formulaItem" key={can.id}>
                <div>
                  <strong>{can.name}</strong>
                  <span>
                    {can.finishedAt
                      ? `Durou ${inclusiveDays(can.openedAt, can.finishedAt)} ${inclusiveDays(can.openedAt, can.finishedAt) === 1 ? 'dia' : 'dias'}`
                      : `Aberta há ${openedDays(can.openedAt, now)} ${openedDays(can.openedAt, now) === 1 ? 'dia' : 'dias'}`}
                  </span>
                </div>
                <div className="rowActions">
                  {!can.finishedAt ? (
                    <button type="button" onClick={() => onFinishFormulaCan(can.id, new Date().toISOString().slice(0, 10))}>Marcar como finalizada</button>
                  ) : null}
                  <button type="button" onClick={() => setEditingCan(can)}>Editar</button>
                  <button className="dangerButton" type="button" onClick={() => onDeleteFormulaCan(can.id)}>Excluir</button>
                </div>
              </article>
            ))
          ) : (
            <section className="emptyState">
              <strong>Nenhuma lata cadastrada</strong>
            </section>
          )}
        </div>
      </section>

      <p className="medicalText notice">Este app apenas ajuda a organizar horários. Siga sempre a orientação médica.</p>
    </main>
  );
}
