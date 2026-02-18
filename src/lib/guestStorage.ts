// localStorage keys for guest mode
const PREFIX = "ramadhan_";

export const guestStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(PREFIX + key);
  },
  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};

export function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export interface GuestProfile {
  display_name: string;
  ramadhan_day: number;
  quran_target: number;
  sedekah_target: number;
  onboarding_done: boolean;
}

export interface GuestIbadah {
  subuh: boolean;
  dzuhur: boolean;
  ashar: boolean;
  maghrib: boolean;
  isya: boolean;
  tahajud: boolean;
  dhuha: boolean;
  rawatib: boolean;
  witir: boolean;
  tadarus: boolean;
  sahur: boolean;
  buka_tepat_waktu: boolean;
}

export const defaultIbadah: GuestIbadah = {
  subuh: false,
  dzuhur: false,
  ashar: false,
  maghrib: false,
  isya: false,
  tahajud: false,
  dhuha: false,
  rawatib: false,
  witir: false,
  tadarus: false,
  sahur: false,
  buka_tepat_waktu: false,
};

export interface GuestHealth {
  gelas_air: number;
  makan_buah: boolean;
  olahraga: boolean;
  jam_tidur: number;
}

export const defaultHealth: GuestHealth = {
  gelas_air: 0,
  makan_buah: false,
  olahraga: false,
  jam_tidur: 7,
};
