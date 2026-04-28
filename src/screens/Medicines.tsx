import { useMemo, useState } from 'react';
import type { AppEvent, Medicine, NextMedicineDose } from '../types';
import { formatClock, remainingText } from '../utils/time';

type MedicinesProps = {
  medicines: Medicine[];
  events: AppEvent[];
  now: Date;
  nextMedicine: NextMedicineDose | null;
  onSave: (medicine: Medicine) => void;
  onDelete: (medicineId: string) => void;
  onDoseTaken: (medicine: Medicine, time: string) => void;
  onDoseSkipped: (medicine: Medicine, time: string) => void;
  onRequestNotifications: () => void;
};

const createBlankMedicine = (): Medicine => ({
  id: crypto.randomUUID(),
  name: '',
  times: ['08:00'],
  notes: '',
  active: true,
  createdAt: new Date().toISOString(),
});

export function Medicines({
  medicines,
  nextMedicine,
  onSave,
  onDelete,
  onDoseTaken,
  onDoseSkipped,
  onRequestNotifications,
}: MedicinesProps) {
  const [editing, setEditing] = useState<Medicine | null>(null);
  const sortedMedicines = useMemo(() => [...medicines].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [medicines]);

  const updateTime = (index: number, value: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      times: editing.times.map((time, timeIndex) => (timeIndex === index ? value : time)).sort(),
    });
  };

  const save = () => {
    if (!editing?.name.trim()) {
      window.alert('Informe o nome do remédio.');
      return;
    }

    onSave({
      ...editing,
      name: editing.name.trim(),
      times: editing.times.filter(Boolean).sort(),
      notes: editing.notes?.trim(),
    });
    setEditing(null);
  };

  return (
    <main className="screen">
      <header className="screenHeader">
        <div>
          <p>Organização da rotina</p>
          <h1>Remédios</h1>
        </div>
        <button className="smallButton" type="button" onClick={() => setEditing(createBlankMedicine())}>
          Adicionar
        </button>
      </header>

      <section className="notice">
        Este app apenas ajuda a organizar horários. Siga sempre a orientação médica.
      </section>

      <section className={`medicineCard ${nextMedicine?.status === 'due' ? 'medicineCard--due' : ''}`}>
        <div>
          <p>Próximo remédio</p>
          {nextMedicine ? (
            <>
              <h2>{nextMedicine.medicine.name}</h2>
              <span>
                {formatClock(nextMedicine.scheduledAt)} · {remainingText(nextMedicine.scheduledAt)}
              </span>
            </>
          ) : (
            <>
              <h2>Nenhum lembrete pendente</h2>
              <span>Cadastre os horários desejados.</span>
            </>
          )}
        </div>
        <button type="button" onClick={onRequestNotifications}>
          Permitir notificações
        </button>
      </section>

      {editing ? (
        <section className="panel formPanel">
          <label>
            Nome do remédio
            <input
              value={editing.name}
              placeholder="Ex.: remédio informado pelo médico"
              onChange={(event) => setEditing({ ...editing, name: event.target.value })}
            />
          </label>
          <label>
            Observação
            <textarea
              value={editing.notes}
              placeholder="Opcional"
              onChange={(event) => setEditing({ ...editing, notes: event.target.value })}
            />
          </label>
          <div className="fieldGroup">
            <span>Horários do dia</span>
            {editing.times.map((time, index) => (
              <div className="timeRow" key={`${time}-${index}`}>
                <input type="time" value={time} onChange={(event) => updateTime(index, event.target.value)} />
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, times: editing.times.filter((_, timeIndex) => timeIndex !== index) })}
                >
                  Excluir
                </button>
              </div>
            ))}
            <button className="ghostButton" type="button" onClick={() => setEditing({ ...editing, times: [...editing.times, '12:00'] })}>
              Adicionar horário
            </button>
          </div>
          <label className="toggleRow">
            <span>Ativo</span>
            <input
              type="checkbox"
              checked={editing.active}
              onChange={(event) => setEditing({ ...editing, active: event.target.checked })}
            />
          </label>
          <div className="buttonRow">
            <button className="primaryButton" type="button" onClick={save}>
              Salvar remédio
            </button>
            <button className="ghostButton" type="button" onClick={() => setEditing(null)}>
              Cancelar
            </button>
          </div>
        </section>
      ) : null}

      <section className="medicineList">
        {sortedMedicines.length ? (
          sortedMedicines.map((medicine) => (
            <article className="panel medicineItem" key={medicine.id}>
              <div className="medicineItem__top">
                <div>
                  <h2>{medicine.name}</h2>
                  <p>{medicine.active ? 'Ativo' : 'Inativo'} · {medicine.times.join(', ')}</p>
                  {medicine.notes ? <span>{medicine.notes}</span> : null}
                </div>
                <button type="button" onClick={() => setEditing(medicine)}>
                  Editar
                </button>
              </div>
              <div className="doseGrid">
                {medicine.times.map((time) => (
                  <div key={time}>
                    <strong>{time}</strong>
                    <button type="button" onClick={() => onDoseTaken(medicine, time)}>
                      Dose tomada
                    </button>
                    <button type="button" onClick={() => onDoseSkipped(medicine, time)}>
                      Pular dose
                    </button>
                  </div>
                ))}
              </div>
              <button className="dangerButton" type="button" onClick={() => onDelete(medicine.id)}>
                Excluir remédio
              </button>
            </article>
          ))
        ) : (
          <section className="emptyState">
            <strong>Nenhum remédio cadastrado</strong>
            <span>Use “Adicionar” para criar o primeiro lembrete.</span>
          </section>
        )}
      </section>
    </main>
  );
}
