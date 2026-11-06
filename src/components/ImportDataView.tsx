import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  History,
  RefreshCw,
  Sparkles,
  Link2,
  FileCheck,
  XCircle,
  HelpCircle,
  Wrench,
  Lightbulb,
  Info,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { PerjalananDinas } from '../types/index';
import {
  bacaFileExcelAtauCsv,
  autoMapColumns,
  petakanDanValidasiData,
  buatTemplateExcel,
  ColumnMapping,
  ParsedRowResult
} from '../utils/excelParser';
import { recordImportLog, getImportHistory, ImportLog } from '../services/storageService';
import { ambilDataDariGoogleSheet } from '../services/googleSheetsService';
import { formatTanggalIndo } from '../utils/dateUtils';

interface ImportDataViewProps {
  onCommitImport: (newTrips: PerjalananDinas[], mode: 'append' | 'replace') => void;
  currentTotalTrips: number;
}

export const ImportDataView: React.FC<ImportDataViewProps> = ({
  onCommitImport,
  currentTotalTrips,
}) => {
  const [activeSource, setActiveSource] = useState<'excel' | 'sheets'>('excel');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    namaPelaksana: '',
    tanggalBerangkat: '',
    tanggalKembali: '',
    tujuan: '',
    nomorSpd: '',
    maksudPerjalanan: '',
    nip: '',
    jabatan: '',
  });

  const [validationResult, setValidationResult] = useState<{
    hasil: ParsedRowResult[];
    jumlahValid: number;
    jumlahError: number;
  } | null>(null);

  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importLogs, setImportLogs] = useState<ImportLog[]>(getImportHistory());

  // Filter preview tabel & panduan error
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'error'>('all');
  const [showErrorGuide, setShowErrorGuide] = useState<boolean>(true);
  const [editingRow, setEditingRow] = useState<ParsedRowResult | null>(null);
  const [editRowData, setEditRowData] = useState<{
    namaPelaksana: string;
    tanggalBerangkat: string;
    tanggalKembali: string;
    tujuan: string;
    nomorSpd: string;
    maksudPerjalanan: string;
  }>({
    namaPelaksana: '',
    tanggalBerangkat: '',
    tanggalKembali: '',
    tujuan: '',
    nomorSpd: '',
    maksudPerjalanan: '',
  });

  // Google Sheets Form
  const [sheetUrlOrId, setSheetUrlOrId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [sheetApiKey, setSheetApiKey] = useState('');
  const [sheetError, setSheetError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unduh Template Excel
  const handleDownloadTemplate = () => {
    const bytes = buatTemplateExcel();
    const blob = new Blob([bytes.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Template_Perjalanan_Dinas_Konawe.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Upload File Excel/CSV
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setFileName(selected.name);
    setIsProcessing(true);

    try {
      const buffer = await selected.arrayBuffer();
      const parsed = bacaFileExcelAtauCsv(buffer);

      setHeaders(parsed.headers);
      setRawRows(parsed.rawRows);

      // Auto map kolom berdasarkan header
      const mapped = autoMapColumns(parsed.headers);
      setMapping(mapped);

      // Lakukan validasi data langsung
      const evaluated = petakanDanValidasiData(parsed.rawRows, mapped);
      setValidationResult(evaluated);
    } catch (err: any) {
      alert(`Gagal membaca file: ${err.message || 'Format tidak didukung'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-evaluasi saat mapping diubah manual
  const handleMappingChange = (key: keyof ColumnMapping, value: string) => {
    const updated = { ...mapping, [key]: value };
    setMapping(updated);
    if (rawRows.length > 0) {
      const evaluated = petakanDanValidasiData(rawRows, updated);
      setValidationResult(evaluated);
    }
  };

  // Handle Ambil Data dari Google Sheet
  const handleFetchGoogleSheet = async () => {
    if (!sheetUrlOrId.trim()) {
      setSheetError('Masukkan Spreadsheet URL atau ID terlebih dahulu');
      return;
    }
    setSheetError('');
    setIsProcessing(true);

    try {
      const result = await ambilDataDariGoogleSheet({
        sheetIdOrUrl: sheetUrlOrId,
        sheetName: sheetName || 'Sheet1',
        apiKey: sheetApiKey.trim() || undefined,
      });

      setFileName(`Google Sheet: ${sheetName}`);
      setHeaders(result.headers);
      setRawRows(result.rawRows);
      setMapping(result.suggestedMapping);

      const evaluated = petakanDanValidasiData(result.rawRows, result.suggestedMapping);
      setValidationResult(evaluated);
    } catch (err: any) {
      setSheetError(err.message || 'Gagal mengambil data dari Google Spreadsheet');
    } finally {
      setIsProcessing(false);
    }
  };

  // Buka modal perbaikan baris inline
  const handleStartEditRow = (row: ParsedRowResult) => {
    setEditingRow(row);
    setEditRowData({
      namaPelaksana: row.data.namaPelaksana || '',
      tanggalBerangkat: row.data.tanggalBerangkat || '',
      tanggalKembali: row.data.tanggalKembali || '',
      tujuan: row.data.tujuan || '',
      nomorSpd: row.data.nomorSpd || '',
      maksudPerjalanan: row.data.maksudPerjalanan || '',
    });
  };

  // Simpan hasil perbaikan baris inline
  const handleSaveRowEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow || !validationResult) return;

    const errors: string[] = [];
    const suggestions: string[] = [];

    const nama = editRowData.namaPelaksana.trim();
    const tglBerangkat = editRowData.tanggalBerangkat.trim();
    const tglKembali = editRowData.tanggalKembali.trim();
    const tujuan = editRowData.tujuan.trim();

    if (!nama) {
      errors.push('Nama Pelaksana kosong.');
      suggestions.push('Isi nama pegawai yang ditugaskan.');
    }
    if (!tujuan) {
      errors.push('Tujuan perjalanan kosong.');
      suggestions.push('Isi tujuan (misal: Kecamatan Unaaha, Kendari).');
    }

    if (!tglBerangkat) {
      errors.push('Tanggal Berangkat kosong.');
      suggestions.push('Pilih tanggal keberangkatan dengan format YYYY-MM-DD.');
    }
    if (!tglKembali) {
      errors.push('Tanggal Kembali kosong.');
      suggestions.push('Pilih tanggal kepulangan dengan format YYYY-MM-DD.');
    }

    if (tglBerangkat && tglKembali) {
      if (tglKembali < tglBerangkat) {
        errors.push(`Tanggal kembali (${tglKembali}) lebih awal dari tanggal berangkat (${tglBerangkat}).`);
        suggestions.push(`Ubah tanggal kembali agar sama dengan atau setelah tanggal berangkat (${tglBerangkat}).`);
      }
    }

    const isValid = errors.length === 0;

    const updatedHasil = validationResult.hasil.map((r) => {
      if (r.rowNumber === editingRow.rowNumber) {
        return {
          ...r,
          isValid,
          errors,
          suggestions,
          data: {
            ...r.data,
            namaPelaksana: nama,
            tanggalBerangkat: tglBerangkat,
            tanggalKembali: tglKembali,
            tujuan,
            nomorSpd: editRowData.nomorSpd.trim() || undefined,
            maksudPerjalanan: editRowData.maksudPerjalanan.trim() || undefined,
          },
        };
      }
      return r;
    });

    const newJumlahValid = updatedHasil.filter((r) => r.isValid).length;
    const newJumlahError = updatedHasil.filter((r) => !r.isValid).length;

    setValidationResult({
      hasil: updatedHasil,
      jumlahValid: newJumlahValid,
      jumlahError: newJumlahError,
    });

    setEditingRow(null);
  };

  // Hapus baris bermasalah dari daftar impor
  const handleDeleteProblemRow = (rowNumber: number) => {
    if (!validationResult) return;
    const updatedHasil = validationResult.hasil.filter((r) => r.rowNumber !== rowNumber);
    const newJumlahValid = updatedHasil.filter((r) => r.isValid).length;
    const newJumlahError = updatedHasil.filter((r) => !r.isValid).length;

    setValidationResult({
      hasil: updatedHasil,
      jumlahValid: newJumlahValid,
      jumlahError: newJumlahError,
    });
  };

  // Konfirmasi Import
  const handleExecuteImport = () => {
    if (!validationResult) return;

    // Filter hanya baris yang valid
    const validTrips: PerjalananDinas[] = validationResult.hasil
      .filter((r) => r.isValid)
      .map((r) => r.data as PerjalananDinas);

    if (validTrips.length === 0) {
      alert('Tidak ada baris data valid yang dapat diimpor.');
      return;
    }

    onCommitImport(validTrips, importMode);

    recordImportLog({
      fileName: fileName || 'Import Data',
      mode: importMode,
      totalRows: validationResult.hasil.length,
      validRows: validTrips.length,
    });

    setImportLogs(getImportHistory());
    setShowConfirmModal(false);

    // Reset input
    setFile(null);
    setFileName('');
    setHeaders([]);
    setRawRows([]);
    setValidationResult(null);

    alert(`Berhasil mengimpor ${validTrips.length} data perjalanan dinas ke dalam sistem!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header View */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <UploadCloud className="w-4 h-4" />
            <span>Integrasi & Impor Data</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Import Rekapitulasi Perjalanan Dinas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unggah file Excel (.xlsx), CSV, atau hubungkan langsung ke Google Spreadsheet dengan pemetaan kolom otomatis.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-2xs"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Format Template Excel</span>
        </button>
      </div>

      {/* Pilihan Sumber: File Excel / CSV vs Google Spreadsheet */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveSource('excel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSource === 'excel'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Unggah File Excel / CSV</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSource('sheets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSource === 'sheets'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Google Spreadsheet</span>
        </button>
      </div>

      {/* Bagian Input Sumber */}
      {activeSource === 'excel' ? (
        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center shadow-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Pilih atau Tarik File Excel / CSV ke Sini
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format file <strong>.xlsx, .xls, dan .csv</strong> dari komputer Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Telusuri File Komputer</span>
            </button>

            {fileName && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>File terpilih: <strong>{fileName}</strong></span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Form Google Spreadsheet */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sinkronisasi Data dari Google Spreadsheet
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan tautan (link) Google Spreadsheet atau Spreadsheet ID untuk membaca rekap perjalanan dinas secara langsung.
              </p>
            </div>

            {sheetError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{sheetError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Spreadsheet URL atau ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sheetUrlOrId}
                  onChange={(e) => setSheetUrlOrId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit"
                  className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Sheet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Sheet1"
                  className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Google Sheets API Key (Opsional, untuk spreadsheet privat)
              </label>
              <input
                type="password"
                value={sheetApiKey}
                onChange={(e) => setSheetApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Jika spreadsheet dibagikan dengan hak akses "Siapa saja yang memiliki link dapat melihat", API Key tidak diperlukan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFetchGoogleSheet}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Mengambil Data...' : 'Uji Koneksi & Ambil Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Pemetaan Kolom Otomatis & Manual (Jika file sudah dibaca) */}
      {headers.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Langkah 2: Pemetaan Kolom Otomatis
              </h3>
              <p className="text-xs text-slate-500">
                Sistem telah mencocokkan header kolom secara otomatis. Anda dapat mengubah pilihan jika diperlukan.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Mapping Aktif</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Nama Pelaksana (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pelaksana <span className="text-red-500">*</span>
              </label>
              <select
                value={mapping.namaPelaksana}
                onChange={(e) => handleMappingChange('namaPelaksana', e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Pilih Kolom --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Tanggal Berangkat (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Berangkat <span className="text-red-500">*</span>
              </label>
              <select
                value={mapping.tanggalBerangkat}
                onChange={(e) => handleMappingChange('tanggalBerangkat', e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Pilih Kolom --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Tanggal Kembali (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Kembali <span className="text-red-500">*</span>
              </label>
              <select
                value={mapping.tanggalKembali}
                onChange={(e) => handleMappingChange('tanggalKembali', e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Pilih Kolom --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Tujuan (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tujuan Perjalanan <span className="text-red-500">*</span>
              </label>
              <select
                value={mapping.tujuan}
                onChange={(e) => handleMappingChange('tujuan', e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Pilih Kolom --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Nomor SPD (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nomor SPD / Surat Tugas
              </label>
              <select
                value={mapping.nomorSpd}
                onChange={(e) => handleMappingChange('nomorSpd', e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Tidak Ada / Kosong --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Maksud Perjalanan (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Maksud Perjalanan
              </label>
              <select
                value={mapping.maksudPerjalanan}
                onChange={(e) => handleMappingChange('maksudPerjalanan', e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Tidak Ada / Kosong --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* NIP (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                NIP Pegawai
              </label>
              <select
                value={mapping.nip}
                onChange={(e) => handleMappingChange('nip', e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Tidak Ada / Kosong --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* Jabatan (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Jabatan / Golongan
              </label>
              <select
                value={mapping.jabatan}
                onChange={(e) => handleMappingChange('jabatan', e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Tidak Ada / Kosong --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

          </div>
        </div>
      )}

      {/* Langkah 3: Preview Data & Validasi Baris */}
      {validationResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Langkah 3: Preview & Validasi Data
              </h3>
              <p className="text-xs text-slate-500">
                Periksa keabsahan format tanggal dan kelengkapan data sebelum disimpan ke database.
              </p>
            </div>

            {/* Statistik Validasi (Target CSS Selector 1) */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {validationResult.jumlahValid} Baris Siap Diimpor
              </span>
              {validationResult.jumlahError > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setPreviewFilter('error');
                    setShowErrorGuide(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setPreviewFilter('error');
                      setShowErrorGuide(true);
                    }
                  }}
                  title="Klik untuk melihat rincian & solusi perbaikan baris bermasalah"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 font-bold cursor-pointer transition-all shadow-xs"
                >
                  <XCircle className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
                  <span>{validationResult.jumlahError} Baris Bermasalah</span>
                  <span className="text-[11px] underline text-red-700 ml-1 font-semibold">(Lihat Solusi)</span>
                </span>
              )}
            </div>
          </div>

          {/* PANEL SOLUSI & KETERANGAN BARIS BERMASALAH */}
          {validationResult.jumlahError > 0 && (
            <div className="p-5 rounded-2xl bg-linear-to-br from-amber-50/90 to-red-50/80 border-2 border-red-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs shrink-0">
                    <Lightbulb className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-red-950">
                      Solusi & Panduan Format Perbaikan Baris Bermasalah
                    </h4>
                    <p className="text-xs text-red-800 mt-0.5">
                      Ditemukan <strong>{validationResult.jumlahError} baris data</strong> yang tidak sesuai dengan format website. Anda dapat membaca panduan di bawah, memperbaiki langsung di halaman ini, atau menghapus baris yang bermasalah.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowErrorGuide(!showErrorGuide)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-red-800 text-xs font-semibold border border-red-200 transition-colors shrink-0"
                >
                  <span>{showErrorGuide ? 'Tutup Rincian' : 'Buka Rincian'}</span>
                  {showErrorGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showErrorGuide && (
                <div className="space-y-4 pt-1">
                  
                  {/* 4 Aturan Format Baku Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-white/90 border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">1</span>
                        <span>Format Tanggal</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Gunakan format <strong>YYYY-MM-DD</strong> (contoh: <code>2026-11-10</code>) atau <strong>DD/MM/YYYY</strong> (contoh: <code>10/11/2026</code>) atau format nama bulan Indonesia (<code>10 November 2026</code>).
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">2</span>
                        <span>Urutan Tanggal</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong>Tanggal Kembali</strong> tidak boleh lebih awal dari <strong>Tanggal Berangkat</strong>. Minimal harus sama (penugasan 1 hari) atau sesudahnya.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">3</span>
                        <span>Kolom Wajib Diisi</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Kolom <strong>Nama Pelaksana</strong> dan <strong>Tujuan Perjalanan</strong> wajib ada dan tidak boleh kosong di setiap baris.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">4</span>
                        <span>Pemetaan Kolom</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Pastikan pilihan dropdown pada <em>Langkah 2</em> di atas sudah memilih nama kolom yang sesuai di file Excel Anda (misal: "Nama Pegawai", "Tgl Berangkat").
                      </p>
                    </div>
                  </div>

                  {/* Daftar Spesifik Baris Bermasalah & Tombol Perbaikan Langsung */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>Rincian Baris yang Perlu Diperbaiki ({validationResult.jumlahError} Baris):</span>
                    </h5>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {validationResult.hasil
                        .filter((r) => !r.isValid)
                        .map((errRow) => (
                          <div
                            key={errRow.rowNumber}
                            className="p-3.5 rounded-xl bg-white border border-red-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold font-mono text-[11px]">
                                  Baris #{errRow.rowNumber} di Excel
                                </span>
                                <span className="font-bold text-slate-900 truncate">
                                  {errRow.data.namaPelaksana || '(Nama Kosong)'}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600 font-medium">
                                  Tujuan: {errRow.data.tujuan || '(Tujuan Kosong)'}
                                </span>
                              </div>

                              <div className="text-red-600 font-semibold flex items-center gap-1 text-[11px]">
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Penyebab: {errRow.errors.join(' • ')}</span>
                              </div>

                              {errRow.suggestions && errRow.suggestions.length > 0 && (
                                <div className="text-emerald-700 text-[11px] flex items-center gap-1 font-medium">
                                  <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Solusi: {errRow.suggestions.join(' ')}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleStartEditRow(errRow)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Perbaiki di Sini</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProblemRow(errRow.rowNumber)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-700 font-semibold text-xs transition-colors"
                                title="Hapus baris ini dari daftar impor"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-red-200/60 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>
                        Anda dapat melanjutkan impor dengan hanya menyimpan <strong>{validationResult.jumlahValid} baris yang valid</strong> tanpa harus mengimpor baris bermasalah.
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="text-blue-700 hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Contoh Format Excel yang Benar</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Filter Baris Tabel Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-fit">
              <button
                type="button"
                onClick={() => setPreviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  previewFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Baris ({validationResult.hasil.length})
              </button>
              <button
                type="button"
                onClick={() => setPreviewFilter('valid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  previewFilter === 'valid'
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hanya Valid ({validationResult.jumlahValid})
              </button>
              {validationResult.jumlahError > 0 && (
                <button
                  type="button"
                  onClick={() => setPreviewFilter('error')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    previewFilter === 'error'
                      ? 'bg-red-600 text-white shadow-2xs font-bold'
                      : 'text-red-700 hover:bg-red-50'
                  }`}
                >
                  Hanya Bermasalah ({validationResult.jumlahError})
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500">
              Menampilkan {
                validationResult.hasil.filter((r) =>
                  previewFilter === 'all' ? true : previewFilter === 'valid' ? r.isValid : !r.isValid
                ).length
              } baris data
            </span>
          </div>

          {/* Tabel Preview Interaktif */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">Baris</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Nama Pelaksana</th>
                  <th className="py-2.5 px-3">Tgl Berangkat</th>
                  <th className="py-2.5 px-3">Tgl Kembali</th>
                  <th className="py-2.5 px-3">Tujuan</th>
                  <th className="py-2.5 px-3">No. SPD</th>
                  <th className="py-2.5 px-3">Keterangan / Error</th>
                  <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validationResult.hasil
                  .filter((r) =>
                    previewFilter === 'all' ? true : previewFilter === 'valid' ? r.isValid : !r.isValid
                  )
                  .slice(0, 25)
                  .map((row) => (
                    <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                        {row.rowNumber}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md border border-red-300">
                            <AlertTriangle className="w-3.5 h-3.5" /> Error
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {row.data.namaPelaksana || <span className="text-red-500 italic">(Kosong)</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap font-mono text-[11px]">
                        {row.data.tanggalBerangkat || <span className="text-red-500 italic">(Kosong)</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap font-mono text-[11px]">
                        {row.data.tanggalKembali || <span className="text-red-500 italic">(Kosong)</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        {row.data.tujuan || <span className="text-red-500 italic">(Kosong)</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {row.data.nomorSpd || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-xs max-w-xs">
                        {row.isValid ? (
                          <span className="text-slate-400">Siap disimpan</span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-red-600 font-semibold block">{row.errors.join(', ')}</span>
                            {row.suggestions && (
                              <span className="text-emerald-700 text-[10px] block">{row.suggestions[0]}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditRow(row)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Perbaiki / Edit data baris ini"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProblemRow(row.rowNumber)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Hapus baris ini dari daftar impor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {validationResult.hasil.length > 25 && (
            <p className="text-xs text-slate-500 text-center italic">
              Menampilkan 25 baris pertama dari total {validationResult.hasil.length} baris data.
            </p>
          )}

          {/* Opsi Mode Import & Tombol Konfirmasi */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Opsi Append vs Replace (Sesuai Butir J Prompt) */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">
                Metode Penyimpanan Data:
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <strong>Tambahkan ke data lama (Append)</strong> — Data eksisting tetap aman.
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-red-700">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>
                    <strong>Ganti seluruh data (Replace All)</strong> — Data lama digantikan.
                  </span>
                </label>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={validationResult.jumlahValid === 0}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 shrink-0"
              >
                <Database className="w-4 h-4" />
                <span>Simpan {validationResult.jumlahValid} Baris Valid</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Riwayat Import Data Sebelumnya */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <History className="w-4 h-4 text-blue-600" />
          <span>Riwayat Impor Data Terakhir</span>
        </div>

        {importLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Belum ada catatan aktivitas impor file.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Waktu</th>
                  <th className="py-2 px-3">Nama Berkas</th>
                  <th className="py-2 px-3">Mode</th>
                  <th className="py-2 px-3 text-center">Jumlah Baris</th>
                  <th className="py-2 px-3 text-center">Berhasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {importLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-600">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {log.fileName}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        log.mode === 'append' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {log.mode === 'append' ? 'Tambah (Append)' : 'Ganti (Replace)'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">
                      {log.totalRows}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">
                      {log.validRows}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit / Perbaiki Baris Langsung */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Perbaiki Data Baris #{editingRow.rowNumber} di Excel
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sesuaikan nilai agar sesuai format standar aplikasi JALANIN
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error info banner */}
            {editingRow.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Masalah Terdeteksi:
                </span>
                <p>{editingRow.errors.join(' • ')}</p>
                {editingRow.suggestions && editingRow.suggestions.length > 0 && (
                  <p className="text-emerald-700 font-medium pt-1">
                    Saran: {editingRow.suggestions.join(' ')}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSaveRowEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Pelaksana <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editRowData.namaPelaksana}
                  onChange={(e) => setEditRowData({ ...editRowData, namaPelaksana: e.target.value })}
                  placeholder="Nama Pegawai"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tgl Berangkat (YYYY-MM-DD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editRowData.tanggalBerangkat}
                    onChange={(e) => setEditRowData({ ...editRowData, tanggalBerangkat: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tgl Kembali (YYYY-MM-DD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editRowData.tanggalKembali}
                    onChange={(e) => setEditRowData({ ...editRowData, tanggalKembali: e.target.value })}
                    min={editRowData.tanggalBerangkat}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tujuan Perjalanan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editRowData.tujuan}
                  onChange={(e) => setEditRowData({ ...editRowData, tujuan: e.target.value })}
                  placeholder="Contoh: Kecamatan Unaaha, Kendari, Jakarta"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Nomor SPD (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editRowData.nomorSpd}
                    onChange={(e) => setEditRowData({ ...editRowData, nomorSpd: e.target.value })}
                    placeholder="090/SPD/..."
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Maksud Tugas (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editRowData.maksudPerjalanan}
                    onChange={(e) => setEditRowData({ ...editRowData, maksudPerjalanan: e.target.value })}
                    placeholder="Uraian kegiatan..."
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Validasi Ulang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Import */}
      {showConfirmModal && validationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Konfirmasi Impor Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Anda akan mengimpor <strong>{validationResult.jumlahValid}</strong> data perjalanan dinas ke sistem.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">File Sumber:</span>
                <span className="font-semibold">{fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="font-bold text-blue-700">
                  {importMode === 'append' ? 'Menambahkan ke data lama' : 'Mengganti seluruh data lama'}
                </span>
              </div>
              {importMode === 'replace' && (
                <div className="text-red-600 font-semibold pt-1">
                  Peringatan: {currentTotalTrips} data yang ada saat ini akan dihapus dan digantikan dengan data baru.
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
              >
                Ya, Impor Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
