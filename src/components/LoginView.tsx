import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  X,
  Phone,
  Mail,
  Building,
  Sparkles,
  Plane
} from 'lucide-react';
import { JalaninLogo } from './JalaninLogo';
import { AuthUser, DEMO_USERS } from '../types/auth';
import { authenticateUser } from '../services/authService';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Fungsi Quick Login dengan 1-klik untuk akun demo
  const handleQuickSelect = (key: 'admin' | 'operator' | 'pegawai') => {
    setErrorMessage('');
    if (key === 'admin') {
      setIdentifier('admin');
      setPassword('admin123');
    } else if (key === 'operator') {
      setIdentifier('operator');
      setPassword('operator123');
    } else {
      setIdentifier('pegawai');
      setPassword('pegawai123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan NIP atau nama pengguna.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authenticateUser(identifier, password, rememberMe);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali NIP dan kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const user = await authenticateUser('admin', 'admin123', true);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Background Digital Grid & Glow Effect Bertema Biru Elektrik & Deep Navy */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Ambient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Kolom Kiri: Visual Branding JALANIN (5 Kolom Desktop) */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Light di dalam card */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Bagian Atas: Logo, Nama, Subtitle & Tagline */}
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-sky-400 border border-blue-400/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Sistem Monitoring Resmi ASN</span>
            </div>

            <div className="space-y-3">
              <JalaninLogo size="xl" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    JALANIN
                  </h1>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-600 text-white shadow-xs tracking-wider">
                    SPD
                  </span>
                </div>
                <p className="text-sm font-bold text-sky-300 mt-1">
                  Jadwal Layanan Perjalanan Dinas
                </p>
                <p className="text-xs text-slate-300 font-medium italic mt-2 leading-relaxed">
                  &ldquo;Satu Kalender, Semua Perjalanan Terpantau.&rdquo;
                </p>
              </div>
            </div>

            {/* Fitur Utama */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="p-2 rounded-lg bg-blue-600/20 text-sky-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Kalender Interaktif</h4>
                  <p className="text-[11px] text-slate-400">Visualisasi jadwal perjalanan bulanan, mingguan & harian.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="p-2 rounded-lg bg-red-600/20 text-red-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Deteksi Bentrok Otomatis</h4>
                  <p className="text-[11px] text-slate-400">Peringatan seketika saat pegawai memiliki jadwal tumpang tindih.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Import & Rekap Ekspor</h4>
                  <p className="text-[11px] text-slate-400">Dukungan Excel, CSV, Google Sheets, dan cetak laporan PDF.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Bawah: Informasi Pemkab Konawe */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              <span>Pemerintah Kabupaten Konawe</span>
            </div>
            <span className="font-semibold text-slate-500">Sulawesi Tenggara</span>
          </div>

        </div>

        {/* Kolom Kanan: Form Log In (7 Kolom Desktop) */}
        <div className="lg:col-span-7 p-8 sm:p-12 bg-white flex flex-col justify-between">
          
          <div>
            {/* Header Form */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Masuk ke Aplikasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Silakan masukkan NIP atau nama pengguna yang telah terdaftar pada sistem.
              </p>
            </div>

            {/* Quick Demo Login Preset Buttons */}
            <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Pilih Cepat Akun Demo (1-Klik):
                </span>
                <span className="text-[10px] text-slate-600 font-semibold uppercase">Otomatis Terisi</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('admin')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    identifier === 'admin'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="leading-tight">Admin</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Kabag/Kadis</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelect('operator')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    identifier === 'operator'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="leading-tight">Operator</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Pengelola SPD</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelect('pegawai')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    identifier === 'pegawai'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="leading-tight">Pegawai</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Aparatur ASN</div>
                </button>
              </div>
            </div>

            {/* Pesan Error */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field 1: Username / NIP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  NIP atau Nama Pengguna <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: 19700101... atau admin"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Field 2: Kata Sandi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium text-slate-900 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox Ingat Saya */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Ingat sesi login di perangkat ini
                  </span>
                </label>
              </div>

              {/* Tombol Masuk Utama */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke JALANIN</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Footer Card: Keamanan & Tamu */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enkripsi Aman SSL 256-Bit</span>
            </div>
            
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline-offset-2 hover:underline transition-all text-left"
            >
              Masuk Cepat Mode Tamu / Demo &rarr;
            </button>
          </div>

        </div>

      </div>

      {/* Modal Bantuan Lupa Kata Sandi */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bantuan Kata Sandi JALANIN
                  </h3>
                  <p className="text-xs text-slate-500">Pemulihan Akun Pegawai / Operator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Untuk alasan keamanan data perjalanan dinas Aparatur Sipil Negara, pengaturan ulang kata sandi dilakukan secara terverifikasi melalui Pengelola Sistem / Admin OPD.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Dinas Komunikasi & Informatika Kab. Konawe</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Layanan Bantuan: (0408) 2421-123 / Ext. 104</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email: helpdesk@konawekab.go.id</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-medium">
                💡 <strong>Tips Cepat Pengujian:</strong> Anda dapat menggunakan tombol <strong>&ldquo;Pilih Cepat Akun Demo (1-Klik)&rdquo;</strong> pada layar login dengan akun <strong>Admin</strong>, <strong>Operator</strong>, atau <strong>Pegawai</strong>.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Mengerti & Kembali
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
