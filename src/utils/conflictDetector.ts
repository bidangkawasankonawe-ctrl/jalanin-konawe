import { PerjalananDinas, BentrokPerjalanan } from '../types/index';
import { hitungDurasiHari } from './dateUtils';

/**
 * Normalisasi nama untuk perbandingan (abaikan spasi berlebih dan huruf besar/kecil)
 */
export function normalisasiNama(nama: string): string {
  if (!nama) return '';
  return nama.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Deteksi seluruh bentrok jadwal perjalanan dinas dalam daftar
 */
export function deteksiSemuaBentrok(list: PerjalananDinas[]): BentrokPerjalanan[] {
  const hasil: BentrokPerjalanan[] = [];
  const checkedPairs = new Set<string>();

  for (let i = 0; i < list.length; i++) {
    const trip1 = list[i];
    if (!trip1.namaPelaksana || !trip1.tanggalBerangkat || !trip1.tanggalKembali) continue;

    for (let j = i + 1; j < list.length; j++) {
      const trip2 = list[j];
      if (!trip2.namaPelaksana || !trip2.tanggalBerangkat || !trip2.tanggalKembali) continue;

      if (normalisasiNama(trip1.namaPelaksana) === normalisasiNama(trip2.namaPelaksana)) {
        // Cek overlap tanggal: (StartA <= EndB) and (StartB <= EndA)
        if (trip1.tanggalBerangkat <= trip2.tanggalKembali && trip2.tanggalBerangkat <= trip1.tanggalKembali) {
          const pairKey = [trip1.id, trip2.id].sort().join('___');
          if (!checkedPairs.has(pairKey)) {
            checkedPairs.add(pairKey);

            const tglMulaiBentrok = trip1.tanggalBerangkat > trip2.tanggalBerangkat 
              ? trip1.tanggalBerangkat 
              : trip2.tanggalBerangkat;
            const tglSelesaiBentrok = trip1.tanggalKembali < trip2.tanggalKembali 
              ? trip1.tanggalKembali 
              : trip2.tanggalKembali;
            const jumlahHariBentrok = hitungDurasiHari(tglMulaiBentrok, tglSelesaiBentrok);

            hasil.push({
              pegawai: trip1.namaPelaksana,
              trip1,
              trip2,
              tglMulaiBentrok,
              tglSelesaiBentrok,
              jumlahHariBentrok,
            });
          }
        }
      }
    }
  }

  return hasil;
}

/**
 * Cek apakah sebuah perjalanan baru atau yang sedang diedit berbenturan dengan data yang ada
 */
export function cekBentrokSingle(
  calonTrip: { id?: string; namaPelaksana: string; tanggalBerangkat: string; tanggalKembali: string },
  daftarEksisting: PerjalananDinas[]
): BentrokPerjalanan[] {
  const hasil: BentrokPerjalanan[] = [];
  if (!calonTrip.namaPelaksana || !calonTrip.tanggalBerangkat || !calonTrip.tanggalKembali) {
    return hasil;
  }

  const calonNama = normalisasiNama(calonTrip.namaPelaksana);

  for (const existing of daftarEksisting) {
    if (existing.id === calonTrip.id) continue; // Jangan bentrok dengan dirinya sendiri saat edit

    if (normalisasiNama(existing.namaPelaksana) === calonNama) {
      if (calonTrip.tanggalBerangkat <= existing.tanggalKembali && existing.tanggalBerangkat <= calonTrip.tanggalKembali) {
        const tglMulaiBentrok = calonTrip.tanggalBerangkat > existing.tanggalBerangkat 
          ? calonTrip.tanggalBerangkat 
          : existing.tanggalBerangkat;
        const tglSelesaiBentrok = calonTrip.tanggalKembali < existing.tanggalKembali 
          ? calonTrip.tanggalKembali 
          : existing.tanggalKembali;
        const jumlahHariBentrok = hitungDurasiHari(tglMulaiBentrok, tglSelesaiBentrok);

        hasil.push({
          pegawai: calonTrip.namaPelaksana,
          trip1: calonTrip as PerjalananDinas,
          trip2: existing,
          tglMulaiBentrok,
          tglSelesaiBentrok,
          jumlahHariBentrok,
        });
      }
    }
  }

  return hasil;
}
