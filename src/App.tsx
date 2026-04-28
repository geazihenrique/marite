import { useEffect, useMemo, useState } from 'react';
import { DiaperModal } from './components/DiaperModal';
import { Home } from './screens/Home';
import { Medicines } from './screens/Medicines';
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import type { AppData, AppEvent, DiaperKind, Medicine, NextMedicineDose } from './types';
import { emptyData, loadData, saveData } from './utils/storage';
import { combineTodayWithTime, formatClock } from './utils/time';
import { findNextMedicine, getMedicineDoseKey } from './utils/medicine';
import { getCurrentSleepStart, getLastWake } from './utils/summary';
import './styles.css';

type Tab = 'home' | 'medicines' | 'history' | 'settings';

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'home', label: 'Início', icon: '⌂' },
  { id: 'medicines', label: 'Remédios', icon: '+' },
  { id: 'history', label: 'Histórico', icon: '≡' },
  { id: 'settings', label: 'Ajustes', icon: '⚙' },
];

const createEvent = (type: AppEvent['type'], payload?: AppEvent['payload'], createdAt = new Date().toISOString()): AppEvent => ({
  id: crypto.randomUUID(),
  type,
  createdAt,
  payload,
});

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<Tab>('home');
  const [now, setNow] = useState(new Date());
  const [diaperOpen, setDiaperOpen] = useState(false);
  const [lastDueKey, setLastDueKey] = useState('');

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const sleepingSince = useMemo(() => getCurrentSleepStart(data.events), [data.events]);
  const lastWake = useMemo(() => getLastWake(data.events), [data.events]);
  const nextMedicine = useMemo(() => findNextMedicine(data.medicines, data.events, now), [data.medicines, data.events, now]);

  useEffect(() => {
    if (!nextMedicine || nextMedicine.status !== 'due') return;
    const key = `${nextMedicine.medicine.id}:${nextMedicine.time}`;
    if (key === lastDueKey) return;
    setLastDueKey(key);
    notifyDose(nextMedicine);
  }, [nextMedicine, lastDueKey]);

  const addEvent = (event: AppEvent) => {
    setData((current) => ({ ...current, events: [...current.events, event] }));
  };

  const notifyDose = (dose: NextMedicineDose) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = 740;
        gain.gain.value = 0.05;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.25);
      }
    } catch {
      // Som opcional; alguns navegadores bloqueiam sem interação recente.
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Lembrete de remédio', {
        body: `${dose.medicine.name} às ${dose.time}`,
        icon: '/icons/icon-192.png',
      });
    }
  };

  const markDose = (medicine: Medicine, time: string, type: 'medicine_taken' | 'medicine_skipped') => {
    addEvent(
      createEvent(type, {
        medicineId: medicine.id,
        medicineName: medicine.name,
        scheduledTime: time,
        doseKey: getMedicineDoseKey(medicine.id, time),
      })
    );
  };

  const editEvent = (event: AppEvent) => {
    const current = formatClock(event.createdAt);
    const time = window.prompt('Editar horário no formato HH:MM', current);
    if (!time || /^\d{2}:\d{2}$/.test(time) === false) return;
    let payload = event.payload;

    if (event.type === 'diaper') {
      const kind = window.prompt('Tipo: xixi, coco, xixi_coco ou dry', String(event.payload?.kind ?? 'xixi')) as DiaperKind | null;
      if (kind && ['xixi', 'coco', 'xixi_coco', 'dry'].includes(kind)) payload = { ...event.payload, kind };
    }

    setData((currentData) => ({
      ...currentData,
      events: currentData.events.map((item) =>
        item.id === event.id ? { ...item, createdAt: combineTodayWithTime(time, item.createdAt), payload } : item
      ),
    }));
  };

  const deleteEvent = (eventId: string) => {
    if (!window.confirm('Excluir este registro?')) return;
    setData((current) => ({ ...current, events: current.events.filter((event) => event.id !== eventId) }));
  };

  const clearData = () => {
    if (!window.confirm('Limpar todos os dados deste aparelho?')) return;
    setData(emptyData);
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      globalThis.alert('Este navegador não oferece notificações para este app.');
      return;
    }
    const permission = await Notification.requestPermission();
    globalThis.alert(permission === 'granted' ? 'Notificações permitidas para lembretes.' : 'Notificações não foram permitidas.');
  };

  return (
    <div className="appShell">
      {tab === 'home' ? (
        <Home
          babyName={data.profile.name}
          babyBirthDate={data.profile.birthDate}
          events={data.events}
          now={now}
          sleepingSince={sleepingSince}
          lastWake={lastWake}
          nextMedicine={nextMedicine}
          onFeeding={() => addEvent(createEvent('feeding'))}
          onSleepStart={() => addEvent(createEvent('sleep_start'))}
          onWake={() => addEvent(createEvent('sleep_end'))}
          onOpenDiaper={() => setDiaperOpen(true)}
          onMedicineTaken={(dose) => markDose(dose.medicine, dose.time, 'medicine_taken')}
          onConfigureProfile={() => setTab('settings')}
        />
      ) : null}

      {tab === 'medicines' ? (
        <Medicines
          medicines={data.medicines}
          events={data.events}
          now={now}
          nextMedicine={nextMedicine}
          onSave={(medicine) =>
            setData((current) => ({
              ...current,
              medicines: current.medicines.some((item) => item.id === medicine.id)
                ? current.medicines.map((item) => (item.id === medicine.id ? medicine : item))
                : [...current.medicines, medicine],
            }))
          }
          onDelete={(medicineId) => {
            if (!window.confirm('Excluir este remédio?')) return;
            setData((current) => ({ ...current, medicines: current.medicines.filter((medicine) => medicine.id !== medicineId) }));
          }}
          onDoseTaken={(medicine, time) => markDose(medicine, time, 'medicine_taken')}
          onDoseSkipped={(medicine, time) => markDose(medicine, time, 'medicine_skipped')}
          onRequestNotifications={requestNotifications}
        />
      ) : null}

      {tab === 'history' ? <History events={data.events} onDelete={deleteEvent} onEdit={editEvent} /> : null}

      {tab === 'settings' ? (
        <Settings
          data={data}
          onSaveProfile={(profile) => {
            setData((current) => ({ ...current, profile }));
            window.alert('Perfil salvo.');
          }}
          onImport={setData}
          onClear={clearData}
        />
      ) : null}

      <DiaperModal
        open={diaperOpen}
        onClose={() => setDiaperOpen(false)}
        onSelect={(kind) => {
          addEvent(createEvent('diaper', { kind }));
          setDiaperOpen(false);
        }}
      />

      <nav className="tabBar" aria-label="Navegação principal">
        {tabs.map((item) => (
          <button key={item.id} className={tab === item.id ? 'active' : ''} type="button" onClick={() => setTab(item.id)}>
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
