import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTanggalIndo, hitungDurasiHari, hitungStatusPerjalanan, validasiRentangTanggal } from './dateUtils';
import { deteksiSemuaBentrok, cekBentrokSingle } from './conflictDetector';
import { hitungStatistikDashboard, rekapMonitoringPegawai } from './statsCalculator';
import { PerjalananDinas } from '../types/index';

test('hitungDurasiHari: menghitung durasi inklusif hari dengan benar', () => {
  // 10 Nov ke 12 Nov = 3 hari (10, 11, 12)
  assert.equal(hitungDurasiHari('2026-11-10', '2026-11-12'), 3);
  // Hari yang sama = 1 hari
  assert.equal(hitungDurasiHari('2026-11-10', '2026-11-10'), 1);
  // Tanggal kembali lebih awal = 0
  assert.equal(hitungDurasiHari('2026-11-12', '2026-11-10'), 0);
});

test('formatTanggalIndo: menghasilkan format tanggal Indonesia yang rapi', () => {
  assert.equal(formatTanggalIndo('2026-11-06'), '6 Nov 2026');
  assert.equal(formatTanggalIndo('2026-11-06', { lengkap: true }), 'Jumat, 6 November 2026');
});

test('hitungStatusPerjalanan: menentukan status Sedang Berlangsung / Akan Datang / Selesai', () => {
  const acuan = '2026-11-06';
  assert.equal(hitungStatusPerjalanan('2026-11-04', '2026-11-08', acuan), 'Sedang Berlangsung');
  assert.equal(hitungStatusPerjalanan('2026-11-10', '2026-11-12', acuan), 'Akan Datang');
  assert.equal(hitungStatusPerjalanan('2026-11-01', '2026-11-03', acuan), 'Selesai');
});

test('validasiRentangTanggal: menolak tanggal tidak valid dan kembali < berangkat', () => {
  assert.equal(validasiRentangTanggal('2026-11-10', '2026-11-15').valid, true);
  assert.equal(validasiRentangTanggal('2026-11-15', '2026-11-10').valid, false);
  assert.equal(validasiRentangTanggal('', '2026-11-10').valid, false);
});

test('deteksiSemuaBentrok: mendeteksi tumpang tindih jadwal pegawai yang sama', () => {
  const trips: PerjalananDinas[] = [
    {
      id: 'trip-1',
      namaPelaksana: 'Ahmad Fauzi, S.STP',
      tanggalBerangkat: '2026-11-10',
      tanggalKembali: '2026-11-14',
      tujuan: 'Kecamatan Unaaha',
    },
    {
      id: 'trip-2',
      namaPelaksana: 'Ahmad Fauzi, S.STP ', // spasi berlebih
      tanggalBerangkat: '2026-11-12',
      tanggalKembali: '2026-11-16',
      tujuan: 'Kendari',
    },
    {
      id: 'trip-3',
      namaPelaksana: 'Siti Nurhaliza, S.E.',
      tanggalBerangkat: '2026-11-12',
      tanggalKembali: '2026-11-16',
      tujuan: 'Makassar',
    },
  ];

  const bentrok = deteksiSemuaBentrok(trips);
  assert.equal(bentrok.length, 1);
  assert.equal(bentrok[0].tglMulaiBentrok, '2026-11-12');
  assert.equal(bentrok[0].tglSelesaiBentrok, '2026-11-14');
  assert.equal(bentrok[0].jumlahHariBentrok, 3); // 12, 13, 14 Nov = 3 hari
});

test('cekBentrokSingle: mendeteksi saat menambah perjalanan baru yang tumpang tindih', () => {
  const existing: PerjalananDinas[] = [
    {
      id: 'trip-1',
      namaPelaksana: 'Budi Santoso',
      tanggalBerangkat: '2026-11-20',
      tanggalKembali: '2026-11-22',
      tujuan: 'Jakarta',
    },
  ];

  const clash = cekBentrokSingle(
    {
      namaPelaksana: 'Budi Santoso',
      tanggalBerangkat: '2026-11-21',
      tanggalKembali: '2026-11-25',
    },
    existing
  );

  assert.equal(clash.length, 1);
  assert.equal(clash[0].jumlahHariBentrok, 2); // 21 & 22 Nov = 2 hari
});

test('hitungStatistikDashboard: menghitung statistik dengan benar', () => {
  const acuan = '2026-11-06';
  const trips: PerjalananDinas[] = [
    {
      id: 't1',
      namaPelaksana: 'Pegawai A',
      tanggalBerangkat: '2026-11-05',
      tanggalKembali: '2026-11-07', // sedang dinas di 06
      tujuan: 'Unaaha',
    },
    {
      id: 't2',
      namaPelaksana: 'Pegawai A',
      tanggalBerangkat: '2026-11-10',
      tanggalKembali: '2026-11-11',
      tujuan: 'Kendari',
    },
    {
      id: 't3',
      namaPelaksana: 'Pegawai B',
      tanggalBerangkat: '2026-10-01',
      tanggalKembali: '2026-10-03',
      tujuan: 'Jakarta',
    },
  ];

  const stats = hitungStatistikDashboard(trips, acuan);
  assert.equal(stats.totalPerjalanan, 3);
  assert.equal(stats.jumlahPegawai, 2);
  assert.equal(stats.pegawaiSedangDinas, 1); // Pegawai A sedang dinas
  assert.equal(stats.agendaBulanIni, 2);     // t1 & t2 di bulan November 2026
  assert.equal(stats.totalHariPerjalanan, 3 + 2 + 3); // 8 hari
});

test('rekapMonitoringPegawai: merangkum per pegawai dengan benar', () => {
  const acuan = '2026-11-06';
  const trips: PerjalananDinas[] = [
    {
      id: 't1',
      namaPelaksana: 'Drs. H. Ferdinand',
      nip: '197001011995031001',
      jabatan: 'Kepala Bagian',
      tanggalBerangkat: '2026-11-05',
      tanggalKembali: '2026-11-07',
      tujuan: 'Unaaha',
    },
  ];

  const rekap = rekapMonitoringPegawai(trips, acuan);
  assert.equal(rekap.length, 1);
  assert.equal(rekap[0].nama, 'Drs. H. Ferdinand');
  assert.equal(rekap[0].statusSaatIni, 'Sedang Dinas');
  assert.equal(rekap[0].totalHari, 3);
  assert.equal(rekap[0].tujuanSaatIni, 'Unaaha');
});

test('autoMapColumns: mendeteksi kolom Excel dengan nama header beragam', async () => {
  const { autoMapColumns, normalisasiTanggalExcel } = await import('./excelParser');
  
  const headers = ['No', 'Nama Pegawai', 'Tgl Berangkat', 'Tgl Selesai', 'Kota Tujuan', 'No Surat Tugas'];
  const mapped = autoMapColumns(headers);

  assert.equal(mapped.namaPelaksana, 'Nama Pegawai');
  assert.equal(mapped.tanggalBerangkat, 'Tgl Berangkat');
  assert.equal(mapped.tanggalKembali, 'Tgl Selesai');
  assert.equal(mapped.tujuan, 'Kota Tujuan');
  assert.equal(mapped.nomorSpd, 'No Surat Tugas');

  // Test normalisasi tanggal teks DD/MM/YYYY
  assert.equal(normalisasiTanggalExcel('15/11/2026'), '2026-11-15');
  assert.equal(normalisasiTanggalExcel('2026-11-15'), '2026-11-15');
});
