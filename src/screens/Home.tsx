import type { ActiveFeedingSession, AppEvent, Baby, DiaperKind, FormulaCan, RoutineHistoryEvent, RoutineItem } from '../types';
import { ActionButton } from '../components/ActionButton';
import { StatusCard } from '../components/StatusCard';
import { SummaryCard } from '../components/SummaryCard';
import { Timeline } from '../components/Timeline';
import { calculateBabyMilestoneMessage, calculateReadableBabyAge, calculateTotalDaysSinceBirth } from '../utils/babyAge';
import { formatBreastMinutes, formatTimer } from '../utils/feeding';
import { getActiveCans, openedDays } from '../utils/formula';
import { formatRoutineWhen, getUpcomingRoutineItems, routineTypeLabel } from '../utils/routine';
import { getCurrentSleepStart, getDailySummary, getFeedingPayload, getLastDiaper, getLastFeeding, getLastWake } from '../utils/summary';
import { elapsedText, formatClock } from '../utils/time';

type HomeProps = {
  baby: Baby;
  events: AppEvent[];
  activeFeedingSession: ActiveFeedingSession | null;
  routineItems: RoutineItem[];
  routineHistory: RoutineHistoryEvent[];
  now: Date;
  onFeed: () => void;
  onContinueFeeding: () => void;
  onFinishFeeding: () => void;
  onSleep: () => void;
  onWake: () => void;
  onDiaper: () => void;
  onConfigureBaby: () => void;
};

const formatCanAge = (can: FormulaCan, now: Date) => {
  const days = openedDays(can.openedAt, now);
  return `Aberta há ${days} ${days === 1 ? 'dia' : 'dias'}`;
};

const formatFeedingDetails = (event?: AppEvent) => {
  if (!event) return 'Sem quantidade registrada';
  const feeding = getFeedingPayload(event.payload);
  const breast = [
    feeding.breast.leftSeconds > 0 ? `E ${formatBreastMinutes(feeding.breast.leftSeconds)}` : '',
    feeding.breast.rightSeconds > 0 ? `D ${formatBreastMinutes(feeding.breast.rightSeconds)}` : '',
  ].filter(Boolean);
  const amount = feeding.amountMl ? `${feeding.amountMl} ml` : 'Sem quantidade registrada';
  return [...breast, `${amount} às ${formatClock(event.createdAt)}`].join(' • ');
};

export function Home({
  baby,
  events,
  activeFeedingSession,
  routineItems,
  routineHistory,
  now,
  onFeed,
  onContinueFeeding,
  onFinishFeeding,
  onSleep,
  onWake,
  onDiaper,
  onConfigureBaby,
}: HomeProps) {
  const summary = getDailySummary(events, now);
  const lastFeeding = getLastFeeding(events);
  const lastDiaper = getLastDiaper(events);
  const currentSleepStart = getCurrentSleepStart(events);
  const lastWake = getLastWake(events);
  const upcomingRoutine = getUpcomingRoutineItems(routineItems, 2, now);
  const activeCans = getActiveCans(baby.formulaCans);
  const totalDays = calculateTotalDaysSinceBirth(baby.birthDate, now);
  const readableAge = calculateReadableBabyAge(baby.birthDate, now);
  const milestone = calculateBabyMilestoneMessage(baby.birthDate, now);

  const sleepTitle = currentSleepStart ? `Dormindo há ${elapsedText(currentSleepStart.createdAt, now)}` : `Acordado há ${elapsedText(lastWake?.createdAt, now)}`;
  const sleepSubtitle = currentSleepStart ? 'Sono em andamento' : lastWake ? `Acordou às ${formatClock(lastWake.createdAt)}` : 'Sem sono registrado hoje';

  return (
    <main className="screen">
      <header className="hero">
        <p>Rotina do bebê</p>
        <h1>Hoje</h1>
      </header>

      <section className="ageCard ageCard--stack">
        <div>
          <p>Anotando agora para: {baby.name}</p>
          <h2>{baby.name || 'Bebê'}</h2>
          {totalDays === null ? (
            <>
              <span>Adicione a data de nascimento para acompanhar os dias de vida.</span>
              <button type="button" onClick={onConfigureBaby}>
                Configurar
              </button>
            </>
          ) : (
            <>
              <span>{totalDays} {totalDays === 1 ? 'dia de vida' : 'dias de vida'}</span>
              {readableAge ? <strong>{readableAge}</strong> : null}
              {milestone ? <em>{milestone}</em> : null}
            </>
          )}
        </div>
      </section>

      <section className="feedingCard">
        <p>Última mamada</p>
        <h2>{lastFeeding ? `Mamou há ${elapsedText(lastFeeding.createdAt, now)}` : 'Sem mamada hoje'}</h2>
        <span>{formatFeedingDetails(lastFeeding)}</span>
      </section>

      {activeFeedingSession ? (
        <section className="activeFeedingCard">
          <div>
            <p>Mamada em andamento</p>
            <div className="miniTimerGrid">
              <span className={activeFeedingSession.runningSide === 'left' ? 'active' : ''}>E {formatTimer(activeFeedingSession.leftSeconds)}</span>
              <span className={activeFeedingSession.runningSide === 'right' ? 'active' : ''}>D {formatTimer(activeFeedingSession.rightSeconds)}</span>
            </div>
          </div>
          <div className="activeFeedingActions">
            <button type="button" onClick={onContinueFeeding}>Continuar</button>
            <button type="button" onClick={onFinishFeeding}>Finalizar</button>
          </div>
        </section>
      ) : null}

      <StatusCard eyebrow="Sono agora" title={sleepTitle} subtitle={sleepSubtitle} />

      <section className="medicineCard">
        <div>
          <p>Rotina</p>
          {upcomingRoutine.length ? (
            upcomingRoutine.map(({ item, dateTime }) => (
              <h2 className="routineLine" key={item.id}>
                {item.name} · {formatRoutineWhen(dateTime, now)}
              </h2>
            ))
          ) : (
            <h2>Nenhum item de rotina</h2>
          )}
        </div>
      </section>

      {activeCans.length ? (
        <section className="medicineCard">
          <div>
            <p>Fórmula em uso</p>
            {activeCans.slice(0, 2).map((can) => (
              <h2 className="routineLine" key={can.id}>
                {can.name} · {formatCanAge(can, now)}
              </h2>
            ))}
            {activeCans.length > 2 ? <span>+{activeCans.length - 2} lata em uso</span> : null}
          </div>
        </section>
      ) : null}

      <section className="quickActions" aria-label="Ações rápidas">
        <ActionButton label="Mamou agora" hint="Abrir registro" icon="M" tone="primary" onClick={onFeed} />
        <ActionButton label="Dormiu agora" hint="Iniciar sono" icon="Zz" tone="sleep" onClick={onSleep} />
        <ActionButton label="Acordou agora" hint="Encerrar sono" icon="☀" tone="wake" onClick={onWake} />
        <ActionButton label="Troca de fralda" hint={lastDiaper ? diaperHint(lastDiaper) : 'Registrar troca'} icon="F" onClick={onDiaper} />
      </section>

      <SummaryCard {...summary} />

      <section className="panel">
        <div className="sectionHeader">
          <h2>Histórico recente</h2>
        </div>
        <Timeline events={events} routineEvents={routineHistory.slice(0, 2)} compact />
      </section>
    </main>
  );
}

function diaperHint(event: AppEvent) {
  return `Última às ${formatClock(event.createdAt)}`;
}
