export interface AuthUser {
  id: string;
  name: string;
  nip: string;
  jabatan: string;
  role: 'admin' | 'operator' | 'pegawai';
  email: string;
  instansi: string;
  avatarUrl?: string;
  loginTime: string;
}

export const DEMO_USERS: Record<string, AuthUser> = {
  admin: {
    id: 'user-admin',
    name: 'Drs. H. Ferdinand, M.Si',
    nip: '19700101 199503 1 001',
    jabatan: 'Kepala Bagian / Admin Utama',
    role: 'admin',
    email: 'ferdinand@konawekab.go.id',
    instansi: 'Pemerintah Kabupaten Konawe',
    loginTime: '',
  },
  operator: {
    id: 'user-operator',
    name: 'Siti Rahmawati, S.T., M.Eng',
    nip: '19850412 201001 2 015',
    jabatan: 'Pranata Komputer / Operator SPD',
    role: 'operator',
    email: 'siti.rahmawati@konawekab.go.id',
    instansi: 'Dinas Komunikasi & Informatika Konawe',
    loginTime: '',
  },
  pegawai: {
    id: 'user-pegawai',
    name: 'Ahmad Fauzi, S.Kom',
    nip: '19920815 201903 1 004',
    jabatan: 'Staf Pelaksana Teknis',
    role: 'pegawai',
    email: 'ahmad.fauzi@konawekab.go.id',
    instansi: 'Badan Pengelola Keuangan Kab. Konawe',
    loginTime: '',
  },
};
