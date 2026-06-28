import type { AppData, Baby, FormulaCan, RoutineHistoryEvent, RoutineItem } from '../types';

const STORAGE_KEY = 'rotina-do-bebe:v2';

export const createEmptyData = (): AppData => ({
  version: 2,
  activeBabyId: '',
  babies: [],
  routineItems: [],
  routineHistory: [],
});

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object');

const safeString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

const safeNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const normalizeBaby = (value: unknown): Baby | null => {
  if (!isRecord(value)) return null;
  const id = safeString(value.id);
  const name = safeString(value.name);
  const birthDate = safeString(value.birthDate);
  if (!id || !name || !birthDate) return null;

  return {
    id,
    name,
    birthDate,
    events: Array.isArray(value.events) ? value.events.filter(isRecord).map((event) => ({
      id: safeString(event.id, crypto.randomUUID()),
      type: safeString(event.type) as Baby['events'][number]['type'],
      createdAt: safeString(event.createdAt, new Date().toISOString()),
      payload: isRecord(event.payload) ? event.payload : undefined,
    })) : [],
    formulaCans: Array.isArray(value.formulaCans) ? value.formulaCans.filter(isRecord).map((can): FormulaCan => ({
      id: safeString(can.id, crypto.randomUUID()),
      name: safeString(can.name),
      sizeGrams: safeNumber(can.sizeGrams),
      openedAt: safeString(can.openedAt),
      finishedAt: safeString(can.finishedAt) || undefined,
      createdAt: safeString(can.createdAt, new Date().toISOString()),
    })).filter((can) => can.id && can.name && can.openedAt) : [],
    activeFeedingSession: isRecord(value.activeFeedingSession)
      ? {
          id: safeString(value.activeFeedingSession.id, crypto.randomUUID()),
          startedAt: safeString(value.activeFeedingSession.startedAt, new Date().toISOString()),
          updatedAt: safeString(value.activeFeedingSession.updatedAt, new Date().toISOString()),
          leftSeconds: safeNumber(value.activeFeedingSession.leftSeconds) ?? 0,
          rightSeconds: safeNumber(value.activeFeedingSession.rightSeconds) ?? 0,
          runningSide: value.activeFeedingSession.runningSide === 'left' || value.activeFeedingSession.runningSide === 'right' ? value.activeFeedingSession.runningSide : null,
          lastSide: value.activeFeedingSession.lastSide === 'left' || value.activeFeedingSession.lastSide === 'right' ? value.activeFeedingSession.lastSide : null,
          amountMl: safeNumber(value.activeFeedingSession.amountMl),
        }
      : null,
  };
};

const normalizeRoutineItem = (value: unknown): RoutineItem | null => {
  if (!isRecord(value)) return null;
  const id = safeString(value.id);
  const name = safeString(value.name);
  if (!id || !name) return null;
  return {
    id,
    type: ['medicine', 'task', 'appointment'].includes(safeString(value.type)) ? safeString(value.type) as RoutineItem['type'] : 'task',
    name,
    times: Array.isArray(value.times) ? value.times.filter((time): time is string => typeof time === 'string') : [],
    date: safeString(value.date) || undefined,
    location: safeString(value.location) || undefined,
    notes: safeString(value.notes) || undefined,
    repetition: ['none', 'daily', 'weekdays', 'weekly', 'monthly'].includes(safeString(value.repetition)) ? safeString(value.repetition) as RoutineItem['repetition'] : 'none',
    weekdays: Array.isArray(value.weekdays) ? value.weekdays.filter((day): day is RoutineItem['weekdays'][number] => typeof day === 'number' && day >= 0 && day <= 6) : [],
    active: typeof value.active === 'boolean' ? value.active : true,
    createdAt: safeString(value.createdAt, new Date().toISOString()),
  };
};

const normalizeRoutineHistory = (value: unknown): RoutineHistoryEvent | null => {
  if (!isRecord(value)) return null;
  const id = safeString(value.id);
  const name = safeString(value.name);
  if (!id || !name) return null;
  return {
    id,
    routineItemId: safeString(value.routineItemId),
    type: ['medicine', 'task', 'appointment'].includes(safeString(value.type)) ? safeString(value.type) as RoutineHistoryEvent['type'] : 'task',
    action: ['medicine_taken', 'medicine_skipped', 'task_completed', 'appointment_completed'].includes(safeString(value.action)) ? safeString(value.action) as RoutineHistoryEvent['action'] : 'task_completed',
    name,
    createdAt: safeString(value.createdAt, new Date().toISOString()),
  };
};

export const normalizeData = (input: unknown): AppData => {
  if (!isRecord(input) || input.version !== 2) return createEmptyData();
  const babies = Array.isArray(input.babies) ? input.babies.map(normalizeBaby).filter((baby): baby is Baby => Boolean(baby)).slice(0, 3) : [];
  const activeBabyId = babies.some((baby) => baby.id === input.activeBabyId) ? String(input.activeBabyId) : babies[0]?.id ?? '';
  return {
    version: 2,
    activeBabyId,
    babies,
    routineItems: Array.isArray(input.routineItems) ? input.routineItems.map(normalizeRoutineItem).filter((item): item is RoutineItem => Boolean(item)) : [],
    routineHistory: Array.isArray(input.routineHistory) ? input.routineHistory.map(normalizeRoutineHistory).filter((event): event is RoutineHistoryEvent => Boolean(event)) : [],
  };
};

export const loadData = (): AppData => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeData(JSON.parse(raw)) : createEmptyData();
  } catch {
    return createEmptyData();
  }
};

export const saveData = (data: AppData) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
};

export const exportData = (data: AppData) => {
  const blob = new Blob([JSON.stringify(normalizeData(data), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `jornada-mavie-dados-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const importDataFromFile = (file: File): Promise<AppData> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(normalizeData(JSON.parse(String(reader.result))));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
