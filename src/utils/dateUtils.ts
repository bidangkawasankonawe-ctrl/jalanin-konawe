import { StatusPerjalanan } from '../types/index';

/**
 * Format string YYYY-MM-DD ke format Indonesia, e.g. "12 Nov 2026"
 */
export function formatTanggalIndo(dateStr: string, options?: { lengkap?: boolean }): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  
  const date = new Date(year, month, day);
  
  const bulanList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const bulanPendek = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  
  if (options?.lengkap) {
    const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return `${hariList[date.getDay()]}, ${day} ${bulanList[month]} ${year}`;
  }
  
  return `${day} ${bulanPendek[month]} ${year}`;
}

/**
 * Menghitung durasi hari perjalanan dinas (inklusif: hari berangkat s.d. hari kembali dihitung penuh)
 */
export function hitungDurasiHari(tglBerangkat: string, tglKembali: string): number {
  if (!tglBerangkat || !tglKembali) return 0;
  const start = new Date(tglBerangkat + 'T00:00:00');
  const end = new Date(tglKembali + 'T00:00:00');
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 ? diffDays + 1 : 0;
}

/**
 * Menentukan status perjalanan berdasarkan tanggal sekarang
 */
export function hitungStatusPerjalanan(
  tglBerangkat: string,
  tglKembali: string,
  tanggalAcuan: string = new Date().toISOString().split('T')[0]
): StatusPerjalanan {
  if (!tglBerangkat || !tglKembali) return 'Selesai';
  
  if (tanggalAcuan < tglBerangkat) {
    return 'Akan Datang';
  } else if (tanggalAcuan > tglKembali) {
    return 'Selesai';
  } else {
    return 'Sedang Berlangsung';
  }
}

/**
 * Validasi rentang tanggal: apakah valid dan tanggal kembali >= tanggal berangkat
 */
export function validasiRentangTanggal(tglBerangkat: string, tglKembali: string): { valid: boolean; pesan?: string } {
  if (!tglBerangkat) {
    return { valid: false, pesan: 'Tanggal berangkat wajib diisi' };
  }
  if (!tglKembali) {
    return { valid: false, pesan: 'Tanggal kembali wajib diisi' };
  }
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(tglBerangkat)) {
    return { valid: false, pesan: 'Format tanggal berangkat harus YYYY-MM-DD' };
  }
  if (!regex.test(tglKembali)) {
    return { valid: false, pesan: 'Format tanggal kembali harus YYYY-MM-DD' };
  }
  
  if (tglKembali < tglBerangkat) {
    return { valid: false, pesan: 'Tanggal kembali tidak boleh lebih awal dari tanggal berangkat' };
  }
  
  return { valid: true };
}
