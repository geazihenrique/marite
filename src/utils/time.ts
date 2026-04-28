export const formatClock = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDateLabel = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const today = startOfDay(new Date()).getTime();
  const target = startOfDay(date).getTime();
  const diffDays = Math.round((target - today) / 86_400_000);

  if (diffDays === 0) return 'Hoje';
  if (diffDays === -1) return 'Ontem';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const elapsedText = (fromInput?: string | Date, toInput: Date = new Date()) => {
  if (!fromInput) return 'sem registro';
  const from = typeof fromInput === 'string' ? new Date(fromInput) : fromInput;
  const diffMs = Math.max(0, toInput.getTime() - from.getTime());
  return durationText(diffMs);
};

export const durationText = (durationMs: number) => {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
};

export const remainingText = (target: Date, now: Date = new Date()) => {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'Agora';
  return `em ${durationText(diffMs)}`;
};

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const isToday = (iso: string) => {
  const date = new Date(iso);
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());
  return date >= start && date <= end;
};

export const timeToDateToday = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

export const combineTodayWithTime = (time: string, baseIso: string) => {
  const base = new Date(baseIso);
  const [hours, minutes] = time.split(':').map(Number);
  base.setHours(hours || 0, minutes || 0, 0, 0);
  return base.toISOString();
};
