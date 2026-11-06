import React from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  PlusCircle, 
  Menu, 
  X, 
  CalendarDays,
  Sparkles,
  LogOut,
  User
} from 'lucide-react';
import { formatTanggalIndo } from '../utils/dateUtils';
import { JalaninLogo } from './JalaninLogo';
import { AuthUser } from '../types/auth';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  lastSync: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  conflictCount: number;
  onNavigateToConflict: () => void;
  onOpenAddModal: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  lastSync,
  onRefresh,
  isRefreshing,
  conflictCount,
  onNavigateToConflict,
  onOpenAddModal,
  currentUser,
  onLogout,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = formatTanggalIndo(todayStr, { lengkap: true });

  const formatWaktuSync = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '-';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Sisi Kiri: Tombol Hamburger Mobile & Identitas Branding JALANIN */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              aria-label={sidebarOpen ? "Tutup Menu Navigasi" : "Buka Menu Navigasi"}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <JalaninLogo size="md" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-none">
                    JALANIN
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-200/80">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Satu Kalender, Semua Perjalanan Terpantau.
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[220px] sm:max-w-xs mt-0.5">
                  Jadwal Layanan Perjalanan Dinas
                </p>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Tanggal Hari Ini, Indikator Sinkronisasi, Peringatan Bentrok & Tombol Tambah */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Tanggal Hari Ini (Desktop) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>{formattedToday}</span>
            </div>

            {/* Tombol Refresh / Sinkronisasi */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs transition-colors disabled:opacity-60"
              title={`Sinkronisasi data terakhir: ${formatWaktuSync(lastSync)}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Menyinkronkan...' : `Sinkron (${formatWaktuSync(lastSync)})`}
              </span>
            </button>

            {/* Tombol Deteksi Bentrok (Muncul Berkedip jika ada bentrok) */}
            {conflictCount > 0 ? (
              <button
                type="button"
                onClick={onNavigateToConflict}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 text-xs font-semibold shadow-2xs transition-all animate-pulse"
                title={`${conflictCount} jadwal perjalanan terdeteksi bentrok/tumpang tindih!`}
              >
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline">Bentrok Terdeteksi</span>
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white">
                  {conflictCount}
                </span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Jadwal Tertib</span>
              </div>
            )}

            {/* Tombol Tambah Data Perjalanan */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Data</span>
            </button>

            {/* Profil Pengguna Aktif & Tombol Keluar (Logout) */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden xl:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                    {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'operator' ? 'Operator SPD' : 'Pegawai ASN'}
                  </span>
                </div>

                <div
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0"
                  title={`${currentUser.name} (${currentUser.nip})`}
                >
                  {currentUser.name.charAt(0)}
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Keluar dari Akun (Logout)"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
