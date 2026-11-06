/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { MonitoringPegawaiView } from './components/MonitoringPegawaiView';
import { RekapitulasiView } from './components/RekapitulasiView';
import { DataPerjalananView } from './components/DataPerjalananView';
import { ImportDataView } from './components/ImportDataView';
import { DeteksiBentrokView } from './components/DeteksiBentrokView';
import { SettingsView } from './components/SettingsView';
import { TripFormModal } from './components/TripFormModal';
import { TripDetailModal } from './components/TripDetailModal';
import { LoginView } from './components/LoginView';

import { PerjalananDinas, BentrokPerjalanan } from './types/index';
import { AuthUser } from './types/auth';
import { loadTrips, saveTrips } from './services/storageService';
import { getStoredUser, clearUserSession } from './services/authService';
import { deteksiSemuaBentrok } from './utils/conflictDetector';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trips, setTrips] = useState<PerjalananDinas[]>([]);
  const [lastSync, setLastSync] = useState<string>(new Date().toISOString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi Logout
  const handleLogout = useCallback(() => {
    clearUserSession();
    setCurrentUser(null);
  }, []);

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<PerjalananDinas | null>(null);
  const [detailModalTrip, setDetailModalTrip] = useState<PerjalananDinas | null>(null);

  // Cross-view Navigation Filter States
  const [calendarSelectedEmployee, setCalendarSelectedEmployee] = useState<string>('all');
  const [rekapFilterNama, setRekapFilterNama] = useState<string>('');

  // Muat data awal saat aplikasi pertama kali dibuka
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await loadTrips();
      setTrips(result.trips);
      setLastSync(result.lastSync);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Hitung jadwal yang bentrok secara otomatis setiap kali data trips diperbarui
  const conflicts: BentrokPerjalanan[] = useMemo(() => {
    return deteksiSemuaBentrok(trips);
  }, [trips]);

  // Simpan perjalanan dinas (Tambah baru atau Edit)
  const handleSaveTrip = async (
    tripData: Omit<PerjalananDinas, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    let updated: PerjalananDinas[];
    const now = new Date().toISOString();

    if (editId) {
      // Mode Edit
      updated = trips.map((t) =>
        t.id === editId
          ? {
              ...t,
              ...tripData,
              updatedAt: now,
            }
          : t
      );
    } else {
      // Mode Tambah Baru
      const newTrip: PerjalananDinas = {
        ...tripData,
        id: `spd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: now,
        updatedAt: now,
      };
      updated = [newTrip, ...trips];
    }

    setTrips(updated);
    const newSync = await saveTrips(updated);
    setLastSync(newSync);
  };

  // Hapus satu perjalanan dinas
  const handleDeleteTrip = async (id: string, nama: string) => {
    if (window.confirm(`Hapus data perjalanan dinas untuk ${nama}? Tindakan ini tidak dapat dibatalkan.`)) {
      const updated = trips.filter((t) => t.id !== id);
      setTrips(updated);
      const newSync = await saveTrips(updated);
      setLastSync(newSync);
    }
  };

  // Commit Import Data (Append atau Replace All)
  const handleCommitImport = async (newTrips: PerjalananDinas[], mode: 'append' | 'replace') => {
    let finalTrips: PerjalananDinas[];
    if (mode === 'replace') {
      finalTrips = newTrips;
    } else {
      // Mode Append: gabungkan dan hindari duplikasi ID
      const existingIds = new Set(trips.map((t) => t.id));
      const filteredNew = newTrips.map((t) => ({
        ...t,
        id: existingIds.has(t.id) ? `spd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` : t.id,
      }));
      finalTrips = [...filteredNew, ...trips];
    }

    setTrips(finalTrips);
    const newSync = await saveTrips(finalTrips);
    setLastSync(newSync);
    setActiveTab('data-perjalanan');
  };

  // Handle Restore dari Backup
  const handleDataRestored = async (restoredTrips: PerjalananDinas[]) => {
    setTrips(restoredTrips);
    const newSync = await saveTrips(restoredTrips);
    setLastSync(newSync);
  };

  // Navigasi cepat dari Monitoring ke Kalender Individual
  const handleOpenEmployeeCalendar = (namaPegawai: string) => {
    setCalendarSelectedEmployee(namaPegawai);
    setActiveTab('calendar');
  };

  // Navigasi cepat dari Monitoring ke Rekapitulasi Terfilter
  const handleFilterEmployeeRekap = (namaPegawai: string) => {
    setRekapFilterNama(namaPegawai);
    setActiveTab('rekapitulasi');
  };

  // Buka Modal Tambah
  const handleOpenAddModal = () => {
    setEditingTrip(null);
    setFormModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (trip: PerjalananDinas) => {
    setEditingTrip(trip);
    setFormModalOpen(true);
  };

  // Jika belum login, tampilkan Halaman Login JALANIN yang sesuai tema website
  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Header Aplikasi */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        lastSync={lastSync}
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
        conflictCount={conflicts.length}
        onNavigateToConflict={() => setActiveTab('deteksi-bentrok')}
        onOpenAddModal={handleOpenAddModal}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigasi */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'calendar' && activeTab !== 'calendar') {
              // Jika user mengklik menu Kalender langsung, tampilkan semua pegawai
              setCalendarSelectedEmployee('all');
            }
            if (tab === 'rekapitulasi' && activeTab !== 'rekapitulasi') {
              setRekapFilterNama('');
            }
            setActiveTab(tab);
          }}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          conflictCount={conflicts.length}
          totalTrips={trips.length}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Area Konten Utama */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            
            {isLoading ? (
              <div className="py-24 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-black text-slate-900 tracking-tight">
                    JALANIN
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Memuat Jadwal Layanan Perjalanan Dinas...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    trips={trips}
                    conflicts={conflicts}
                    onNavigate={setActiveTab}
                    onOpenAddModal={handleOpenAddModal}
                    onSelectTripDetail={(trip) => setDetailModalTrip(trip)}
                  />
                )}

                {activeTab === 'calendar' && (
                  <CalendarView
                    trips={trips}
                    onSelectTripDetail={(trip) => setDetailModalTrip(trip)}
                    initialSelectedEmployee={calendarSelectedEmployee}
                  />
                )}

                {activeTab === 'monitoring' && (
                  <MonitoringPegawaiView
                    trips={trips}
                    onOpenEmployeeCalendar={handleOpenEmployeeCalendar}
                    onFilterEmployeeRekap={handleFilterEmployeeRekap}
                  />
                )}

                {activeTab === 'rekapitulasi' && (
                  <RekapitulasiView
                    trips={trips}
                    initialFilterNama={rekapFilterNama}
                    onSelectTripDetail={(trip) => setDetailModalTrip(trip)}
                  />
                )}

                {activeTab === 'data-perjalanan' && (
                  <DataPerjalananView
                    trips={trips}
                    onOpenAddModal={handleOpenAddModal}
                    onOpenEditModal={handleOpenEditModal}
                    onDeleteTrip={handleDeleteTrip}
                    onSelectTripDetail={(trip) => setDetailModalTrip(trip)}
                    onNavigate={setActiveTab}
                  />
                )}

                {activeTab === 'import-data' && (
                  <ImportDataView
                    onCommitImport={handleCommitImport}
                    currentTotalTrips={trips.length}
                  />
                )}

                {activeTab === 'deteksi-bentrok' && (
                  <DeteksiBentrokView
                    conflicts={conflicts}
                    onOpenEditTrip={handleOpenEditModal}
                    onDeleteTrip={handleDeleteTrip}
                  />
                )}

                {activeTab === 'pengaturan' && (
                  <SettingsView
                    trips={trips}
                    onDataRestored={handleDataRestored}
                    onRefreshData={refreshData}
                  />
                )}
              </>
            )}

          </div>
        </main>

      </div>

      {/* Modal Tambah & Edit Perjalanan */}
      <TripFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveTrip}
        editingTrip={editingTrip}
        allTrips={trips}
      />

      {/* Modal Detail Perjalanan */}
      <TripDetailModal
        trip={detailModalTrip}
        onClose={() => setDetailModalTrip(null)}
        onEdit={(trip) => {
          setDetailModalTrip(null);
          handleOpenEditModal(trip);
        }}
        onDelete={(id, nama) => {
          setDetailModalTrip(null);
          handleDeleteTrip(id, nama);
        }}
      />

    </div>
  );
}
