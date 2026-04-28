export type EventType =
  | 'feeding'
  | 'sleep_start'
  | 'sleep_end'
  | 'diaper'
  | 'medicine_taken'
  | 'medicine_skipped';

export type DiaperKind = 'xixi' | 'coco' | 'xixi_coco' | 'dry';

export type AppEvent = {
  id: string;
  type: EventType;
  createdAt: string;
  payload?: Record<string, unknown>;
};

export type Medicine = {
  id: string;
  name: string;
  times: string[];
  notes?: string;
  active: boolean;
  createdAt: string;
};

export type BabyProfile = {
  name: string;
  birthDate?: string;
};

export type AppData = {
  events: AppEvent[];
  medicines: Medicine[];
  profile: BabyProfile;
};

export type NextMedicineDose = {
  medicine: Medicine;
  time: string;
  scheduledAt: Date;
  status: 'pending' | 'due';
};
