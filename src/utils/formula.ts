import type { FormulaCan } from '../types';

const startOfLocalDay = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const inclusiveDays = (from: string, to: string) => {
  const diff = startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime();
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
};

export const openedDays = (openedAt: string, now: Date = new Date()) => inclusiveDays(openedAt, now.toISOString().slice(0, 10));

export const getActiveCans = (cans: FormulaCan[]) => cans.filter((can) => can.openedAt && !can.finishedAt);

export const getFinishedCans = (cans: FormulaCan[]) => cans.filter((can) => can.openedAt && can.finishedAt);

export const getAverageCanDuration = (cans: FormulaCan[]) => {
  const finished = getFinishedCans(cans);
  if (!finished.length) return null;
  const total = finished.reduce((sum, can) => sum + inclusiveDays(can.openedAt, can.finishedAt!), 0);
  return Math.round(total / finished.length);
};
