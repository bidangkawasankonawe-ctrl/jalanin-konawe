import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  ChevronRight,
  Filter,
  CheckCircle2,
  Building,
  UserCheck
} from 'lucide-react';
import { PerjalananDinas } from '../types/index';
import { rekapMonitoringPegawai, EmployeeSummary } from '../utils/statsCalculator';
import { ActiveTab } from './Sidebar';

interface MonitoringPegawaiViewProps {
  trips: PerjalananDinas[];
  onOpenEmployeeCalendar: (namaPegawai: string) => void;
  onFilterEmployeeRekap: (namaPegawai: string) => void;
}

export const MonitoringPegawaiView: React.FC<MonitoringPegawaiViewProps> = ({
  trips,
  onOpenEmployeeCalendar,
  onFilterEmployeeRekap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Sedang Dinas' | 'Di Kantor'>('all');

  const today = new Date().toISOString().split('T')[0];
  const listPegawai = useMemo(() => rekapMonitoringPegawai(trips, today), [trips, today]);

  const filteredPegawai = useMemo(() => {
    return listPegawai.filter((p) => {
      const matchSearch =
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nip && p.nip.includes(searchQuery)) ||
        (p.jabatan && p.jabatan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.daftarTujuan.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || p.statusSaatIni === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [listPegawai, searchQuery, statusFilter]);

  const jumlahSedangDinas = listPegawai.filter((p) => p.statusSaatIni === 'Sedang Dinas').length;
  const jumlahDiKantor = listPegawai.filter((p) => p.statusSaatIni === 'Di Kantor').length;

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Users className="w-4 h-4" />
            <span>Direktori & Monitoring Pegawai</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pemantauan Aktivitas Pegawai
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar lengkap ASN, rekap frekuensi tugas, total hari, riwayat lokasi tujuan, dan kalender personal.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Pegawai</span>
            <span className="font-bold text-sm text-slate-900">{listPegawai.length} Orang</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <span className="text-amber-600 block text-[10px] uppercase font-bold">Sedang Dinas</span>
            <span className="font-bold text-sm text-amber-700">{jumlahSedangDinas} Orang</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <span className="text-emerald-600 block text-[10px] uppercase font-bold">Di Kantor</span>
            <span className="font-bold text-sm text-emerald-700">{jumlahDiKantor} Orang</span>
          </div>
        </div>
      </div>

      {/* Bar Pencarian & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIP, jabatan, atau tujuan..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        {/* Filter Tab Status */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({listPegawai.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Sedang Dinas')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'Sedang Dinas'
                ? 'bg-amber-500 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sedang Dinas ({jumlahSedangDinas})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Di Kantor')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'Di Kantor'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Di Kantor ({jumlahDiKantor})
          </button>
        </div>
      </div>

      {/* Grid Kartu Pegawai */}
      {filteredPegawai.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada pegawai yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPegawai.map((pegawai) => {
            const isSedangDinas = pegawai.statusSaatIni === 'Sedang Dinas';

            return (
              <div
                key={pegawai.nama}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Status Badge & Avatar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        {pegawai.nama.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {pegawai.nama}
                        </h2>
                        <p className="text-xs text-slate-500 truncate">
                          {pegawai.jabatan || 'Aparatur Sipil Negara'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        isSedangDinas
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSedangDinas ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
                      {pegawai.statusSaatIni}
                    </span>
                  </div>

                  {pegawai.nip && (
                    <div className="text-[11px] text-slate-400 mb-3 font-mono">
                      NIP: {pegawai.nip}
                    </div>
                  )}

                  {/* Jika sedang dinas, tampilkan lokasi saat ini */}
                  {isSedangDinas && pegawai.tujuanSaatIni && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">
                        Saat ini di: <strong>{pegawai.tujuanSaatIni}</strong>
                      </span>
                    </div>
                  )}

                  {/* Statistik Angka: Jumlah Perjalanan & Total Hari */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">
                        Total Tugas
                      </span>
                      <span className="text-base font-extrabold text-blue-700">
                        {pegawai.totalPerjalanan}x
                      </span>
                    </div>
                    <div className="border-l border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">
                        Total Hari
                      </span>
                      <span className="text-base font-extrabold text-indigo-700">
                        {pegawai.totalHari} Hari
                      </span>
                    </div>
                  </div>

                  {/* Riwayat Tujuan (Tags) */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Riwayat Destinasi:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                      {pegawai.daftarTujuan.length === 0 ? (
                        <span className="text-xs text-slate-600 italic">Belum ada riwayat</span>
                      ) : (
                        pegawai.daftarTujuan.map((tuj) => (
                          <span
                            key={tuj}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                          >
                            <MapPin className="w-2.5 h-2.5 text-slate-600" />
                            {tuj}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Tombol Aksi: Kalender Individual & Rekap Pegawai */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenEmployeeCalendar(pegawai.nama)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Kalender</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterEmployeeRekap(pegawai.nama)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    title="Lihat riwayat SPD pegawai ini di Rekapitulasi"
                  >
                    <span>Rekap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
