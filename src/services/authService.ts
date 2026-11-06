import { AuthUser, DEMO_USERS } from '../types/auth';

const AUTH_STORAGE_KEY = 'jalanin_current_auth_user_v1';
const REMEMBER_KEY = 'jalanin_remember_me_v1';

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserSession(user: AuthUser, rememberMe = true): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch (e) {
    console.error('Gagal menyimpan sesi login:', e);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Gagal menghapus sesi login:', e);
  }
}

/**
 * Autentikasi user dengan username/NIP dan password
 */
export async function authenticateUser(
  identifier: string,
  secret: string,
  rememberMe: boolean = true
): Promise<AuthUser> {
  // Simulasi latensi jaringan yang realistis (350ms)
  await new Promise((resolve) => setTimeout(resolve, 350));

  const cleanId = identifier.trim().toLowerCase();

  // 1. Cek kecocokan dengan Demo User preset (admin / operator / pegawai)
  if (cleanId === 'admin' || cleanId.includes('19700101')) {
    const user: AuthUser = {
      ...DEMO_USERS.admin,
      loginTime: new Date().toISOString(),
    };
    saveUserSession(user, rememberMe);
    return user;
  }

  if (cleanId === 'operator' || cleanId.includes('19850412')) {
    const user: AuthUser = {
      ...DEMO_USERS.operator,
      loginTime: new Date().toISOString(),
    };
    saveUserSession(user, rememberMe);
    return user;
  }

  if (cleanId === 'pegawai' || cleanId.includes('19920815')) {
    const user: AuthUser = {
      ...DEMO_USERS.pegawai,
      loginTime: new Date().toISOString(),
    };
    saveUserSession(user, rememberMe);
    return user;
  }

  // 2. Akun kustom jika pengguna memasukkan nama atau NIP bebas
  if (cleanId.length >= 3 && secret.length >= 3) {
    const isNip = /^\d+$/.test(cleanId);
    const user: AuthUser = {
      id: `user-${Date.now()}`,
      name: isNip ? `Pegawai ASN (${identifier})` : identifier,
      nip: isNip ? identifier : '19880101 201402 1 003',
      jabatan: 'Aparatur Sipil Negara / Petugas SPD',
      role: 'operator',
      email: `${cleanId.replace(/\s+/g, '.')}@konawekab.go.id`,
      instansi: 'Pemerintah Kabupaten Konawe',
      loginTime: new Date().toISOString(),
    };
    saveUserSession(user, rememberMe);
    return user;
  }

  throw new Error('NIP / Nama Pengguna atau kata sandi tidak valid. Minimal 3 karakter.');
}
