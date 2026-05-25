import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import './feature.css';
import './components/FeedingModal.css';
import { DiaperModal } from './components/DiaperModal';
import { FeedingModal } from './components/FeedingModal';
import { History } from './screens/History';
import { Home } from './screens/Home';
import { Routine } from './screens/Routine';
import { Settings } from './screens/Settings';
import type {
  ActiveFeedingSession,
  AppData,
  AppEvent,
  Baby,
  BreastSide,
  DiaperKind,
  FormulaCan,
  RoutineHistoryAction,
  RoutineItem,
} from './types';
import { getLiveFeedingSession, pauseFeedingSession, sessionToBreastTimer, toggleFeedingSide } from './utils/feeding';
import { getUpcomingRoutineItems, routineActionLabel } from './utils/routine';
import { createEmptyData, importDataFromFile, loadData, saveData } from './utils/storage';

type Tab = 'home' | 'routine' | 'history' | 'settings';

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'home', label: 'Início', icon: '⌂' },
  { id: 'routine', label: 'Rotina', icon: '+' },
  { id: 'history', label: 'Histórico', icon: '↺' },
  { id: 'settings', label: 'Ajustes', icon: '⚙' },
];

const createEvent = (type: AppEvent['type'], payload: Record<string, unknown> = {}): AppEvent => ({
  id: crypto.randomUUID(),
  type,
  createdAt: new Date().toISOString(),
  payload,
});

const createBaby = (name: string, birthDate: string): Baby => ({
  id: crypto.randomUUID(),
  name: name.trim() || 'Bebê',
  birthDate,
  events: [],
  formulaCans: [],
  activeFeedingSession: null,
});

