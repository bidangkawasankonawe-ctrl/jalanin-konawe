import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { BentrokPerjalanan, PerjalananDinas } from '../types/index';
import { formatTanggalIndo } from '../utils/dateUtils';

interface DeteksiBentrokViewProps {
  conflicts: BentrokPerjalanan[];
  onOpenEditTrip: (trip: PerjalananDinas) => void;
  onDeleteTrip: (id: string, nama: string) => void;
}

export const DeteksiBentrokView: React.FC<DeteksiBentrokViewProps> = ({
  conflicts,
  onOpenEditTrip,
  onDeleteTrip,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header View */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Audit & Deteksi Bentrok Jadwal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pendeteksian Tumpang Tindih Jadwal ASN
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sistem otomatis menganalisis dan mendeteksi jika seorang pegawai ditugaskan pada dua kegiatan berbeda dalam waktu bersamaan.
          </p>
        </div>

        <div>
          {conflicts.length > 0 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-800 border border-red-300 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
              <span>{conflicts.length} Kasus Bentrok Terdeteksi</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Semua Jadwal Tertib (0 Bentrok)</span>
            </div>
          )}
        </div>
      </div>

      {/* Konten Utama */}
      {conflicts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Tidak Ada Jadwal yang Berbenturan
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Seluruh data perjalanan dinas pegawai tercatat dengan tertib dan tidak ada pegawai yang memiliki penugasan ganda pada rentang tanggal yang sama.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
              Sistem melakukan validasi otomatis setiap kali data ditambahkan atau diimpor.
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Daftar di bawah ini menampilkan penugasan perjalanan dinas yang saling beririsan tanggalnya untuk pegawai yang sama. Silakan klik tombol <strong>Edit Jadwal</strong> atau <strong>Hapus</strong> untuk menyesuaikan tanggal penugasan.
            </p>
          </div>

          <div className="space-y-4">
            {conflicts.map((bentrok, index) => (
              <div
                key={`${bentrok.trip1.id}-${bentrok.trip2.id}-${index}`}
                className="bg-white rounded-2xl border-2 border-red-200 shadow-xs p-5 sm:p-6 space-y-4"
              >
                {/* Header Konflik */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {bentrok.pegawai.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {bentrok.pegawai}
                      </h3>
                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Tumpang tindih selama <strong>{bentrok.jumlahHariBentrok} Hari</strong> ({formatTanggalIndo(bentrok.tglMulaiBentrok)} s.d. {formatTanggalIndo(bentrok.tglSelesaiBentrok)})
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white self-start sm:self-auto">
                    Bentrok #{index + 1}
                  </span>
                </div>

                {/* Dua Surat Tugas yang Saling Bertentangan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Trip 1 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Penugasan 1
                      </span>
                      {bentrok.trip1.nomorSpd && (
                        <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {bentrok.trip1.nomorSpd}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Tujuan: {bentrok.trip1.tujuan}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {formatTanggalIndo(bentrok.trip1.tanggalBerangkat)} s.d. {formatTanggalIndo(bentrok.trip1.tanggalKembali)}
                        </span>
                      </div>
                      {bentrok.trip1.maksudPerjalanan && (
                        <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                          "{bentrok.trip1.maksudPerjalanan}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenEditTrip(bentrok.trip1)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ubah Tanggal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTrip(bentrok.trip1.id, bentrok.trip1.namaPelaksana)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Penugasan 1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Trip 2 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Penugasan 2
                      </span>
                      {bentrok.trip2.nomorSpd && (
                        <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {bentrok.trip2.nomorSpd}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Tujuan: {bentrok.trip2.tujuan}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {formatTanggalIndo(bentrok.trip2.tanggalBerangkat)} s.d. {formatTanggalIndo(bentrok.trip2.tanggalKembali)}
                        </span>
                      </div>
                      {bentrok.trip2.maksudPerjalanan && (
                        <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                          "{bentrok.trip2.maksudPerjalanan}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenEditTrip(bentrok.trip2)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ubah Tanggal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTrip(bentrok.trip2.id, bentrok.trip2.namaPelaksana)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Penugasan 2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
