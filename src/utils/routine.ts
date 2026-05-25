import type { RepetitionType, RoutineHistoryAction, RoutineItem, RoutineType } from '../types';

export const routineTypeLabel: Record<RoutineType, string> = {
  medicine: 'Remédio',
  task: 'Tarefa',
  appointment: 'Compromisso',
};

export const repetitionLabel: Record<RepetitionType, string> = {
  none: 'Não repetir',
  daily: 'Todos os dias',
  weekdays: 'Dias específicos da semana',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export const routineActionLabel: Record<RoutineHistoryAction, string> = {
  medicine_taken: 'Remédio tomado',
  medicine_skipped: 'Remédio pulado',
  task_completed: 'Tarefa concluída',
  appointment_completed: 'Compromisso concluído',
};

const todayIso = (now: Date) => now.toISOString().slice(0, 10);

const dateTimeFor = (date: string, time?: string) => {
  const [hours, minutes] = (time || '23:59').split(':').map(Number);
  const value = new Date(`${date}T00:00:00`);
  value.setHours(hours || 0, minutes || 0, 0, 0);
  return value;
};

const candidateDates = (item: RoutineItem, now: Date) => {
  const today = todayIso(now);
  if (item.type === 'appointment' && item.date) return [item.date];
  if (item.repetition === 'none') return item.date ? [item.date] : [today];
  return [today];
};

export const getRoutineDateTime = (item: RoutineItem, now: Date = new Date()) => {
  const time = item.times[0];
  const dates = candidateDates(item, now);
  return dateTimeFor(dates[0], time);
};

export const getUpcomingRoutineItems = (items: RoutineItem[], limit = 2, now: Date = new Date()) =>
  items
    .filter((item) => item.active)
    .map((item) => ({ item, dateTime: getRoutineDateTime(item, now) }))
    .filter(({ dateTime, item }) => item.repetition !== 'none' || dateTime.getTime() >= new Date(now.toDateString()).getTime())
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    .slice(0, limit);

export const formatRoutineWhen = (dateTime: Date, now: Date = new Date()) => {
  const today = todayIso(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = dateTime.toISOString().slice(0, 10);
  const time = dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (date === today) return time;
  if (date === todayIso(tomorrow)) return `Amanhã ${time}`;
  return `${dateTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${time}`;
};
