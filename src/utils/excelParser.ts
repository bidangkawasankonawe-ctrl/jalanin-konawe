import * as XLSX from 'xlsx';
import { PerjalananDinas } from '../types/index';
import { validasiRentangTanggal } from './dateUtils';

export interface ColumnMapping {
  namaPelaksana: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  tujuan: string;
  nomorSpd?: string;
  maksudPerjalanan?: string;
  nip?: string;
  jabatan?: string;
}

export interface ParsedRowResult {
  rowNumber: number;
  data: Partial<PerjalananDinas>;
  isValid: boolean;
  errors: string[];
  rawRow?: Record<string, any>;
  suggestions?: string[];
}

/**
 * Normalisasi tanggal dari Excel (bisa berupa angka serial Excel atau string DD/MM/YYYY atau YYYY-MM-DD)
 */
export function normalisasiTanggalExcel(rawVal: any): string {
  if (!rawVal) return '';

  // Jika number (Excel serial date number)
  if (typeof rawVal === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(rawVal);
    if (dateObj) {
      const y = dateObj.y.toString().padStart(4, '0');
      const m = dateObj.m.toString().padStart(2, '0');
      const d = dateObj.d.toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // Jika Date object
  if (rawVal instanceof Date) {
    if (!isNaN(rawVal.getTime())) {
      const y = rawVal.getFullYear().toString().padStart(4, '0');
      const m = (rawVal.getMonth() + 1).toString().padStart(2, '0');
      const d = rawVal.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  const str = String(rawVal).trim();
  
  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Format YYYY/MM/DD atau YYYY.MM.DD
  const ymdSlash = str.match(/^(\d{4})[\/\.](\d{1,2})[\/\.](\d{1,2})$/);
  if (ymdSlash) {
    const year = ymdSlash[1];
    const month = ymdSlash[2].padStart(2, '0');
    const day = ymdSlash[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format DD/MM/YYYY atau DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Format teks tanggal Indonesia: e.g. "12 November 2026" atau "12 Nov 2026" atau "12-Nov-2026"
  const bulanMap: Record<string, string> = {
    jan: '01', januari: '01',
    feb: '02', februari: '02',
    mar: '03', maret: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06',
    jul: '07', juli: '07',
    agu: '08', ags: '08', agustus: '08', aug: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', oct: '10',
    nov: '11', november: '11',
    des: '12', desember: '12', dec: '12',
  };

  const textIndoMatch = str.match(/^(\d{1,2})[\s\-\/\.]([a-zA-Z]+)[\s\-\/\.](\d{4})$/);
  if (textIndoMatch) {
    const day = textIndoMatch[1].padStart(2, '0');
    const monthKey = textIndoMatch[2].toLowerCase();
    const year = textIndoMatch[3];
    if (bulanMap[monthKey]) {
      return `${year}-${bulanMap[monthKey]}-${day}`;
    }
  }

  // Format MM/DD/YYYY jika ada
  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1990) {
    const y = parsedDate.getFullYear().toString().padStart(4, '0');
    const m = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const d = parsedDate.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str;
}

/**
 * Otomatis mendeteksi pemetaan kolom berdasarkan nama header di file Excel/CSV
 */
export function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    namaPelaksana: '',
    tanggalBerangkat: '',
    tanggalKembali: '',
    tujuan: '',
    nomorSpd: '',
    maksudPerjalanan: '',
    nip: '',
    jabatan: '',
  };

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  headers.forEach((h) => {
    const key = norm(h);

    // Nama Pelaksana
    if (!mapping.namaPelaksana && (key.includes('namapelaksana') || key.includes('namapegawai') || key === 'nama' || key.includes('pelaksana') || key.includes('personel') || key.includes('petugas'))) {
      mapping.namaPelaksana = h;
    }
    // Tanggal Berangkat
    else if (!mapping.tanggalBerangkat && (key.includes('berangkat') || key.includes('tglmulai') || key === 'mulai' || key.includes('startdate'))) {
      mapping.tanggalBerangkat = h;
    }
    // Tanggal Kembali
    else if (!mapping.tanggalKembali && (key.includes('kembali') || key.includes('tglselesai') || key === 'selesai' || key.includes('sampai') || key.includes('enddate'))) {
      mapping.tanggalKembali = h;
    }
    // Tujuan
    else if (!mapping.tujuan && (key.includes('tujuan') || key.includes('lokasi') || key.includes('tempat') || key.includes('destination'))) {
      mapping.tujuan = h;
    }
    // Nomor SPD
    else if (!mapping.nomorSpd && (key.includes('spd') || key.includes('surattugas') || key.includes('nost') || key.includes('nomorst'))) {
      mapping.nomorSpd = h;
    }
    // Maksud Perjalanan
    else if (!mapping.maksudPerjalanan && (key.includes('maksud') || key.includes('keperluan') || key.includes('kegiatan') || key.includes('uraian'))) {
      mapping.maksudPerjalanan = h;
    }
    // NIP
    else if (!mapping.nip && (key === 'nip' || key.includes('nomorinduk'))) {
      mapping.nip = h;
    }
    // Jabatan
    else if (!mapping.jabatan && (key.includes('jabatan') || key.includes('golongan') || key.includes('pangkat'))) {
      mapping.jabatan = h;
    }
  });

  return mapping;
}

/**
 * Parse file buffer/ArrayBuffer dan kembalikan header serta baris-baris data
 */
export function bacaFileExcelAtauCsv(buffer: ArrayBuffer): {
  sheetNames: string[];
  headers: string[];
  rawRows: Record<string, any>[];
} {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  // Ambil headers dari baris pertama atau range
  let headers: string[] = [];
  if (rawRows.length > 0) {
    headers = Object.keys(rawRows[0]);
  }

  return {
    sheetNames: workbook.SheetNames,
    headers,
    rawRows,
  };
}

/**
 * Validasi dan konversi rawRows ke daftar PerjalananDinas menggunakan ColumnMapping
 */
export function petakanDanValidasiData(
  rawRows: Record<string, any>[],
  mapping: ColumnMapping
): {
  hasil: ParsedRowResult[];
  jumlahValid: number;
  jumlahError: number;
} {
  const hasil: ParsedRowResult[] = [];
  let jumlahValid = 0;
  let jumlahError = 0;

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // Baris 1 biasanya header di Excel
    const errors: string[] = [];
    const suggestions: string[] = [];

    const nama = String(row[mapping.namaPelaksana] || '').trim();
    const rawBerangkat = row[mapping.tanggalBerangkat];
    const rawKembali = row[mapping.tanggalKembali];
    const tujuan = String(row[mapping.tujuan] || '').trim();
    const nomorSpd = mapping.nomorSpd ? String(row[mapping.nomorSpd] || '').trim() : '';
    const maksudPerjalanan = mapping.maksudPerjalanan ? String(row[mapping.maksudPerjalanan] || '').trim() : '';
    const nip = mapping.nip ? String(row[mapping.nip] || '').trim() : '';
    const jabatan = mapping.jabatan ? String(row[mapping.jabatan] || '').trim() : '';

    // Abaikan baris kosong tanpa data sama sekali (sering terjadi di akhir file Excel)
    const valuesInRow = Object.values(row).map((v) => String(v || '').trim()).filter(Boolean);
    if (valuesInRow.length === 0) {
      return;
    }

    if (!nama) {
      errors.push('Nama Pelaksana kosong.');
      suggestions.push('Isi nama pegawai yang ditugaskan pada kolom Nama Pelaksana.');
    }
    if (!tujuan) {
      errors.push('Tujuan perjalanan kosong.');
      suggestions.push('Isi tujuan (misal: Kecamatan Unaaha, Kendari, Jakarta).');
    }

    const tglBerangkat = normalisasiTanggalExcel(rawBerangkat);
    const tglKembali = normalisasiTanggalExcel(rawKembali);

    if (!tglBerangkat) {
      errors.push(`Tanggal Berangkat kosong atau tidak terbaca (Nilai mentah: "${rawBerangkat ?? ''}").`);
      suggestions.push('Gunakan format tanggal YYYY-MM-DD (contoh: 2026-11-10) atau DD/MM/YYYY (contoh: 10/11/2026).');
    }
    if (!tglKembali) {
      errors.push(`Tanggal Kembali kosong atau tidak terbaca (Nilai mentah: "${rawKembali ?? ''}").`);
      suggestions.push('Gunakan format tanggal YYYY-MM-DD (contoh: 2026-11-12) atau DD/MM/YYYY (contoh: 12/11/2026).');
    }

    if (tglBerangkat && tglKembali) {
      const validasiTgl = validasiRentangTanggal(tglBerangkat, tglKembali);
      if (!validasiTgl.valid) {
        errors.push(validasiTgl.pesan || 'Rentang tanggal tidak valid.');
        if (tglKembali < tglBerangkat) {
          suggestions.push(`Ubah tanggal kembali agar sama dengan atau setelah tanggal berangkat (${tglBerangkat}).`);
        } else {
          suggestions.push('Pastikan format tanggal sesuai standar YYYY-MM-DD.');
        }
      }
    }

    const isValid = errors.length === 0;
    if (isValid) jumlahValid++;
    else jumlahError++;

    hasil.push({
      rowNumber,
      isValid,
      errors,
      suggestions,
      rawRow: row,
      data: {
        id: `import-${Date.now()}-${index}`,
        namaPelaksana: nama,
        tanggalBerangkat: tglBerangkat,
        tanggalKembali: tglKembali,
        tujuan,
        nomorSpd: nomorSpd || undefined,
        maksudPerjalanan: maksudPerjalanan || undefined,
        nip: nip || undefined,
        jabatan: jabatan || undefined,
      },
    });
  });

  return { hasil, jumlahValid, jumlahError };
}

/**
 * Buat file template Excel untuk diunduh pengguna
 */
export function buatTemplateExcel(): Uint8Array {
  const dataContoh = [
    {
      'Nama Pelaksana': 'Drs. H. Ferdinand, M.Si',
      'NIP': '197001011995031001',
      'Jabatan': 'Kepala Dinas',
      'Tanggal Berangkat': '2026-11-10',
      'Tanggal Kembali': '2026-11-12',
      'Tujuan': 'Kecamatan Unaaha',
      'Maksud Perjalanan': 'Monitoring Evaluasi Program Infrastruktur Pedesaan',
      'Nomor SPD': '090/SPD/KNW/XI/2026',
    },
    {
      'Nama Pelaksana': 'Siti Rahmawati, S.T., M.Eng',
      'NIP': '198405122008012005',
      'Jabatan': 'Analis Tata Ruang',
      'Tanggal Berangkat': '2026-11-14',
      'Tanggal Kembali': '2026-11-16',
      'Tujuan': 'Kecamatan Wawotobi',
      'Maksud Perjalanan': 'Survei Lapangan Penataan Kawasan Permukiman',
      'Nomor SPD': '090/SPD/KNW/XI/2027',
    },
    {
      'Nama Pelaksana': 'Ahmad Fauzi, S.Kom',
      'NIP': '199203152019031008',
      'Jabatan': 'Pranata Komputer',
      'Tanggal Berangkat': '2026-11-18',
      'Tanggal Kembali': '2026-11-20',
      'Tujuan': 'Kendari',
      'Maksud Perjalanan': 'Rakor Integrasi SPBE Tingkat Provinsi Sultra',
      'Nomor SPD': '090/SPD/KNW/XI/2028',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(dataContoh);
  // Lebar kolom otomatis rapi
  worksheet['!cols'] = [
    { wch: 28 }, // Nama Pelaksana
    { wch: 22 }, // NIP
    { wch: 22 }, // Jabatan
    { wch: 18 }, // Tanggal Berangkat
    { wch: 18 }, // Tanggal Kembali
    { wch: 24 }, // Tujuan
    { wch: 45 }, // Maksud Perjalanan
    { wch: 25 }, // Nomor SPD
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Perjalanan Dinas');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

/**
 * Export data perjalanan dinas ke file Excel
 */
export function exportDataKeExcel(trips: PerjalananDinas[], namaFile: string = 'Rekapitulasi_Perjalanan_Dinas_Konawe.xlsx'): void {
  const rows = trips.map((t, idx) => ({
    'No': idx + 1,
    'Nama Pelaksana': t.namaPelaksana,
    'NIP': t.nip || '-',
    'Jabatan': t.jabatan || '-',
    'Tanggal Berangkat': t.tanggalBerangkat,
    'Tanggal Kembali': t.tanggalKembali,
    'Tujuan': t.tujuan,
    'Maksud Perjalanan': t.maksudPerjalanan || '-',
    'Nomor SPD': t.nomorSpd || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
    { wch: 40 },
    { wch: 24 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi SPD');

  XLSX.writeFile(workbook, namaFile);
}
