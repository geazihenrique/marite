import type { AppData } from '../types';

const STORAGE_KEY = 'rotina-do-bebe:v1';

export const emptyData: AppData = {
  events: [],
  medicines: [],
  profile: {
    name: '',
  },
};

export const loadData = (): AppData => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    const data = JSON.parse(raw) as AppData;
    return {
      events: Array.isArray(data.events) ? data.events : [],
      medicines: Array.isArray(data.medicines) ? data.medicines : [],
      profile: data.profile && typeof data.profile.name === 'string' ? data.profile : emptyData.profile,
    };
  } catch {
    return emptyData;
  }
};

export const saveData = (data: AppData) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const exportData = (data: AppData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rotina-do-bebe-${new Date().toISOString().slice(0, 10)}.json`;
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
        const parsed = JSON.parse(String(reader.result)) as AppData;
        resolve({
          events: Array.isArray(parsed.events) ? parsed.events : [],
          medicines: Array.isArray(parsed.medicines) ? parsed.medicines : [],
          profile: parsed.profile && typeof parsed.profile.name === 'string' ? parsed.profile : emptyData.profile,
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
