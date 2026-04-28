import type { AppEvent, Medicine, NextMedicineDose } from '../types';
import { timeToDateToday } from './time';

const medicineDoseKey = (medicineId: string, time: string) => `${medicineId}:${time}:${new Date().toISOString().slice(0, 10)}`;

export const getMedicineDoseKey = medicineDoseKey;

export const hasDoseRecord = (events: AppEvent[], medicineId: string, time: string) =>
  events.some((event) => {
    if (event.type !== 'medicine_taken' && event.type !== 'medicine_skipped') return false;
    return event.payload?.doseKey === medicineDoseKey(medicineId, time);
  });

export const findNextMedicine = (medicines: Medicine[], events: AppEvent[], now: Date = new Date()): NextMedicineDose | null => {
  const candidates = medicines
    .filter((medicine) => medicine.active)
    .flatMap((medicine) =>
      medicine.times
        .filter((time) => !hasDoseRecord(events, medicine.id, time))
        .map((time) => ({
          medicine,
          time,
          scheduledAt: timeToDateToday(time),
        }))
    )
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const upcoming = candidates.find((candidate) => candidate.scheduledAt.getTime() >= now.getTime() - 60_000);
  const overdue = candidates.find((candidate) => candidate.scheduledAt.getTime() < now.getTime());
  const next = upcoming ?? overdue ?? null;

  if (!next) return null;

  return {
    ...next,
    status: next.scheduledAt.getTime() <= now.getTime() ? 'due' : 'pending',
  };
};
