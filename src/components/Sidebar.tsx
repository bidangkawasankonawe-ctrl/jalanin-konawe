import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileSpreadsheet,
  TableProperties,
  UploadCloud,
  AlertTriangle,
  Settings,
  ChevronRight,
  Sparkles,
  Plane,
  LogOut,
  User
} from 'lucide-react';
import { JalaninLogo } from './JalaninLogo';
import { AuthUser } from '../types/auth';

export type ActiveTab =
  | 'dashboard'
  | 'calendar'
  | 'monitoring'
  | 'rekapitulasi'
  | 'data-perjalanan'
  | 'import-data'
  | 'deteksi-bentrok'
  | 'pengaturan';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  conflictCount: number;
  totalTrips: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  conflictCount,
  totalTrips,
  currentUser,
  onLogout,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Ringkasan & statistik',
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Kalender Perjalanan',
      icon: Calendar,
      desc: 'Jadwal bulanan & harian',
    },
    {
      id: 'monitoring' as ActiveTab,
      label: 'Monitoring Pegawai',
      icon: Users,
      desc: 'Daftar & riwayat tugas',
    },
    {
      id: 'rekapitulasi' as ActiveTab,
      label: 'Rekapitulasi',
      icon: FileSpreadsheet,
      desc: 'Laporan, Excel & PDF',
    },
    {
      id: 'data-perjalanan' as ActiveTab,
      label: 'Data Perjalanan Dinas',
      icon: TableProperties,
      desc: 'Manajemen basis data',
      badge: totalTrips > 0 ? totalTrips : undefined,
    },
    {
      id: 'import-data' as ActiveTab,
      label: 'Import Data',
      icon: UploadCloud,
      desc: 'Excel, CSV & Spreadsheet',
    },
    {
      id: 'deteksi-bentrok' as ActiveTab,
      label: 'Deteksi Bentrok',
      icon: AlertTriangle,
      desc: 'Tumpang tindih jadwal',
      alertBadge: conflictCount > 0 ? conflictCount : undefined,
    },
    {
      id: 'pengaturan' as ActiveTab,
      label: 'Pengaturan & Backup',
      icon: Settings,
      desc: 'Kop surat & basis data',
    },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200/90 flex items-center justify-between bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex items-center gap-3">
            <JalaninLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-slate-950 tracking-tight leading-tight">
                  JALANIN
                </h2>
                <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-extrabold uppercase bg-blue-600 text-white tracking-wider">
                  SPD
                </span>
              </div>
              <p className="text-[11px] text-blue-700 font-semibold leading-tight mt-0.5">
                Jadwal Layanan Perjalanan Dinas
              </p>
            </div>
          </div>

          {/* Tombol Tutup Mobile */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup Menu"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Menu Navigasi
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
                    }`}
                  />
                  <div className="truncate">
                    <div className="text-sm font-semibold truncate leading-tight">
                      {item.label}
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isActive ? 'text-blue-100' : 'text-slate-600'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.alertBadge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white animate-pulse">
                      {item.alertBadge}
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md ${
                        isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-600 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer: User Profile & Brand Box */}
        <div className="p-3 border-t border-slate-200/90 bg-gradient-to-b from-slate-50/80 to-slate-100/60 space-y-2.5">
          {currentUser && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider truncate">
                    {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'operator' ? 'Operator SPD' : 'Pegawai ASN'}
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  title="Keluar dari Akun (Logout)"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white shadow-sm border border-blue-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black tracking-wider text-sky-400">JALANIN</span>
                <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-sky-300 border border-blue-400/30">
                  Digital SPD
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-200 leading-snug">
                &ldquo;Satu Kalender, Semua Perjalanan Terpantau.&rdquo;
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Jadwal Layanan Perjalanan Dinas Pegawai
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Kabupaten Konawe</span>
            <span className="font-semibold text-blue-700">Versi 1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
