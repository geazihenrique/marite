import type { ActiveFeedingSession, BreastSide, BreastTimer } from '../types';

export const formatTimer = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

export const formatBreastMinutes = (seconds: number) => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}min`;
};

export const getLiveFeedingSession = (session?: ActiveFeedingSession | null, now: Date = new Date()): ActiveFeedingSession | null => {
  if (!session) return null;
  if (!session.runningSide) return session;
  const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(session.updatedAt).getTime()) / 1000));
  return {
    ...session,
    leftSeconds: session.runningSide === 'left' ? session.leftSeconds + elapsed : session.leftSeconds,
    rightSeconds: session.runningSide === 'right' ? session.rightSeconds + elapsed : session.rightSeconds,
    updatedAt: now.toISOString(),
  };
};

export const toggleFeedingSide = (session: ActiveFeedingSession | null | undefined, side: BreastSide, now: Date = new Date()): ActiveFeedingSession => {
  const live = getLiveFeedingSession(session, now) ?? {
    id: crypto.randomUUID(),
    startedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    leftSeconds: 0,
    rightSeconds: 0,
    runningSide: null,
    lastSide: null,
    amountMl: null,
  };
  return {
    ...live,
    runningSide: live.runningSide === side ? null : side,
    lastSide: side,
    updatedAt: now.toISOString(),
  };
};

export const pauseFeedingSession = (session: ActiveFeedingSession | null | undefined, now: Date = new Date()) => {
  const live = getLiveFeedingSession(session, now);
  return live ? { ...live, runningSide: null, updatedAt: now.toISOString() } : null;
};

export const sessionToBreastTimer = (session?: ActiveFeedingSession | null, now: Date = new Date()): BreastTimer => {
  const live = getLiveFeedingSession(session, now);
  const leftSeconds = live?.leftSeconds ?? 0;
  const rightSeconds = live?.rightSeconds ?? 0;
  return {
    leftSeconds,
    rightSeconds,
    totalSeconds: leftSeconds + rightSeconds,
    lastSide: live?.lastSide ?? null,
  };
};
