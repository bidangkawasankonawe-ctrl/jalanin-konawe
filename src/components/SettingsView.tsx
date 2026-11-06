import React, { useState, useRef } from 'react';
import {
  Settings,
  Building,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Link2,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { PerjalananDinas } from '../types/index';
import {
  AppSettings,
  getAppSettings,
  saveAppSettings,
  unduhBackupData,
  pulihkanDariBackup
} from '../services/storageService';
import { INITIAL_TRIPS } from '../data/initialData';

interface SettingsViewProps {
  trips: PerjalananDinas[];
  onDataRestored: (trips: PerjalananDinas[]) => void;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  trips,
  onDataRestored,
  onRefreshData,
}) => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBackupDownload = () => {
    unduhBackupData(trips);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError('');
    setRestoreSuccess(false);

    try {
      const text = await file.text();
      const restored = await pulihkanDariBackup(text);
      setSettings(getAppSettings());
      onDataRestored(restored);
      setRestoreSuccess(true);
      setTimeout(() => setRestoreSuccess(false), 4000);
    } catch (err: any) {
      setRestoreError(err.message || 'Gagal memulihkan database.');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke data standar bawaan Pemkab Konawe? Seluruh data yang belum dibackup akan tertimpa.')) {
      onDataRestored(INITIAL_TRIPS);
      alert('Data berhasil direset ke standar awal Kabupaten Konawe.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header View */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Settings className="w-4 h-4" />
            <span>Konfigurasi & Pemeliharaan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pengaturan Sistem & Basis Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Atur identitas kop surat resmi, pejabat penandatangan SPD, backup basis data, dan integrasi Google Sheets.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan</span>
          </div>
        )}
      </div>

      {/* Form Identitas Instansi & Pejabat Penandatangan */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-900">
          <Building className="w-4 h-4 text-blue-600" />
          <span>Identitas Kop Surat Laporan & Tanda Tangan Resmi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Instansi / Perangkat Daerah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.instansi}
              onChange={(e) => setSettings({ ...settings, instansi: e.target.value })}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ibu Kota / Tempat Penerbitan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.kota}
              onChange={(e) => setSettings({ ...settings, kota: e.target.value })}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jabatan Pejabat Penandatangan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.pejabatJabatan}
              onChange={(e) => setSettings({ ...settings, pejabatJabatan: e.target.value })}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Pejabat & Gelar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.pejabatNama}
              onChange={(e) => setSettings({ ...settings, pejabatNama: e.target.value })}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              NIP Pejabat Penandatangan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.pejabatNip}
              onChange={(e) => setSettings({ ...settings, pejabatNip: e.target.value })}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Kop & Pejabat</span>
          </button>
        </div>
      </form>

      {/* Bagian Backup & Restore Basis Data */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Cadangan (Backup) & Pemulihan (Restore) Basis Data</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Amankan seluruh catatan perjalanan dinas dengan mengunduh file cadangan format JSON, atau pulihkan data dari file cadangan yang pernah dibuat sebelumnya.
        </p>

        {restoreError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{restoreError}</span>
          </div>
        )}

        {restoreSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Database berhasil dipulihkan dari file backup!</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Tombol Unduh Backup */}
          <button
            type="button"
            onClick={handleBackupDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Backup Database (.json)</span>
          </button>

          {/* Tombol Restore dari File */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Pulihkan dari File Backup</span>
          </button>

          {/* Reset ke Data Bawaan */}
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-semibold transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset ke Standar Awal</span>
          </button>
        </div>
      </div>

    </div>
  );
};
