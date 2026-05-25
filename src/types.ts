export type EventType = 'feeding' | 'sleep_start' | 'sleep_end' | 'diaper' | 'formula_opened' | 'formula_finished';

export type DiaperKind = 'xixi' | 'coco' | 'xixi_coco' | 'dry';

export type BreastSide = 'left' | 'right';

export type BreastTimer = {
  leftSeconds: number;
  rightSeconds: number;
  totalSeconds: number;
  lastSide: BreastSide | null;
};

export type FeedingPayload = {
  amountMl: number | null;
  breast: BreastTimer;
};

export type ActiveFeedingSession = {
  id: string;
  startedAt: string;
  updatedAt: string;
  leftSeconds: number;
  rightSeconds: number;
  runningSide: BreastSide | null;
  lastSide: BreastSide | null;
  amountMl: number | null;
};

export type AppEvent = {
  id: string;
  type: EventType;
  createdAt: string;
  payload?: Record<string, unknown>;
};

export type FormulaCan = {
  id: string;
  name: string;
  sizeGrams: number | null;
  openedAt: string;
  finishedAt?: string;
  createdAt: string;
};

export type Baby = {
  id: string;
  name: string;
  birthDate: string;
  events: AppEvent[];
  formulaCans: FormulaCan[];
  activeFeedingSession?: ActiveFeedingSession | null;
};

export type RoutineType = 'medicine' | 'task' | 'appointment';
export type RepetitionType = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type RoutineItem = {
  id: string;
  type: RoutineType;
  name: string;
  times: string[];
  date?: string;
  location?: string;
  notes?: string;
  repetition: RepetitionType;
  weekdays: Weekday[];
  active: boolean;
  createdAt: string;
};

export type RoutineHistoryAction = 'medicine_taken' | 'medicine_skipped' | 'task_completed' | 'appointment_completed';

export type RoutineHistoryEvent = {
  id: string;
  routineItemId: string;
  type: RoutineType;
  action: RoutineHistoryAction;
  name: string;
  createdAt: string;
};

export type AppData = {
  version: 2;
  activeBabyId: string;
  babies: Baby[];
  routineItems: RoutineItem[];
  routineHistory: RoutineHistoryEvent[];
};
