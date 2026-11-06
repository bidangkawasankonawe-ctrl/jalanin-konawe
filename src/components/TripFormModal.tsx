import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  PlusCircle,
  Edit2,
  Calendar,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  Building,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { PerjalananDinas, BentrokPerjalanan } from '../types/index';
import { validasiRentangTanggal, hitungDurasiHari } from '../utils/dateUtils';
import { cekBentrokSingle } from '../utils/conflictDetector';

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripData: Omit<PerjalananDinas, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editingTrip?: PerjalananDinas | null;
  allTrips: PerjalananDinas[];
}

const KONAWE_DESTINATIONS = [
  'Kecamatan Unaaha',
  'Kecamatan Wawotobi',
  'Kecamatan Pondidaha',
  'Kecamatan Lambuya',
  'Kecamatan Soropia',
  'Kecamatan Sampara',
  'Kecamatan Wonggeduku',
  'Kecamatan Besulutu',
  'Kecamatan Bondoala',
  'Kecamatan Abuki',
  'Kota Kendari',
  'Kota Baubau',
  'Kota Makassar',
  'Jakarta',
];

export const TripFormModal: React.FC<TripFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTrip,
  allTrips,
}) => {
  const [namaPelaksana, setNamaPelaksana] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [tanggalBerangkat, setTanggalBerangkat] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [nomorSpd, setNomorSpd] = useState('');
  const [maksudPerjalanan, setMaksudPerjalanan] = useState('');
  const [biaya, setBiaya] = useState<string>('');
  const [keterangan, setKeterangan] = useState('');
  const [formError, setFormError] = useState('');

  // Sinkronisasi data saat edit
  useEffect(() => {
    if (editingTrip) {
      setNamaPelaksana(editingTrip.namaPelaksana || '');
      setNip(editingTrip.nip || '');
      setJabatan(editingTrip.jabatan || '');
      setTanggalBerangkat(editingTrip.tanggalBerangkat || '');
      setTanggalKembali(editingTrip.tanggalKembali || '');
      setTujuan(editingTrip.tujuan || '');
      setNomorSpd(editingTrip.nomorSpd || '');
      setMaksudPerjalanan(editingTrip.maksudPerjalanan || '');
      setBiaya(editingTrip.biaya ? String(editingTrip.biaya) : '');
      setKeterangan(editingTrip.keterangan || '');
    } else {
      // Default tanggal berangkat hari ini atau besok
      const today = new Date().toISOString().split('T')[0];
      setNamaPelaksana('');
      setNip('');
      setJabatan('');
      setTanggalBerangkat(today);
      setTanggalKembali(today);
      setTujuan('');
      setNomorSpd(`090/SPD/KNW/${new Date().getFullYear()}`);
      setMaksudPerjalanan('');
      setBiaya('');
      setKeterangan('');
    }
    setFormError('');
  }, [editingTrip, isOpen]);

  // Daftar nama pegawai eksisting untuk autofill
  const existingEmployees = useMemo(() => {
    const map = new Map<string, { nip?: string; jabatan?: string }>();
    allTrips.forEach((t) => {
      if (t.namaPelaksana) {
        map.set(t.namaPelaksana.trim(), { nip: t.nip, jabatan: t.jabatan });
      }
    });
    return map;
  }, [allTrips]);

  // Autofill NIP & Jabatan saat memilih nama
  const handleNamaChange = (val: string) => {
    setNamaPelaksana(val);
    const existing = existingEmployees.get(val.trim());
    if (existing) {
      if (existing.nip && !nip) setNip(existing.nip);
      if (existing.jabatan && !jabatan) setJabatan(existing.jabatan);
    }
  };

  // Live Overlap / Conflict Detection
  const liveConflicts: BentrokPerjalanan[] = useMemo(() => {
    if (!namaPelaksana || !tanggalBerangkat || !tanggalKembali) return [];
    return cekBentrokSingle(
      {
        id: editingTrip?.id,
        namaPelaksana,
        tanggalBerangkat,
        tanggalKembali,
      },
      allTrips
    );
  }, [namaPelaksana, tanggalBerangkat, tanggalKembali, editingTrip, allTrips]);

  const durasiHari = hitungDurasiHari(tanggalBerangkat, tanggalKembali);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!namaPelaksana.trim()) {
      setFormError('Nama pelaksana wajib diisi.');
      return;
    }
    if (!tujuan.trim()) {
      setFormError('Tujuan perjalanan dinas wajib diisi.');
      return;
    }

    const valDate = validasiRentangTanggal(tanggalBerangkat, tanggalKembali);
    if (!valDate.valid) {
      setFormError(valDate.pesan || 'Rentang tanggal tidak valid.');
      return;
    }

    onSave(
      {
        namaPelaksana: namaPelaksana.trim(),
        nip: nip.trim() || undefined,
        jabatan: jabatan.trim() || undefined,
        tanggalBerangkat,
        tanggalKembali,
        tujuan: tujuan.trim(),
        nomorSpd: nomorSpd.trim() || undefined,
        maksudPerjalanan: maksudPerjalanan.trim() || undefined,
        biaya: biaya ? parseFloat(biaya) : undefined,
        keterangan: keterangan.trim() || undefined,
      },
      editingTrip?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {editingTrip ? <Edit2 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingTrip ? 'Edit Data Perjalanan Dinas' : 'Tambah Perjalanan Dinas Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Pemerintah Kabupaten Konawe - Formulir Surat Perintah Tugas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Error Form */}
        {formError && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Live Conflict Alert Banner */}
        {liveConflicts.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Peringatan Bentrok Jadwal Terdeteksi!</span>
            </div>
            <p className="leading-relaxed">
              Pegawai <strong>{namaPelaksana}</strong> sudah memiliki {liveConflicts.length} penugasan lain pada rentang tanggal ini:
            </p>
            <ul className="list-disc pl-5 pt-1 space-y-0.5">
              {liveConflicts.map((c, i) => (
                <li key={i}>
                  Tujuan <strong>{c.trip2.tujuan}</strong> ({c.trip2.tanggalBerangkat} s.d. {c.trip2.tanggalKembali})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Formulir Input */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Baris 1: Nama Pelaksana & NIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pelaksana <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="pegawai-suggestions"
                value={namaPelaksana}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="Contoh: Drs. H. Ferdinand, M.Si"
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                required
              />
              <datalist id="pegawai-suggestions">
                {Array.from(existingEmployees.keys()).map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                NIP Pegawai
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="19850115 201001 1 002"
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Baris 2: Jabatan & Nomor SPD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Jabatan / Pangkat
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Kepala Bidang / Analis Kebijakan"
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nomor Surat Tugas / SPD
              </label>
              <input
                type="text"
                value={nomorSpd}
                onChange={(e) => setNomorSpd(e.target.value)}
                placeholder="090/SPD/BK-KNW/XI/2026"
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Baris 3: Tanggal Berangkat & Tanggal Kembali */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Berangkat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalBerangkat}
                onChange={(e) => setTanggalBerangkat(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Kembali <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                min={tanggalBerangkat}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            <div className="sm:col-span-2 text-right text-xs font-bold text-blue-700">
              Total Durasi: {durasiHari > 0 ? `${durasiHari} Hari Kalender` : 'Rentang tidak valid'}
            </div>
          </div>

          {/* Baris 4: Tujuan Perjalanan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tujuan Perjalanan Dinas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="destination-suggestions"
              value={tujuan}
              onChange={(e) => setTujuan(e.target.value)}
              placeholder="Pilih atau ketik tujuan (e.g. Kecamatan Unaaha, Kendari, Jakarta)"
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              required
            />
            <datalist id="destination-suggestions">
              {KONAWE_DESTINATIONS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          {/* Baris 5: Maksud Perjalanan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Maksud / Uraian Tugas Perjalanan
            </label>
            <textarea
              rows={2}
              value={maksudPerjalanan}
              onChange={(e) => setMaksudPerjalanan(e.target.value)}
              placeholder="Contoh: Monitoring dan evaluasi progres penataan kawasan permukiman kumuh..."
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Baris 6: Biaya & Keterangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Estimasi Anggaran / Biaya (Rp)
              </label>
              <input
                type="number"
                value={biaya}
                onChange={(e) => setBiaya(e.target.value)}
                placeholder="2500000"
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Catatan / Keterangan Tambahan
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Keterangan opsional"
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tombol Simpan & Batal */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingTrip ? 'Perbarui Data' : 'Simpan Data Perjalanan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
