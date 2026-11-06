import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  FileText,
  DollarSign,
  Edit2,
  Trash2,
  Printer,
  ShieldCheck,
  Building
} from 'lucide-react';
import { PerjalananDinas } from '../types/index';
import { formatTanggalIndo, hitungDurasiHari, hitungStatusPerjalanan } from '../utils/dateUtils';

interface TripDetailModalProps {
  trip: PerjalananDinas | null;
  onClose: () => void;
  onEdit: (trip: PerjalananDinas) => void;
  onDelete: (id: string, nama: string) => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!trip) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const durasi = hitungDurasiHari(trip.tanggalBerangkat, trip.tanggalKembali);
  const status = hitungStatusPerjalanan(trip.tanggalBerangkat, trip.tanggalKembali, todayStr);

  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
  if (status === 'Sedang Berlangsung') {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
  } else if (status === 'Akan Datang') {
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  } else {
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
        
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                {status}
              </span>
              {trip.nomorSpd && (
                <span className="text-xs font-mono font-medium text-slate-500">
                  {trip.nomorSpd}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Rincian Surat Perintah Tugas (SPD)
            </h3>
            <p className="text-xs text-slate-500">
              Pemerintah Kabupaten Konawe
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identitas Pelaksana */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            {trip.namaPelaksana.charAt(0)}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              {trip.namaPelaksana}
            </h4>
            <p className="text-xs text-slate-500">
              {trip.nip ? `NIP: ${trip.nip} • ` : ''}
              {trip.jabatan || 'Aparatur Sipil Negara'}
            </p>
          </div>
        </div>

        {/* Detail Waktu & Lokasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
              Tujuan Perjalanan
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{trip.tujuan}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
              Durasi Penugasan
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{durasi} Hari Kalender</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
              Tanggal Berangkat
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{formatTanggalIndo(trip.tanggalBerangkat, { lengkap: true })}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
              Tanggal Kembali
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{formatTanggalIndo(trip.tanggalKembali, { lengkap: true })}</span>
            </div>
          </div>

        </div>

        {/* Maksud Penugasan */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
            Maksud & Kegiatan Perjalanan Dinas:
          </span>
          <p className="text-slate-800 leading-relaxed font-medium">
            {trip.maksudPerjalanan || 'Tidak ada uraian tugas tambahan yang dicatat.'}
          </p>
        </div>

        {/* Biaya & Keterangan Tambahan */}
        {(trip.biaya || trip.keterangan) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {trip.biaya && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Alokasi Biaya</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  Rp {trip.biaya.toLocaleString('id-ID')}
                </span>
              </div>
            )}
            {trip.keterangan && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Keterangan</span>
                <span className="text-slate-700">{trip.keterangan}</span>
              </div>
            )}
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onDelete(trip.id, trip.namaPelaksana);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onEdit(trip);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Data</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
