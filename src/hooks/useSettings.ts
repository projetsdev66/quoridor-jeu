import { useEffect, useMemo, useState } from 'react';

export interface GameSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  confirmWalls: boolean;
  showPathByDefault: boolean;
}

const STORAGE_KEY = 'quoridor_settings_v2';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  reducedMotion: false,
  confirmWalls: true,
  showPathByDefault: false,
};

function readStoredSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(readStoredSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  const api = useMemo(() => ({
    settings,
    updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    resetSettings() {
      setSettings(DEFAULT_SETTINGS);
    },
  }), [settings]);

  return api;
}

export { DEFAULT_SETTINGS };
