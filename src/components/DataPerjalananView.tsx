import React, { useState, useMemo } from 'react';
import {
  TableProperties,
  PlusCircle,
  UploadCloud,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { PerjalananDinas } from '../types/index';
import { formatTanggalIndo, hitungDurasiHari, hitungStatusPerjalanan } from '../utils/dateUtils';
import { ActiveTab } from './Sidebar';

interface DataPerjalananViewProps {
  trips: PerjalananDinas[];
  onOpenAddModal: () => void;
  onOpenEditModal: (trip: PerjalananDinas) => void;
  onDeleteTrip: (id: string, nama: string) => void;
  onSelectTripDetail: (trip: PerjalananDinas) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const DataPerjalananView: React.FC<DataPerjalananViewProps> = ({
  trips,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTrip,
  onSelectTripDetail,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTujuan, setFilterTujuan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<'berangkat' | 'nama' | 'tujuan'>('berangkat');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const todayStr = new Date().toISOString().split('T')[0];

  // Daftar tujuan unik untuk filter
  const daftarTujuan = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.tujuan) set.add(t.tujuan.trim());
    });
    return Array.from(set).sort();
  }, [trips]);

  // Filter dan sorting
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.namaPelaksana?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tujuan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.nomorSpd && t.nomorSpd.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.maksudPerjalanan && t.maksudPerjalanan.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTujuan = filterTujuan === 'all' || t.tujuan === filterTujuan;

      const status = hitungStatusPerjalanan(t.tanggalBerangkat, t.tanggalKembali, todayStr);
      const matchStatus = filterStatus === 'all' || status === filterStatus;

      return matchSearch && matchTujuan && matchStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'berangkat') {
        comparison = a.tanggalBerangkat.localeCompare(b.tanggalBerangkat);
      } else if (sortField === 'nama') {
        comparison = a.namaPelaksana.localeCompare(b.namaPelaksana);
      } else if (sortField === 'tujuan') {
        comparison = a.tujuan.localeCompare(b.tujuan);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [trips, searchQuery, filterTujuan, filterStatus, sortField, sortOrder, todayStr]);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <TableProperties className="w-4 h-4" />
            <span>Master Basis Data</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Database Perjalanan Dinas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola, perbarui, cari, dan hapus data Surat Perintah Tugas & Perjalanan Dinas ASN.
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
        </div>
      </div>

      {/* Bar Pencarian & Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Input Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, tujuan, no. SPD, maksud tugas..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          {/* Filter Tujuan */}
          <div className="w-full sm:w-auto">
            <select
              value={filterTujuan}
              onChange={(e) => setFilterTujuan(e.target.value)}
              className="w-full sm:w-48 py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Semua Tujuan</option>
              {daftarTujuan.map((tuj) => (
                <option key={tuj} value={tuj}>
                  {tuj}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-44 py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Sedang Berlangsung">Sedang Berlangsung</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="w-full sm:w-auto flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 shrink-0">Urutkan:</span>
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [any, any];
                setSortField(f);
                setSortOrder(o);
              }}
              className="py-2 px-2.5 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="berangkat-desc">Berangkat (Terbaru)</option>
              <option value="berangkat-asc">Berangkat (Terlama)</option>
              <option value="nama-asc">Nama Pegawai (A-Z)</option>
              <option value="tujuan-asc">Tujuan (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Info Total Hasil */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Menampilkan <strong>{filteredTrips.length}</strong> dari <strong>{trips.length}</strong> data tersimpan
          </span>
          {(searchQuery || filterTujuan !== 'all' || filterStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterTujuan('all');
                setFilterStatus('all');
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Hapus Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Master */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-3 text-center w-12">No.</th>
                <th className="py-3.5 px-4">Nama Pelaksana</th>
                <th className="py-3.5 px-3">Tgl Berangkat</th>
                <th className="py-3.5 px-3">Tgl Kembali</th>
                <th className="py-3.5 px-3 text-center">Durasi</th>
                <th className="py-3.5 px-4">Tujuan</th>
                <th className="py-3.5 px-4">Nomor SPD</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada data perjalanan dinas yang ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">Silakan periksa filter atau klik "Tambah Data" untuk menginput.</p>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip, idx) => {
                  const durasi = hitungDurasiHari(trip.tanggalBerangkat, trip.tanggalKembali);
                  const status = hitungStatusPerjalanan(trip.tanggalBerangkat, trip.tanggalKembali, todayStr);

                  let badgeColor = 'bg-slate-100 text-slate-700';
                  if (status === 'Sedang Berlangsung') {
                    badgeColor = 'bg-amber-100 text-amber-800 border border-amber-200';
                  } else if (status === 'Akan Datang') {
                    badgeColor = 'bg-blue-100 text-blue-800 border border-blue-200';
                  } else {
                    badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                  }

                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-3 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{trip.namaPelaksana}</div>
                        {trip.nip && (
                          <div className="text-[11px] text-slate-400 font-mono">NIP: {trip.nip}</div>
                        )}
                        {trip.jabatan && (
                          <div className="text-[11px] text-slate-500">{trip.jabatan}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {formatTanggalIndo(trip.tanggalBerangkat)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {formatTanggalIndo(trip.tanggalKembali)}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-blue-700 whitespace-nowrap">
                        {durasi} Hari
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{trip.tujuan}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                        {trip.nomorSpd || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectTripDetail(trip)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Lihat Detail"
                            aria-label={`Detail ${trip.namaPelaksana}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(trip)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Data"
                            aria-label={`Edit ${trip.namaPelaksana}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTrip(trip.id, trip.namaPelaksana)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Data"
                            aria-label={`Hapus ${trip.namaPelaksana}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
