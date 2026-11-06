import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Filter,
  Search,
  Calendar,
  Building,
  RotateCcw
} from 'lucide-react';
import { PerjalananDinas } from '../types/index';
import { formatTanggalIndo, hitungDurasiHari, hitungStatusPerjalanan } from '../utils/dateUtils';
import { exportDataKeExcel } from '../utils/excelParser';
import { cetakLaporanPdf } from '../utils/pdfGenerator';
import { getAppSettings } from '../services/storageService';

interface RekapitulasiViewProps {
  trips: PerjalananDinas[];
  initialFilterNama?: string;
  onSelectTripDetail: (trip: PerjalananDinas) => void;
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({
  trips,
  initialFilterNama = '',
  onSelectTripDetail,
}) => {
  const [filterBulan, setFilterBulan] = useState<string>('all');
  const [filterTahun, setFilterTahun] = useState<string>('2026');
  const [filterNama, setFilterNama] = useState<string>(initialFilterNama);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const settings = getAppSettings();

  // Daftar nama pegawai untuk dropdown
  const daftarNamaPegawai = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.namaPelaksana) set.add(t.namaPelaksana.trim());
    });
    return Array.from(set).sort();
  }, [trips]);

  // Daftar tahun unik
  const daftarTahun = useMemo(() => {
    const set = new Set<string>();
    set.add('2025');
    set.add('2026');
    set.add('2027');
    trips.forEach((t) => {
      if (t.tanggalBerangkat) {
        const y = t.tanggalBerangkat.split('-')[0];
        if (y) set.add(y);
      }
    });
    return Array.from(set).sort();
  }, [trips]);

  const bulanList = [
    { val: '01', nama: 'Januari' },
    { val: '02', nama: 'Februari' },
    { val: '03', nama: 'Maret' },
    { val: '04', nama: 'April' },
    { val: '05', nama: 'Mei' },
    { val: '06', nama: 'Juni' },
    { val: '07', nama: 'Juli' },
    { val: '08', nama: 'Agustus' },
    { val: '09', nama: 'September' },
    { val: '10', nama: 'Oktober' },
    { val: '11', nama: 'November' },
    { val: '12', nama: 'Desember' },
  ];

  // Filtering data
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // Filter Tahun
      if (filterTahun !== 'all') {
        const yearMatch =
          trip.tanggalBerangkat?.startsWith(filterTahun) ||
          trip.tanggalKembali?.startsWith(filterTahun);
        if (!yearMatch) return false;
      }

      // Filter Bulan
      if (filterBulan !== 'all') {
        const monthPrefix = `${filterTahun !== 'all' ? filterTahun : ''}-${filterBulan}`;
        const berangkatMatch = trip.tanggalBerangkat?.includes(`-${filterBulan}-`);
        const kembaliMatch = trip.tanggalKembali?.includes(`-${filterBulan}-`);
        if (!berangkatMatch && !kembaliMatch) return false;
      }

      // Filter Pegawai
      if (filterNama && trip.namaPelaksana?.trim().toLowerCase() !== filterNama.toLowerCase()) {
        return false;
      }

      // Filter Status
      const status = hitungStatusPerjalanan(trip.tanggalBerangkat, trip.tanggalKembali, todayStr);
      if (filterStatus !== 'all' && status !== filterStatus) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          trip.namaPelaksana?.toLowerCase().includes(q) ||
          trip.tujuan?.toLowerCase().includes(q) ||
          (trip.nomorSpd && trip.nomorSpd.toLowerCase().includes(q)) ||
          (trip.maksudPerjalanan && trip.maksudPerjalanan.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => b.tanggalBerangkat.localeCompare(a.tanggalBerangkat));
  }, [trips, filterBulan, filterTahun, filterNama, filterStatus, searchQuery, todayStr]);

  // Total durasi akumulasi
  const totalHariFiltered = useMemo(() => {
    return filteredTrips.reduce((acc, curr) => acc + hitungDurasiHari(curr.tanggalBerangkat, curr.tanggalKembali), 0);
  }, [filteredTrips]);

  const handleExportExcel = () => {
    const namaBulanStr = filterBulan !== 'all' ? `_Bulan_${filterBulan}` : '';
    const filename = `Rekap_SPD_Konawe_${filterTahun}${namaBulanStr}.xlsx`;
    exportDataKeExcel(filteredTrips, filename);
  };

  const handleExportPdf = () => {
    const bulanObj = bulanList.find((b) => b.val === filterBulan);
    const namaBulan = bulanObj ? bulanObj.nama : 'Semua Bulan';
    const periodeStr = `${namaBulan} ${filterTahun !== 'all' ? filterTahun : ''}`.trim();

    cetakLaporanPdf(filteredTrips, {
      judul: 'REKAPITULASI LAPORAN PERJALANAN DINAS PEGAWAI',
      periode: periodeStr,
      filterPegawai: filterNama || undefined,
      pejabatPenandatangan: {
        kota: settings.kota,
        nama: settings.pejabatNama,
        nip: settings.pejabatNip,
        jabatan: settings.pejabatJabatan,
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setFilterBulan('all');
    setFilterTahun('all');
    setFilterNama('');
    setFilterStatus('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Tombol Export Utama */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Laporan & Rekapitulasi Resmi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rekapitulasi Perjalanan Dinas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ekspor rekapitulasi ke format Excel, unduh dokumen PDF resmi Pemkab Konawe, atau cetak fisik.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={filteredTrips.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={filteredTrips.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF Resmi</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter Data Laporan</span>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Filter Tahun */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Tahun
            </label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Semua Tahun</option>
              {daftarTahun.map((th) => (
                <option key={th} value={th}>
                  Tahun {th}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bulan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Bulan
            </label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Semua Bulan</option>
              {bulanList.map((b) => (
                <option key={b.val} value={b.val}>
                  {b.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Pegawai */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Nama Pegawai
            </label>
            <select
              value={filterNama}
              onChange={(e) => setFilterNama(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Pegawai</option>
              {daftarNamaPegawai.map((nama) => (
                <option key={nama} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Status Perjalanan
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="Sedang Berlangsung">Sedang Berlangsung</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Pencarian Teks */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Pencarian Cepat
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci..."
                className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>
          </div>

        </div>

        {/* Ringkasan Filter Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div>
            Menampilkan: <strong className="text-slate-900">{filteredTrips.length}</strong> data perjalanan dinas
          </div>
          <div>
            Total Hari Dinas: <strong className="text-blue-700 font-bold">{totalHariFiltered}</strong> Hari
          </div>
        </div>
      </div>

      {/* Tabel Rekapitulasi Profesional (Sesuai Butir I Prompt) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Header Kop Dokumen (Khusus jika dicetak cetak print) */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 print:block">
          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
              PEMERINTAH KABUPATEN KONAWE
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              {settings.instansi}
            </p>
            <p className="text-xs text-slate-500">
              REKAPITULASI SURAT PERINTAH TUGAS & PERJALANAN DINAS PEGAWAI
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No.</th>
                <th className="py-3 px-4">Nama Pelaksana</th>
                <th className="py-3 px-3">Tgl Berangkat</th>
                <th className="py-3 px-3">Tgl Kembali</th>
                <th className="py-3 px-3 text-center">Durasi</th>
                <th className="py-3 px-4">Tujuan</th>
                <th className="py-3 px-4">Maksud Tugas</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada data perjalanan dinas yang sesuai filter</p>
                    <p className="text-xs mt-0.5">Silakan ganti pilihan bulan, tahun, atau nama pegawai.</p>
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
                      onClick={() => onSelectTripDetail(trip)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 text-center font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{trip.namaPelaksana}</div>
                        {trip.nip && (
                          <div className="text-[11px] text-slate-400 font-mono">NIP: {trip.nip}</div>
                        )}
                        {trip.jabatan && (
                          <div className="text-[11px] text-slate-500">{trip.jabatan}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {formatTanggalIndo(trip.tanggalBerangkat)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {formatTanggalIndo(trip.tanggalKembali)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-blue-700 whitespace-nowrap">
                        {durasi} Hari
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {trip.tujuan}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title={trip.maksudPerjalanan}>
                        {trip.maksudPerjalanan || '-'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredTrips.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-800 text-xs">
                  <td colSpan={4} className="py-3 px-4 text-right uppercase">
                    Total Keseluruhan Durasi:
                  </td>
                  <td className="py-3 px-3 text-center text-blue-700 text-sm">
                    {totalHariFiltered} Hari
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-slate-500">
                    Jumlah {filteredTrips.length} Surat Tugas
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Blok Tanda Tangan Laporan */}
        <div className="p-6 bg-slate-50/30 border-t border-slate-200 flex justify-end">
          <div className="text-right text-xs text-slate-700 space-y-1">
            <p>{settings.kota}, {formatTanggalIndo(todayStr, { lengkap: true })}</p>
            <p className="font-semibold">{settings.pejabatJabatan}</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">{settings.pejabatNama}</p>
            <p className="text-slate-500 font-mono">NIP. {settings.pejabatNip}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
