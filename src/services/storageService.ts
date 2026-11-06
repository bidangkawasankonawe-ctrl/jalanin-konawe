import { PerjalananDinas } from '../types/index';
import { INITIAL_TRIPS } from '../data/initialData';

const STORAGE_KEY = 'etravel_konawe_trips_v1';
const LAST_SYNC_KEY = 'etravel_konawe_last_sync_v1';
const IMPORT_HISTORY_KEY = 'etravel_konawe_import_history_v1';
const SETTINGS_KEY = 'etravel_konawe_settings_v1';

export interface ImportLog {
  id: string;
  timestamp: string;
  fileName: string;
  mode: 'append' | 'replace';
  totalRows: number;
  validRows: number;
}

export interface AppSettings {
  instansi: string;
  kota: string;
  pejabatNama: string;
  pejabatNip: string;
  pejabatJabatan: string;
  googleSheetId?: string;
  googleSheetName?: string;
  googleApiKey?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  instansi: 'Pemerintah Kabupaten Konawe - Bidang Kawasan & Tata Ruang',
  kota: 'Unaaha',
  pejabatNama: 'Drs. H. Ferdinand, M.Si',
  pejabatNip: '19700101 199503 1 001',
  pejabatJabatan: 'Pejabat Pembuat Komitmen / PPTK',
  googleSheetId: '',
  googleSheetName: 'Sheet1',
  googleApiKey: '',
};

/**
 * Muat daftar perjalanan dinas dari API backend atau localStorage atau seed
 */
export async function loadTrips(): Promise<{ trips: PerjalananDinas[]; lastSync: string }> {
  let trips: PerjalananDinas[] = [];
  let lastSync = localStorage.getItem(LAST_SYNC_KEY) || new Date().toISOString();

  // Coba ambil dari server API jika ada
  try {
    const res = await fetch('/api/trips');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.trips) && json.trips.length > 0) {
        trips = json.trips;
        lastSync = json.lastSync || new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
        localStorage.setItem(LAST_SYNC_KEY, lastSync);
        return { trips, lastSync };
      }
    }
  } catch (err) {
    // Jalur fallback lokal jika server API sedang start atau offline
    console.debug('Menggunakan local storage fallback', err);
  }

  // Cek localStorage
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        trips = parsed;
        return { trips, lastSync };
      }
    } catch {
      // Abaikan jika json invalid
    }
  }

  // Jika belum ada data sama sekali, gunakan seed awal Konawe
  trips = INITIAL_TRIPS;
  saveTrips(trips);
  return { trips, lastSync: new Date().toISOString() };
}

/**
 * Simpan daftar perjalanan dinas ke localStorage dan sync ke server API
 */
export async function saveTrips(trips: PerjalananDinas[]): Promise<string> {
  const timestamp = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  localStorage.setItem(LAST_SYNC_KEY, timestamp);

  try {
    await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trips, lastSync: timestamp }),
    });
  } catch (err) {
    console.debug('Server sync postponed', err);
  }

  return timestamp;
}

/**
 * Catat riwayat import
 */
export function recordImportLog(log: Omit<ImportLog, 'id' | 'timestamp'>): void {
  const existingStr = localStorage.getItem(IMPORT_HISTORY_KEY);
  let history: ImportLog[] = [];
  if (existingStr) {
    try {
      history = JSON.parse(existingStr);
    } catch {}
  }

  const newLog: ImportLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  history.unshift(newLog);
  // Simpan maksimal 20 log terakhir
  localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export function getImportHistory(): ImportLog[] {
  const str = localStorage.getItem(IMPORT_HISTORY_KEY);
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

/**
 * Simpan dan muat pengaturan aplikasi
 */
export function getAppSettings(): AppSettings {
  const str = localStorage.getItem(SETTINGS_KEY);
  if (!str) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(str) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Backup seluruh database ke format file JSON
 */
export function unduhBackupData(trips: PerjalananDinas[]): void {
  const backupObject = {
    app: 'JALANIN',
    subtitle: 'Jadwal Layanan Perjalanan Dinas',
    tagline: 'Satu Kalender, Semua Perjalanan Terpantau.',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    totalRecords: trips.length,
    settings: getAppSettings(),
    trips,
  };

  const blob = new Blob([JSON.stringify(backupObject, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Backup_JALANIN_SPD_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Restore data dari file backup JSON
 */
export async function pulihkanDariBackup(jsonString: string): Promise<PerjalananDinas[]> {
  const parsed = JSON.parse(jsonString);
  if (!parsed.trips || !Array.isArray(parsed.trips)) {
    throw new Error('Format file backup tidak valid. Properti "trips" tidak ditemukan.');
  }
  if (parsed.settings) {
    saveAppSettings(parsed.settings);
  }
  await saveTrips(parsed.trips);
  return parsed.trips;
}
