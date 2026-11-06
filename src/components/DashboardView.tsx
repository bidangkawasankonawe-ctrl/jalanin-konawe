import React from 'react';
import {
  Briefcase,
  Users,
  Compass,
  CalendarCheck2,
  Clock,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  UploadCloud,
  FileSpreadsheet,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { PerjalananDinas, BentrokPerjalanan } from '../types/index';
import { hitungStatistikDashboard } from '../utils/statsCalculator';
import { formatTanggalIndo, hitungDurasiHari } from '../utils/dateUtils';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  trips: PerjalananDinas[];
  conflicts: BentrokPerjalanan[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onSelectTripDetail: (trip: PerjalananDinas) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trips,
  conflicts,
  onNavigate,
  onOpenAddModal,
  onSelectTripDetail,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const stats = hitungStatistikDashboard(trips, today);

  // Filter pegawai yang sedang dinas hari ini
  const tripsSedangDinas = trips.filter(
    (t) => t.tanggalBerangkat <= today && today <= t.tanggalKembali
  );

  // Ambil 5 perjalanan paling terbaru / mendatang
  const upcomingTrips = [...trips]
    .sort((a, b) => b.tanggalBerangkat.localeCompare(a.tanggalBerangkat))
    .slice(0, 5);

  // Distribusi Destinasi
  const tujuanCountMap: Record<string, number> = {};
  trips.forEach((t) => {
    if (t.tujuan) {
      tujuanCountMap[t.tujuan] = (tujuanCountMap[t.tujuan] || 0) + 1;
    }
  });
  const topTujuan = Object.entries(tujuanCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* Banner Peringatan Bentrok Jadwal (Jika ada bentrok) */}
      {conflicts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-red-50 to-amber-50 border border-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-xs shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-red-900">
                Peringatan: Terdeteksi {conflicts.length} Jadwal Perjalanan Dinas Bentrok!
              </h3>
              <p className="text-xs sm:text-sm text-red-700 mt-0.5">
                Terdapat pegawai yang memiliki dua penugasan pada rentang tanggal yang saling tumpang tindih. Segera lakukan penyesuaian jadwal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('deteksi-bentrok')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs"
          >
            <span>Tinjau Bentrok Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sambutan & Quick CTA Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold">JALANIN</span>
            <span className="text-slate-400">•</span>
            <span>Jadwal Layanan Perjalanan Dinas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Satu Kalender, Semua Perjalanan Terpantau.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dashboard monitoring pergerakan tugas dinas ASN secara real-time, deteksi bentrok otomatis, dan rekapitulasi SPD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('import-data')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Import Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('rekapitulasi')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekap & Cetak</span>
          </button>
        </div>
      </div>

      {/* 5 Kartu Statistik Utama (Sesuai Butir C Prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. Total Perjalanan Dinas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Perjalanan
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.totalPerjalanan}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Surat Tugas & SPD tercatat</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* 2. Jumlah Pegawai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Jumlah Pegawai
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.jumlahPegawai}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Personel terdaftar dinas</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* 3. Pegawai Sedang Perjalanan Dinas (Hari ini) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sedang Dinas
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {stats.pegawaiSedangDinas}
            </span>
            <span className="text-xs font-medium text-slate-500">Pegawai</span>
          </div>
          <div className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>Di luar kantor hari ini</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* 4. Agenda Perjalanan Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Agenda Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.agendaBulanIni}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Agenda aktif bulan ini</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

        {/* 5. Total Hari Perjalanan Dinas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Hari Dinas
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalHariPerjalanan}
            </span>
            <span className="text-xs font-medium text-slate-500">Hari</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>Akumulasi hari bertugas</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </div>

      </div>

      {/* Bagian Bawah: Pegawai Sedang Dinas Hari Ini & Destinasi Teratas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom 1 & 2: Pegawai Sedang Bertugas Hari Ini */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <h2 className="text-base font-bold text-slate-900">
                Pegawai Sedang Perjalanan Dinas Hari Ini ({tripsSedangDinas.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Buka Kalender</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {tripsSedangDinas.length === 0 ? (
            <div className="py-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Semua Pegawai Berada di Kantor</p>
              <p className="text-xs text-slate-500 mt-0.5">Tidak ada pegawai yang sedang bertugas di luar daerah hari ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tripsSedangDinas.map((trip) => {
                const durasi = hitungDurasiHari(trip.tanggalBerangkat, trip.tanggalKembali);
                return (
                  <div
                    key={trip.id}
                    onClick={() => onSelectTripDetail(trip)}
                    className="p-4 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {trip.namaPelaksana.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {trip.namaPelaksana}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            Aktif Bertugas
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {trip.jabatan || 'Aparatur Sipil Negara'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-blue-700">
                            <MapPin className="w-3.5 h-3.5" />
                            {trip.tujuan}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatTanggalIndo(trip.tanggalBerangkat)} s.d. {formatTanggalIndo(trip.tanggalKembali)} ({durasi} Hari)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-xs text-slate-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                        Detail <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Agenda Terbaru / Mendatang */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Jadwal Perjalanan Dinas Terbaru & Mendatang
            </h3>
            <div className="divide-y divide-slate-100">
              {upcomingTrips.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTripDetail(t)}
                  className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <span className="font-semibold text-slate-800 truncate">{t.namaPelaksana}</span>
                    <span className="text-slate-400">ke</span>
                    <span className="font-medium text-blue-600 shrink-0">{t.tujuan}</span>
                  </div>
                  <div className="text-slate-500 shrink-0">
                    {formatTanggalIndo(t.tanggalBerangkat)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom 3: 6 Destinasi Terpopuler & Panduan Cepat */}
        <div className="space-y-6">
          
          {/* Card Destinasi Terbanyak */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Destinasi Terbanyak</span>
              </h3>
              <span className="text-xs text-slate-500">{topTujuan.length} Lokasi</span>
            </div>

            <div className="space-y-2.5">
              {topTujuan.map(([tujuan, jumlah], idx) => {
                const persentase = Math.round((jumlah / (stats.totalPerjalanan || 1)) * 100);
                return (
                  <div key={tujuan} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 flex items-center gap-1.5 truncate">
                        <span className="w-4 text-slate-400 font-bold">{idx + 1}.</span>
                        <span className="truncate">{tujuan}</span>
                      </span>
                      <span className="text-slate-900 font-bold ml-2 shrink-0">
                        {jumlah}x <span className="text-slate-400 text-[10px]">({persentase}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${persentase}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Pintasan Fitur */}
          <div className="bg-linear-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold">Pintasan Cepat</h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Ingin mengecek apakah ada pegawai yang bertugas di lokasi yang sama? Buka kalender interaktif untuk visualisasi lengkap.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="w-full py-2 px-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Lihat Kalender Interaktif</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('monitoring')}
                className="w-full py-2 px-3 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-blue-400/30"
              >
                <Users className="w-4 h-4" />
                <span>Monitoring Pegawai</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
