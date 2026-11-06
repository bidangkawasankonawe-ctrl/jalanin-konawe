import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PerjalananDinas } from '../types/index';
import { formatTanggalIndo, hitungDurasiHari } from './dateUtils';

export interface CetakPdfOptions {
  judul?: string;
  periode?: string;
  filterPegawai?: string;
  pejabatPenandatangan?: {
    jabatan?: string;
    nama?: string;
    nip?: string;
    kota?: string;
  };
}

export function cetakLaporanPdf(
  trips: PerjalananDinas[],
  options: CetakPdfOptions = {}
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 14;

  // Kop Surat Pemerintah Kabupaten Konawe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 45, 90);
  doc.text('PEMERINTAH KABUPATEN KONAWE', pageWidth / 2, currentY, { align: 'center' });

  currentY += 6;
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('BADAN / DINAS LINGKUP PEMERINTAH KABUPATEN KONAWE', pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Kompleks Perkantoran Pemkab Konawe, Jl. Inolobunggadue No. 1, Unaaha, Sulawesi Tenggara', pageWidth / 2, currentY, { align: 'center' });

  // Garis Pembatas Kop Surat
  currentY += 4;
  doc.setDrawColor(20, 45, 90);
  doc.setLineWidth(0.8);
  doc.line(14, currentY, pageWidth - 14, currentY);
  doc.setLineWidth(0.2);
  doc.line(14, currentY + 0.8, pageWidth - 14, currentY + 0.8);

  currentY += 8;

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(options.judul || 'REKAPITULASI PELAKSANAAN PERJALANAN DINAS PEGAWAI', pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const infoPeriode = options.periode ? `Periode: ${options.periode}` : `Dicetak per tanggal: ${formatTanggalIndo(new Date().toISOString().split('T')[0], { lengkap: true })}`;
  doc.text(infoPeriode, pageWidth / 2, currentY, { align: 'center' });

  if (options.filterPegawai) {
    currentY += 4.5;
    doc.text(`Pegawai: ${options.filterPegawai}`, pageWidth / 2, currentY, { align: 'center' });
  }

  currentY += 6;

  // Siapkan Data Tabel
  const tableData = trips.map((t, index) => {
    const durasi = hitungDurasiHari(t.tanggalBerangkat, t.tanggalKembali);
    return [
      String(index + 1),
      `${t.namaPelaksana}${t.nip ? '\nNIP: ' + t.nip : ''}`,
      t.jabatan || '-',
      formatTanggalIndo(t.tanggalBerangkat),
      formatTanggalIndo(t.tanggalKembali),
      `${durasi} Hari`,
      t.tujuan,
      t.maksudPerjalanan || '-',
      t.nomorSpd || '-',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      'No',
      'Nama Pelaksana & NIP',
      'Jabatan',
      'Tgl Berangkat',
      'Tgl Kembali',
      'Durasi',
      'Tujuan',
      'Maksud Perjalanan',
      'No. SPD / ST',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 64, 175], // Royal Navy Blue (#1e40af)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 44 },
      2: { cellWidth: 32 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 22 },
      5: { halign: 'center', cellWidth: 16 },
      6: { cellWidth: 34 },
      7: { cellWidth: 50 },
      8: { cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Tanda Tangan Pengesahan di Bawah
  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
  const signatureY = finalY + 12 > doc.internal.pageSize.getHeight() - 35
    ? (doc.addPage(), 20)
    : finalY + 10;

  const ttdKota = options.pejabatPenandatangan?.kota || 'Unaaha';
  const ttdTanggal = formatTanggalIndo(new Date().toISOString().split('T')[0], { lengkap: true });
  const ttdJabatan = options.pejabatPenandatangan?.jabatan || 'Pejabat Pembuat Komitmen / PPTK';
  const ttdNama = options.pejabatPenandatangan?.nama || 'Drs. H. Ferdinand, M.Si';
  const ttdNip = options.pejabatPenandatangan?.nip || '19700101 199503 1 001';

  const ttdX = pageWidth - 75;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text(`${ttdKota}, ${ttdTanggal}`, ttdX, signatureY);
  doc.text(ttdJabatan, ttdX, signatureY + 5);

  doc.text('( .................................................... )', ttdX, signatureY + 26);
  doc.setFont('helvetica', 'bold');
  doc.text(ttdNama, ttdX, signatureY + 31);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${ttdNip}`, ttdX, signatureY + 35);

  // Footer Sistem JALANIN
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('JALANIN - Jadwal Layanan Perjalanan Dinas | "Satu Kalender, Semua Perjalanan Terpantau."', 14, pageHeight - 8);

  // Simpan / Unduh File
  const tglFile = new Date().toISOString().split('T')[0];
  doc.save(`Laporan_SPD_JALANIN_${tglFile}.pdf`);
}
