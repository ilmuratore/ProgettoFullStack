import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

// ─── ICONE INLINE ─────────────────────────────────────────────────────────────
function IconUser({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconLock({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconEye({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
function IconChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

// Icona di default (package) — viene usata se non viene passato logoUrl
function IconPackage({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}

const FEATURES = ['RBAC Granulare', 'Audit Log', 'Transazioni ACID', 'DDT Automatico', 'Alert Real-time'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoginPageProps {
  onLoginSuccess: () => void;
  // Personalizzazione per cliente — opzionali, default LogiChain
  companyName?: string;       // es. "Acme S.p.A."
  productName?: string;       // es. "LogiChain ERP" — mostrato nel branding
  logoUrl?: string;           // URL immagine logo cliente (png/svg)
  tagline?: string;           // Frase sotto il titolo nel panel sinistro
}

// ─── Componente Logo ──────────────────────────────────────────────────────────

function LogoMark({ logoUrl, size = 20 }: { logoUrl?: string; size?: number }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="logo" style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  return <IconPackage size={size} />;
}

// ─── LoginPage ────────────────────────────────────────────────────────────────

export function LoginPage({
  onLoginSuccess,
  companyName,
  productName = 'LogiChain ERP',
  logoUrl,
  tagline = "Dall'acquisizione merci alla spedizione finale — un'unica piattaforma per controllare ogni flusso operativo del tuo magazzino.",
}: LoginPageProps) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  const { setAuth } = useAuthStore();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAuth(data.token, data.utente);
      onLoginSuccess();
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 401) {
        setError('Email o password non validi. Controlla le credenziali e riprova.');
      } else {
        setError(e.message ?? 'Errore di connessione. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Nome visualizzato nel branding: se c'è companyName mostra quello,
  // altrimenti usa productName
  const brandName    = companyName ?? productName;
  const brandSuffix  = companyName ? ` · ${productName}` : '';

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">

      {/* ── LEFT PANEL — branding ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(23,232,143,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(23,232,143,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #17E88F 0%, transparent 70%)' }}
        />

        <div
          className={`relative z-10 flex flex-col justify-between p-12 w-full transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #17E88F, #0FA67A)' }}>
              <LogoMark logoUrl={logoUrl} size={20} />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">{brandName}</span>
              {brandSuffix && <span className="text-[#17E88F] font-light text-sm ml-1">{brandSuffix}</span>}
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#17E88F]/30 bg-[#17E88F]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#17E88F] animate-pulse" />
                <span className="text-[#17E88F] text-xs font-medium tracking-wide">Sistema ERP Modulare</span>
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Gestione supply chain
                <br />
                <span className="text-[#17E88F]">senza confini</span>
              </h1>
              <p className="text-[#94A3B8] text-base leading-relaxed max-w-sm">
                {tagline}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <span key={f} className="px-3 py-1 rounded-full text-xs font-medium text-[#CBD5E1] border border-[#334155] bg-[#1E293B]">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer branding */}
          <p className="text-[#334155] text-xs">
            Powered by <span className="text-[#17E88F] font-medium">LogiChain ERP</span>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div
          className={`w-full max-w-md mx-auto transition-all duration-700 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #17E88F, #0FA67A)' }}>
              <LogoMark logoUrl={logoUrl} size={16} />
            </div>
            <span className="text-[#2D2D2D] font-bold text-lg">{brandName}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F172A]">Accedi al sistema</h2>
            <p className="text-[#6B7280] mt-1 text-sm">Inserisci le tue credenziali per continuare</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151]">Email</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <IconUser size={15} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="nome@azienda.it"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]/40 focus:border-[#17E88F] transition-all placeholder:text-[#C4C9D4]"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151]">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <IconLock size={15} />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]/40 focus:border-[#17E88F] transition-all placeholder:text-[#C4C9D4]"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPwd ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
                <IconX size={14} />
                <p className="text-sm text-[#DC2626]">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#17E88F]/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: loading ? '#94A3B8' : 'linear-gradient(135deg, #17E88F, #0FA67A)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Accesso in corso...
                </>
              ) : (
                <>
                  Accedi
                  <IconChevronRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#9CA3AF] mt-8">
            {brandName} — Sistema di gestione supply chain
          </p>
        </div>
      </div>
    </div>
  );
}