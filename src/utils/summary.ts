import type { AppEvent } from '../types';
import { isToday } from './time';

export const getTodayEvents = (events: AppEvent[]) => events.filter((event) => isToday(event.createdAt));

export const getLastEvent = (events: AppEvent[], type: AppEvent['type']) =>
  [...events]
    .filter((event) => event.type === type)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

export const getLastFeeding = (events: AppEvent[]) => getLastEvent(events, 'feeding');

export const getLastDiaper = (events: AppEvent[]) => getLastEvent(events, 'diaper');

export const getCurrentSleepStart = (events: AppEvent[]) => {
  const sleepEvents = [...events]
    .filter((event) => event.type === 'sleep_start' || event.type === 'sleep_end')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return sleepEvents[0]?.type === 'sleep_start' ? sleepEvents[0] : undefined;
};

export const getLastWake = (events: AppEvent[]) => getLastEvent(events, 'sleep_end');

export const calculateTodaySleepMs = (events: AppEvent[], now: Date = new Date()) => {
  const todayEvents = getTodayEvents(events).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  let currentStart: AppEvent | undefined;
  let total = 0;

  todayEvents.forEach((event) => {
    if (event.type === 'sleep_start') {
      currentStart = event;
      return;
    }

    if (event.type === 'sleep_end' && currentStart) {
      total += Math.max(0, new Date(event.createdAt).getTime() - new Date(currentStart.createdAt).getTime());
      currentStart = undefined;
    }
  });

  if (currentStart) {
    total += Math.max(0, now.getTime() - new Date(currentStart.createdAt).getTime());
  }

  return total;
};

export const getDailySummary = (events: AppEvent[], now: Date = new Date()) => {
  const todayEvents = getTodayEvents(events);
  return {
    feedings: todayEvents.filter((event) => event.type === 'feeding').length,
    totalMl: todayEvents
      .filter((event) => event.type === 'feeding')
      .reduce((total, event) => {
        const amountMl = event.payload?.amountMl;
        return typeof amountMl === 'number' && Number.isFinite(amountMl) && amountMl > 0 ? total + amountMl : total;
      }, 0),
    sleepMs: calculateTodaySleepMs(events, now),
    diapers: todayEvents.filter((event) => event.type === 'diaper').length,
    medicinesTaken: todayEvents.filter((event) => event.type === 'medicine_taken').length,
    medicinesSkipped: todayEvents.filter((event) => event.type === 'medicine_skipped').length,
  };
};
