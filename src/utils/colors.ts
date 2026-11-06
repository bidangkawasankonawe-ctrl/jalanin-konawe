/**
 * Palet warna cerah profesional untuk pegawai di Kalender FullCalendar
 */
const PALET_WARNA = [
  { bg: '#0284c7', border: '#0369a1', text: '#ffffff' }, // Sky Blue
  { bg: '#2563eb', border: '#1d4ed8', text: '#ffffff' }, // Royal Blue
  { bg: '#0d9488', border: '#0f766e', text: '#ffffff' }, // Teal
  { bg: '#16a34a', border: '#15803d', text: '#ffffff' }, // Green
  { bg: '#d97706', border: '#b45309', text: '#ffffff' }, // Amber
  { bg: '#7c3aed', border: '#6d28d9', text: '#ffffff' }, // Purple
  { bg: '#db2777', border: '#be185d', text: '#ffffff' }, // Pink
  { bg: '#ea580c', border: '#c2410c', text: '#ffffff' }, // Orange
  { bg: '#4f46e5', border: '#4338ca', text: '#ffffff' }, // Indigo
  { bg: '#0891b2', border: '#0e7490', text: '#ffffff' }, // Cyan
];

/**
 * Menghasilkan warna tetap (deterministik) berdasarkan hash nama pegawai
 */
export function getWarnaPegawai(nama: string): { bg: string; border: string; text: string } {
  if (!nama) return PALET_WARNA[0];
  let hash = 0;
  for (let i = 0; i < nama.length; i++) {
    hash = (hash << 5) - hash + nama.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALET_WARNA.length;
  return PALET_WARNA[index];
}