const createSession = (): ActiveFeedingSession => ({
  id: crypto.randomUUID(),
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  leftSeconds: 0,
  rightSeconds: 0,
  runningSide: null,
  lastSide: null,
  amountMl: null,
});

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<Tab>('home');
  const [now, setNow] = useState(() => new Date());
  const [diaperOpen, setDiaperOpen] = useState(false);
  const [feedingOpen, setFeedingOpen] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupBirthDate, setSetupBirthDate] = useState('');
  const [setupError, setSetupError] = useState('');
  const [lastRoutineNotice, setLastRoutineNotice] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const activeBaby = useMemo(
    () => data.babies.find((baby) => baby.id === data.activeBabyId) ?? data.babies[0] ?? null,
    [data.activeBabyId, data.babies],
  );

  const liveSession = activeBaby?.activeFeedingSession ? getLiveFeedingSession(activeBaby.activeFeedingSession, now) : null;

  useEffect(() => {
    const next = getUpcomingRoutineItems(data.routineItems, 1, now)[0];
    if (!next) return;
    const due = next.dateTime.getTime() <= now.getTime();
    const key = `${next.item.id}:${next.dateTime.toISOString()}`;
    if (!due || key === lastRoutineNotice) return;
    setLastRoutineNotice(key);
    if ('Notification' in window && Notification.permission === 'granted') {
      const action = next.item.type === 'medicine' ? 'medicine_taken' : next.item.type === 'task' ? 'task_completed' : 'appointment_completed';
      new Notification('Lembrete de rotina', { body: `${next.item.name} · ${routineActionLabel[action]}` });
    }
  }, [data.routineItems, lastRoutineNotice, now]);

  const updateActiveBaby = (updater: (baby: Baby) => Baby) => {
    if (!activeBaby) return;
    setData((current) => ({
      ...current,
      babies: current.babies.map((baby) => (baby.id === activeBaby.id ? updater(baby) : baby)),
    }));
  };

  const addBaby = (name: string, birthDate: string) => {
    if (data.babies.length >= 3) {
      alert('Limite de 3 bebês atingido.');
      return;
    }
    const baby = createBaby(name, birthDate);
    setData((current) => ({ ...current, activeBabyId: baby.id, babies: [...current.babies, baby] }));
    setTab('home');
  };

  const deleteBaby = (babyId: string) => {
    if (data.babies.length <= 1) {
      alert('É necessário manter pelo menos um bebê cadastrado.');
      return;
    }
    if (!confirm('Excluir este bebê e todos os registros dele?')) return;
    setData((current) => {
      const babies = current.babies.filter((baby) => baby.id !== babyId);
      return { ...current, babies, activeBabyId: current.activeBabyId === babyId ? babies[0].id : current.activeBabyId };
    });
  };

  const addBabyEvent = (event: AppEvent) => updateActiveBaby((baby) => ({ ...baby, events: [event, ...baby.events] }));

  const openFeeding = () => {
    updateActiveBaby((baby) => ({
      ...baby,
      activeFeedingSession: baby.activeFeedingSession ? getLiveFeedingSession(baby.activeFeedingSession, now) : createSession(),
    }));
    setFeedingOpen(true);
  };

  const toggleSide = (side: BreastSide) => {
    updateActiveBaby((baby) => {
      const session = baby.activeFeedingSession ? getLiveFeedingSession(baby.activeFeedingSession, now) : createSession();
      return { ...baby, activeFeedingSession: toggleFeedingSide(session, side, now) };
    });
  };

  const discardFeeding = () => {
    updateActiveBaby((baby) => ({ ...baby, activeFeedingSession: null }));
    setFeedingOpen(false);
  };

  const finishFeeding = (amountMl: number | null) => {
    if (!activeBaby) return;
    const session = activeBaby.activeFeedingSession ? pauseFeedingSession(getLiveFeedingSession(activeBaby.activeFeedingSession, now), now) : createSession();
    addBabyEvent(createEvent('feeding', { amountMl, breast: sessionToBreastTimer(session, now) }));
    updateActiveBaby((baby) => ({ ...baby, activeFeedingSession: null }));
    setFeedingOpen(false);
  };

  const sleep = () => addBabyEvent(createEvent('sleep_start'));
  const wake = () => addBabyEvent(createEvent('sleep_end'));
  const diaper = (kind: DiaperKind) => {
    addBabyEvent(createEvent('diaper', { kind }));
    setDiaperOpen(false);
  };

  const saveRoutine = (item: RoutineItem) => {
    setData((current) => ({
      ...current,
      routineItems: current.routineItems.some((routine) => routine.id === item.id)
        ? current.routineItems.map((routine) => (routine.id === item.id ? item : routine))
        : [...current.routineItems, item],
    }));
  };

  const deleteRoutine = (itemId: string) => {
    if (!confirm('Excluir este item de rotina?')) return;
    setData((current) => ({ ...current, routineItems: current.routineItems.filter((item) => item.id !== itemId) }));
  };

  const recordRoutineAction = (item: RoutineItem, action: RoutineHistoryAction) => {
    setData((current) => ({
      ...current,
      routineHistory: [
        {
          id: crypto.randomUUID(),
          routineItemId: item.id,
          type: item.type,
          action,
          name: item.name,
          createdAt: new Date().toISOString(),
        },
        ...current.routineHistory,
      ],
    }));
  };

  const saveFormulaCan = (can: FormulaCan) => {
    const existed = activeBaby?.formulaCans.some((item) => item.id === can.id);
    updateActiveBaby((baby) => ({
      ...baby,
      formulaCans: baby.formulaCans.some((item) => item.id === can.id)
        ? baby.formulaCans.map((item) => (item.id === can.id ? can : item))
        : [can, ...baby.formulaCans],
      events: existed ? baby.events : [createEvent('formula_opened', { name: can.name }), ...baby.events],
    }));
  };

  const finishFormulaCan = (canId: string, finishedAt: string) => {
    updateActiveBaby((baby) => {
      const can = baby.formulaCans.find((item) => item.id === canId);
      if (!can) return baby;
      return {
        ...baby,
        formulaCans: baby.formulaCans.map((item) => (item.id === canId ? { ...item, finishedAt } : item)),
        events: [createEvent('formula_finished', { name: can.name }), ...baby.events],
      };
    });
  };

  const deleteFormulaCan = (canId: string) => {
    if (!confirm('Excluir esta lata?')) return;
    updateActiveBaby((baby) => ({ ...baby, formulaCans: baby.formulaCans.filter((can) => can.id !== canId) }));
  };

  const clearAllData = () => {
    if (!confirm('Essa ação apaga todos os dados deste aparelho. Deseja continuar?')) return;
    setData(createEmptyData());
    setTab('home');
  };

  const importFile = async (file: File) => {
    try {
      const imported = await importDataFromFile(file);
      setData(imported);
      setTab('home');
    } catch {
      alert('Não foi possível importar os dados.');
    }
  };

  const createFirstBaby = () => {
    if (!setupName.trim()) {
      setSetupError('Informe o nome do bebê.');
      return;
    }
    if (!setupBirthDate) {
      setSetupError('Informe a data de nascimento.');
      return;
    }
    const selected = new Date(`${setupBirthDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected.getTime() > today.getTime()) {
      setSetupError('A data de nascimento não pode ser no futuro.');
      return;
    }
    const baby = createBaby(setupName, setupBirthDate);
    setData({ ...createEmptyData(), activeBabyId: baby.id, babies: [baby] });
  };

  if (!activeBaby) {
    return (
      <div className="appShell">
        <main className="screen setupScreen">
          <header className="hero">
            <p>Primeiro acesso</p>
            <h1>Rotina do bebê</h1>
          </header>
          <section className="panel formPanel">
            <label>
              Nome do bebê
              <input value={setupName} onChange={(event) => setSetupName(event.target.value)} placeholder="Nome do bebê" />
            </label>
            <label>
              Data de nascimento
              <input type="date" value={setupBirthDate} onChange={(event) => setSetupBirthDate(event.target.value)} />
            </label>
            {setupError ? <p className="fieldError">{setupError}</p> : null}
            <button className="primaryButton" type="button" onClick={createFirstBaby}>Começar</button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="appShell">
      {tab === 'home' ? (
        <Home
          baby={activeBaby}
          events={activeBaby.events}
          activeFeedingSession={liveSession}
          routineItems={data.routineItems}
          routineHistory={data.routineHistory}
          now={now}
          onFeed={openFeeding}
          onContinueFeeding={() => setFeedingOpen(true)}
          onFinishFeeding={() => finishFeeding(null)}
          onSleep={sleep}
          onWake={wake}
          onDiaper={() => setDiaperOpen(true)}
          onConfigureBaby={() => setTab('settings')}
        />
      ) : null}

      {tab === 'routine' ? (
        <Routine
          baby={activeBaby}
          routineItems={data.routineItems}
          now={now}
          onSaveRoutine={saveRoutine}
          onDeleteRoutine={deleteRoutine}
          onRoutineAction={recordRoutineAction}
          onSaveFormulaCan={saveFormulaCan}
          onFinishFormulaCan={finishFormulaCan}
          onDeleteFormulaCan={deleteFormulaCan}
        />
      ) : null}

      {tab === 'history' ? (
        <History
          baby={activeBaby}
          events={activeBaby.events}
          routineHistory={data.routineHistory}
          onDelete={(eventId) => updateActiveBaby((baby) => ({ ...baby, events: baby.events.filter((event) => event.id !== eventId) }))}
        />
      ) : null}

      {tab === 'settings' ? (
        <Settings
          data={data}
          activeBaby={activeBaby}
          onSaveBaby={(baby) => setData((current) => ({ ...current, babies: current.babies.map((item) => (item.id === baby.id ? baby : item)) }))}
          onAddBaby={addBaby}
          onDeleteBaby={deleteBaby}
          onSwitchBaby={(babyId) => setData((current) => ({ ...current, activeBabyId: babyId }))}
          onImport={importFile}
          onClear={clearAllData}
        />
      ) : null}

      <div className="babySwitcher" aria-label="Bebê ativo">
        {data.babies.map((baby) => (
          <button className={baby.id === activeBaby.id ? 'active' : ''} key={baby.id} type="button" onClick={() => setData((current) => ({ ...current, activeBabyId: baby.id }))}>
            {baby.name}
          </button>
        ))}
        {data.babies.length < 3 ? (
          <button type="button" onClick={() => setTab('settings')}>Adicionar bebê</button>
        ) : (
          <span>Limite de 3 bebês atingido.</span>
        )}
      </div>

      <nav className="tabBar" aria-label="Navegação principal">
        {tabs.map((item) => (
          <button className={tab === item.id ? 'active' : ''} type="button" key={item.id} onClick={() => setTab(item.id)}>
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <DiaperModal open={diaperOpen} onClose={() => setDiaperOpen(false)} onSelect={diaper} />
      <FeedingModal open={feedingOpen} session={liveSession ?? createSession()} now={now} onClose={discardFeeding} onToggleSide={toggleSide} onSave={finishFeeding} />
    </div>
  );
}
