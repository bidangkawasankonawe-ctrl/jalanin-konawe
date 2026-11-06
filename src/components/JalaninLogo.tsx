import React from 'react';

interface JalaninLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

/**
 * Logo Resmi JALANIN (Jadwal Layanan Perjalanan Dinas)
 * Konsep Branding:
 * - Kombinasi Kalender Digital + Pesawat Aerodinamis Modern
 * - Palet Warna: Biru Elektrik (#2563eb / #38bdf8) & Deep Navy (#0f172a / #1e293b)
 * - Gaya: Digital, presisi, modern
 */
export const JalaninLogo: React.FC<JalaninLogoProps> = ({
  size = 'md',
  showText = false,
  showTagline = false,
  className = '',
  theme = 'auto',
}) => {
  const iconSizeMap = {
    sm: { box: 'w-8 h-8', svg: 32 },
    md: { box: 'w-10 h-10', svg: 40 },
    lg: { box: 'w-12 h-12', svg: 48 },
    xl: { box: 'w-16 h-16', svg: 64 },
  };

  const currentSize = iconSizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Icon Badge: Kombinasi Kalender & Pesawat */}
      <div
        className={`${currentSize.box} relative shrink-0 rounded-xl overflow-hidden shadow-md shadow-blue-600/25 border border-blue-400/40 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center group`}
      >
        {/* Glow & Digital Grid Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400/30 via-blue-600/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:6px_6px] pointer-events-none" />

        {/* Vector SVG: Kalender + Pesawat */}
        <svg
          width={currentSize.svg}
          height={currentSize.svg}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Gradien Biru Elektrik ke Biru Langit */}
            <linearGradient id="electricBlueGrad" x1="6" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Gradien Pesawat Super Modern */}
            <linearGradient id="planeGrad" x1="16" y1="26" x2="42" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Shadow Pesawat */}
            <filter id="planeShadow" x="14" y="6" width="30" height="30" filterUnits="userSpaceOnUse">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Basis Kalender Digital (Frame) */}
          <rect
            x="8"
            y="12"
            width="28"
            height="26"
            rx="5"
            fill="#0f172a"
            stroke="url(#electricBlueGrad)"
            strokeWidth="2"
          />

          {/* Top Bar Kalender */}
          <path
            d="M8 17C8 14.2386 10.2386 12 13 12H31C33.7614 12 36 14.2386 36 17V18H8V17Z"
            fill="#1e293b"
          />
          <line x1="8" y1="18" x2="36" y2="18" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />

          {/* Ring / Binder Kalender Digital */}
          <rect x="14" y="9" width="3" height="6" rx="1.5" fill="#38bdf8" />
          <rect x="26" y="9" width="3" height="6" rx="1.5" fill="#38bdf8" />

          {/* Titik Grid Tanggal Digital (Kalender) */}
          <circle cx="14" cy="24" r="1.5" fill="#38bdf8" fillOpacity="0.9" />
          <circle cx="21" cy="24" r="1.5" fill="#60a5fa" fillOpacity="0.7" />
          <circle cx="28" cy="24" r="1.5" fill="#60a5fa" fillOpacity="0.4" />
          <circle cx="14" cy="30" r="1.5" fill="#60a5fa" fillOpacity="0.7" />
          <circle cx="21" cy="30" r="1.5" fill="#38bdf8" fillOpacity="0.9" />

          {/* Garis Lintasan Terbang (Flight Trail / Streamline) */}
          <path
            d="M12 34C18 33 24 28 32 20"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Pesawat Aerodinamis Modern yang Meluncur Naik (Pesawat + Kalender) */}
          <g filter="url(#planeShadow)">
            <path
              d="M40 10L27 21L29 25L34 23L33 28L36 29L40 10Z"
              fill="url(#planeGrad)"
            />
            {/* Sayap Bawah & Detail Ekor */}
            <path
              d="M27 21L19 22L23 25L28 24.5L27 21Z"
              fill="#93c5fd"
            />
            {/* Hidung Jet / Kokpit Dot */}
            <circle cx="39.5" cy="10.5" r="1" fill="#ffffff" />
          </g>
        </svg>

        {/* Sudut Aksen Digital Berteknologi Tinggi */}
        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-cyan-400 animate-pulse pointer-events-none" />
      </div>

      {/* Typography: Nama Aplikasi & Keterangan */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight leading-none ${
                size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'
              } ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              JALANIN
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9.5px] font-bold tracking-widest uppercase bg-blue-600 text-white shadow-xs">
              SPD
            </span>
          </div>

          <span
            className={`font-semibold tracking-wide text-xs ${
              theme === 'dark' ? 'text-sky-300' : 'text-blue-700'
            }`}
          >
            Jadwal Layanan Perjalanan Dinas
          </span>

          {showTagline && (
            <span className="text-[11px] text-slate-500 font-medium italic mt-0.5">
              &ldquo;Satu Kalender, Semua Perjalanan Terpantau.&rdquo;
            </span>
          )}
        </div>
      )}
    </div>
  );
};
