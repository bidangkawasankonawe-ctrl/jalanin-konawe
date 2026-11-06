/**
 * E-TRAVEL KONAWE - Pure Data Types
 */

export interface PerjalananDinas {
  id: string;
  namaPelaksana: string;
  nip?: string;
  jabatan?: string;
  tanggalBerangkat: string; // YYYY-MM-DD
  tanggalKembali: string;   // YYYY-MM-DD
  tujuan: string;
  maksudPerjalanan?: string;
  nomorSpd?: string;
  biaya?: number;
  keterangan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StatusPerjalanan = 'Sedang Berlangsung' | 'Akan Datang' | 'Selesai';

export interface BentrokPerjalanan {
  pegawai: string;
  trip1: PerjalananDinas;
  trip2: PerjalananDinas;
  tglMulaiBentrok: string;
  tglSelesaiBentrok: string;
  jumlahHariBentrok: number;
}

export interface StatistikDashboard {
  totalPerjalanan: number;
  jumlahPegawai: number;
  pegawaiSedangDinas: number;
  agendaBulanIni: number;
  totalHariPerjalanan: number;
}
