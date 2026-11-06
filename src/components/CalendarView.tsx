import React, { useState, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Calendar as CalendarIcon,
  Filter,
  Search,
  User,
  Briefcase,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { PerjalananDinas } from '../types/index';
import { getWarnaPegawai } from '../utils/colors';
import { formatTanggalIndo, hitungDurasiHari } from '../utils/dateUtils';

interface CalendarViewProps {
  trips: PerjalananDinas[];
  onSelectTripDetail: (trip: PerjalananDinas) => void;
  initialSelectedEmployee?: string;
}

/**
 * Menambahkan 1 hari ke string YYYY-MM-DD agar FullCalendar merender hari terakhir (karena allDay end bersifat eksklusif)
 */
function tambahSatuHari(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return dateStr;
  }
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  trips,
  onSelectTripDetail,
  initialSelectedEmployee = 'all',
}) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(initialSelectedEmployee);
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState<string>('');
  const [currentViewTitle, setCurrentViewTitle] = useState<string>('');

  // Daftar seluruh pegawai unik dari trips
  const daftarPegawaiUnik = useMemo(() => {
    const map = new Map<string, { nama: string; totalTrips: number }>();
    trips.forEach((t) => {
      const nama = t.namaPelaksana?.trim();
      if (!nama) return;
      if (!map.has(nama)) {
        map.set(nama, { nama, totalTrips: 0 });
      }
      map.get(nama)!.totalTrips += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [trips]);

  // Filter pegawai berdasarkan dropdown / search
  const filteredPegawaiList = useMemo(() => {
    if (!searchEmployeeQuery.trim()) return daftarPegawaiUnik;
    const q = searchEmployeeQuery.toLowerCase();
    return daftarPegawaiUnik.filter((p) => p.nama.toLowerCase().includes(q));
  }, [daftarPegawaiUnik, searchEmployeeQuery]);

  // Trips yang ditampilkan pada kalender
  const tripsToDisplay = useMemo(() => {
    if (selectedEmployee === 'all') {
      return trips;
    }
    return trips.filter((t) => t.namaPelaksana?.trim().toLowerCase() === selectedEmployee.toLowerCase());
  }, [trips, selectedEmployee]);

  // Statistik pegawai jika sedang memfilter individual
  const infoPegawaiTerpilih = useMemo(() => {
    if (selectedEmployee === 'all') return null;
    const empTrips = trips.filter((t) => t.namaPelaksana?.trim().toLowerCase() === selectedEmployee.toLowerCase());
    let totalHari = 0;
    empTrips.forEach((t) => {
      totalHari += hitungDurasiHari(t.tanggalBerangkat, t.tanggalKembali);
    });
    const sample = empTrips[0];
    return {
      nama: sample?.namaPelaksana || selectedEmployee,
      nip: sample?.nip,
      jabatan: sample?.jabatan,
      totalTrips: empTrips.length,
      totalHari,
    };
  }, [trips, selectedEmployee]);

  // Events untuk FullCalendar
  const calendarEvents = useMemo(() => {
    return tripsToDisplay.map((trip) => {
      const warna = getWarnaPegawai(trip.namaPelaksana);
      return {
        id: trip.id,
        title: `${trip.namaPelaksana} - ${trip.tujuan}`,
        start: trip.tanggalBerangkat,
        end: tambahSatuHari(trip.tanggalKembali), // inclusive render
        allDay: true,
        backgroundColor: warna.bg,
        borderColor: warna.border,
        textColor: warna.text,
        extendedProps: {
          tripData: trip,
        },
      };
    });
  }, [tripsToDisplay]);

  // Helper menentukan ukuran font proporsional berdasarkan panjang nama pelaksana
  const getProportionalNameStyle = (nama: string) => {
    const len = (nama || '').trim().length;
    if (len > 32) {
      return 'text-[9.5px] leading-[1.2] tracking-tight font-bold';
    } else if (len > 20) {
      return 'text-[10.5px] leading-tight tracking-tight font-bold';
    } else {
      return 'text-[11.5px] leading-snug tracking-normal font-bold';
    }
  };

  // Custom Event Content Renderer yang menampilkan seluruh nama pelaksana secara lengkap & proporsional
  const renderEventContent = (eventInfo: any) => {
    const trip: PerjalananDinas = eventInfo.event.extendedProps.tripData;
    if (!trip) return null;

    const nama = trip.namaPelaksana || 'Tanpa Nama';
    const nameStyleClass = getProportionalNameStyle(nama);

    // Tampilan khusus untuk list view
    if (eventInfo.view.type.startsWith('list')) {
      return (
        <div className="py-1 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
          <div className="font-bold text-xs sm:text-sm text-slate-900">
            {nama}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-medium text-blue-700">
              <MapPin className="w-3 h-3 inline shrink-0" />
              {trip.tujuan}
            </span>
            <span className="text-[11px] text-slate-400">
              ({formatTanggalIndo(trip.tanggalBerangkat)} - {formatTanggalIndo(trip.tanggalKembali)})
            </span>
          </div>
        </div>
      );
    }

    // Tampilan untuk Month, Week, dan Day grid: Nama tampil LENGKAP dengan text-wrapping dan font proporsional
    return (
      <div
        className="w-full px-2 py-1.5 cursor-pointer select-none transition-colors duration-150 rounded-[5px]"
        title={`${nama} | Tujuan: ${trip.tujuan} | Periode: ${formatTanggalIndo(trip.tanggalBerangkat)} s/d ${formatTanggalIndo(trip.tanggalKembali)} (${hitungDurasiHari(trip.tanggalBerangkat, trip.tanggalKembali)} Hari)`}
      >
        {/* Nama Pelaksana ditampilkan utuh tanpa terpotong (whitespace-normal break-words) */}
        <div className={`${nameStyleClass} text-slate-900 break-words drop-shadow-[0_0.5px_0_rgba(255,255,255,0.8)]`}>
          {nama}
        </div>

        {/* Lokasi Tujuan Perjalanan */}
        <div className="text-[9.5px] text-slate-700 font-medium opacity-95 flex items-start gap-1 mt-0.5 break-words leading-tight">
          <MapPin className="w-2.5 h-2.5 mt-0.5 inline shrink-0 text-blue-600" />
          <span className="break-words line-clamp-2">{trip.tujuan}</span>
        </div>
      </div>
    );
  };

  const handleEventClick = (clickInfo: any) => {
    const trip: PerjalananDinas = clickInfo.event.extendedProps.tripData;
    if (trip) {
      onSelectTripDetail(trip);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Header Filter Kalender */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Kalender Interaktif</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Agenda & Jadwal Perjalanan Dinas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Visualisasi jadwal perjalanan dinas bulanan, mingguan, harian, dan agenda per pegawai.
            </p>
          </div>

          {/* Filter Pegawai */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            
            {/* Pencarian cepat nama */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchEmployeeQuery}
                onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                placeholder="Cari nama pegawai..."
                className="pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48 bg-slate-50"
              />
            </div>

            {/* Dropdown Filter Pegawai */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="py-2 pl-3 pr-8 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800 font-medium"
              >
                <option value="all">Semua Pegawai ({trips.length} Agenda)</option>
                {filteredPegawaiList.map((p) => (
                  <option key={p.nama} value={p.nama}>
                    {p.nama} ({p.totalTrips}x tugas)
                  </option>
                ))}
              </select>

              {selectedEmployee !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedEmployee('all')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Banner Profil Individual (Jika memfilter pegawai tertentu) */}
        {infoPegawaiTerpilih && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">
                    {infoPegawaiTerpilih.nama}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                    Kalender Individual
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {infoPegawaiTerpilih.nip ? `NIP: ${infoPegawaiTerpilih.nip} • ` : ''}
                  {infoPegawaiTerpilih.jabatan || 'Aparatur Sipil Negara'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Tugas</span>
                <span className="font-bold text-sm text-blue-700">{infoPegawaiTerpilih.totalTrips} Kali</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Durasi</span>
                <span className="font-bold text-sm text-blue-700">{infoPegawaiTerpilih.totalHari} Hari</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Kontainer FullCalendar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs relative">
        <style>{`
          .fc {
            --fc-button-bg-color: #2563eb;
            --fc-button-border-color: #1d4ed8;
            --fc-button-hover-bg-color: #1d4ed8;
            --fc-button-active-bg-color: #1e40af;
            --fc-today-bg-color: #eff6ff;
            font-family: inherit;
          }
          .fc .fc-toolbar-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: #0f172a;
          }
          .fc .fc-button {
            border-radius: 0.5rem;
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: capitalize;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: #f1f5f9;
          }
          .fc .fc-col-header-cell-cushion {
            padding: 8px 4px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
          }
          .fc-daygrid-day-number {
            font-size: 0.8rem;
            font-weight: 600;
            color: #334155;
            padding: 4px 6px;
          }
          .fc-day-today {
            background-color: #f0f7ff !important;
          }
          .fc-event {
            border-radius: 6px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            margin: 2px 2px !important;
            padding: 0 !important;
            transition: all 0.15s ease;
            white-space: normal !important;
            border-width: 1.5px !important;
          }
          .fc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.1);
            filter: brightness(0.97);
            z-index: 10 !important;
          }
          .fc-daygrid-event {
            white-space: normal !important;
            align-items: stretch !important;
          }
          .fc-daygrid-event-harness {
            margin-bottom: 2.5px !important;
          }
          .fc-event-main {
            white-space: normal !important;
            overflow: visible !important;
            width: 100% !important;
            padding: 0 !important;
          }
          .fc-popover {
            border-radius: 12px !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15) !important;
            z-index: 9999 !important;
          }
          .fc-popover-header {
            background-color: #f8fafc !important;
            padding: 8px 12px !important;
            font-weight: 700 !important;
            font-size: 0.85rem !important;
          }
          .fc-popover-body {
            padding: 8px !important;
            max-height: 380px !important;
            overflow-y: auto !important;
          }
          .fc-list-event-title a {
            font-weight: 600;
          }
        `}</style>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
          }}
          buttonText={{
            today: 'Hari Ini',
            month: 'Bulanan',
            week: 'Mingguan',
            day: 'Harian',
            list: 'Daftar Agenda',
          }}
          locale="id"
          firstDay={1} // Mulai dari hari Senin
          events={calendarEvents}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
          moreLinkText={(num) => `+${num} lainnya`}
        />

        {/* Petunjuk Interaksi */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            <span>Klik agenda pada tanggal mana pun untuk membuka rincian lengkap Surat Perintah Tugas (SPD).</span>
          </div>
          <div className="font-medium text-slate-700">
            Total Ditampilkan: {tripsToDisplay.length} Perjalanan
          </div>
        </div>

      </div>

    </div>
  );
};
