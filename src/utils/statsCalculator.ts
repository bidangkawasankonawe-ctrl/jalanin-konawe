import { PerjalananDinas, StatistikDashboard } from '../types/index';
import { hitungDurasiHari } from './dateUtils';
import { normalisasiNama } from './conflictDetector';

export interface EmployeeSummary {
  nama: string;
  nip?: string;
  jabatan?: string;
  totalPerjalanan: number;
  totalHari: number;
  tujuanTerakhir: string;
  statusSaatIni: 'Sedang Dinas' | 'Di Kantor';
  tujuanSaatIni?: string;
  daftarTujuan: string[];
}

export function hitungStatistikDashboard(
  list: PerjalananDinas[],
  tanggalAcuan: string = new Date().toISOString().split('T')[0]
): StatistikDashboard {
  const totalPerjalanan = list.length;

  // Set pegawai unik
  const pegawaiSet = new Set<string>();
  const pegawaiSedangDinasSet = new Set<string>();
  let totalHariPerjalanan = 0;
  let agendaBulanIni = 0;

  const acuanYearMonth = tanggalAcuan.substring(0, 7); // YYYY-MM

  for (const trip of list) {
    if (trip.namaPelaksana) {
      const norm = normalisasiNama(trip.namaPelaksana);
      pegawaiSet.add(norm);

      // Cek apakah hari ini sedang dinas: tglBerangkat <= tanggalAcuan <= tglKembali
      if (trip.tanggalBerangkat <= tanggalAcuan && tanggalAcuan <= trip.tanggalKembali) {
        pegawaiSedangDinasSet.add(norm);
      }
    }

    const durasi = hitungDurasiHari(trip.tanggalBerangkat, trip.tanggalKembali);
    totalHariPerjalanan += durasi;

    // Cek apakah perjalanan masuk di bulan ini (baik berangkat atau kembali berada di bulan ini)
    if (trip.tanggalBerangkat?.startsWith(acuanYearMonth) || trip.tanggalKembali?.startsWith(acuanYearMonth)) {
      agendaBulanIni += 1;
    }
  }

  return {
    totalPerjalanan,
    jumlahPegawai: pegawaiSet.size,
    pegawaiSedangDinas: pegawaiSedangDinasSet.size,
    agendaBulanIni,
    totalHariPerjalanan,
  };
}

export function rekapMonitoringPegawai(
  list: PerjalananDinas[],
  tanggalAcuan: string = new Date().toISOString().split('T')[0]
): EmployeeSummary[] {
  const map = new Map<string, {
    namaAsli: string;
    nip?: string;
    jabatan?: string;
    trips: PerjalananDinas[];
  }>();

  for (const trip of list) {
    if (!trip.namaPelaksana) continue;
    const norm = normalisasiNama(trip.namaPelaksana);
    if (!map.has(norm)) {
      map.set(norm, {
        namaAsli: trip.namaPelaksana.trim(),
        nip: trip.nip,
        jabatan: trip.jabatan,
        trips: [],
      });
    }
    const item = map.get(norm)!;
    item.trips.push(trip);
    if (trip.nip && !item.nip) item.nip = trip.nip;
    if (trip.jabatan && !item.jabatan) item.jabatan = trip.jabatan;
  }

  const result: EmployeeSummary[] = [];

  for (const [, data] of map.entries()) {
    // Urutkan trips berdasarkan tanggal berangkat terbaru
    const sorted = [...data.trips].sort((a, b) => b.tanggalBerangkat.localeCompare(a.tanggalBerangkat));
    let totalHari = 0;
    const tujuanSet = new Set<string>();
    let statusSaatIni: 'Sedang Dinas' | 'Di Kantor' = 'Di Kantor';
    let tujuanSaatIni: string | undefined = undefined;

    for (const t of sorted) {
      totalHari += hitungDurasiHari(t.tanggalBerangkat, t.tanggalKembali);
      if (t.tujuan) {
        tujuanSet.add(t.tujuan.trim());
      }
      if (t.tanggalBerangkat <= tanggalAcuan && tanggalAcuan <= t.tanggalKembali) {
        statusSaatIni = 'Sedang Dinas';
        tujuanSaatIni = t.tujuan;
      }
    }

    result.push({
      nama: data.namaAsli,
      nip: data.nip,
      jabatan: data.jabatan,
      totalPerjalanan: sorted.length,
      totalHari,
      tujuanTerakhir: sorted[0]?.tujuan || '-',
      statusSaatIni,
      tujuanSaatIni,
      daftarTujuan: Array.from(tujuanSet),
    });
  }

  // Urutkan pegawai dari jumlah perjalanan terbanyak lalu nama
  return result.sort((a, b) => b.totalPerjalanan - a.totalPerjalanan || a.nama.localeCompare(b.nama));
}
