import * as XLSX from 'xlsx';
import { autoMapColumns, petakanDanValidasiData, ColumnMapping, ParsedRowResult } from '../utils/excelParser';

export function ekstrakSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Jika pengguna memasukkan URL lengkap
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export async function ambilDataDariGoogleSheet(params: {
  sheetIdOrUrl: string;
  sheetName?: string;
  apiKey?: string;
  accessToken?: string;
}): Promise<{
  headers: string[];
  rawRows: Record<string, any>[];
  suggestedMapping: ColumnMapping;
}> {
  const sheetId = ekstrakSpreadsheetId(params.sheetIdOrUrl);
  if (!sheetId) {
    throw new Error('Spreadsheet ID atau URL tidak boleh kosong.');
  }

  const sheetName = params.sheetName || 'Sheet1';

  // 1. Jika ada Google API Key atau Access Token, gunakan Google Sheets API v4
  if (params.apiKey || params.accessToken) {
    const range = encodeURIComponent(sheetName);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${params.apiKey || ''}`;
    const headers: Record<string, string> = {};
    if (params.accessToken) {
      headers['Authorization'] = `Bearer ${params.accessToken}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(
        errJson.error?.message || `Gagal mengambil data dari Google Sheets API (Status ${res.status}). Pastikan izin dan nama sheet sudah benar.`
      );
    }

    const data = await res.json();
    const values: any[][] = data.values || [];
    if (values.length < 2) {
      throw new Error('Spreadsheet tidak memiliki cukup baris (minimal butuh baris judul header dan 1 baris data).');
    }

    const headerRow: string[] = values[0].map((h: any) => String(h || '').trim());
    const rawRows: Record<string, any>[] = [];

    for (let r = 1; r < values.length; r++) {
      const rowArr = values[r];
      const rowObj: Record<string, any> = {};
      headerRow.forEach((colName, cIdx) => {
        rowObj[colName] = rowArr[cIdx] !== undefined ? rowArr[cIdx] : '';
      });
      rawRows.push(rowObj);
    }

    return {
      headers: headerRow,
      rawRows,
      suggestedMapping: autoMapColumns(headerRow),
    };
  }

  // 2. Jika tanpa API Key, coba endpoint export format CSV (berfungsi jika spreadsheet disetel siapa saja yang memiliki link dapat melihat)
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(exportUrl);
  if (!res.ok) {
    throw new Error(
      `Tidak dapat mengakses Google Spreadsheet. Pastikan Spreadsheet ID benar atau masukkan Google API Key / Izin Akses.`
    );
  }

  const csvText = await res.text();
  const workbook = XLSX.read(csvText, { type: 'string' });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  let headerRow: string[] = [];
  if (rawRows.length > 0) {
    headerRow = Object.keys(rawRows[0]);
  }

  return {
    headers: headerRow,
    rawRows,
    suggestedMapping: autoMapColumns(headerRow),
  };
}
