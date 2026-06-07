import { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

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
function IconPackage({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" />
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

const ROLE_LABELS: Record<number, string> = {
  1: 'Admin',
  2: 'Resp. Acquisti',
  3: 'Resp. Magazzino',
  4: 'Operatore',
  5: 'Corriere',
};
const ROLE_COLORS: Record<number, { color: string; bg: string }> = {
  1: { color: '#0F172A', bg: '#F1F5F9' },
  2: { color: '#1D4ED8', bg: '#DBEAFE' },
  3: { color: '#0D9488', bg: '#CCFBF1' },
  4: { color: '#16A34A', bg: '#DCFCE7' },
  5: { color: '#EA580C', bg: '#FEE2E2' },
};

const FEATURES = ['RBAC Granulare', 'Audit Log', 'Transazioni ACID', 'DDT Automatico', 'Alert Real-time'];

const ROLES_INFO = [
  { id: 1, label: 'Admin',                 permCount: 18, color: '#17E88F' },
  { id: 2, label: 'Responsabile Acquisti', permCount: 7,  color: '#3B82F6' },
  { id: 3, label: 'Responsabile Magazzino',permCount: 8,  color: '#0D9488' },
  { id: 4, label: 'Operatore',             permCount: 4,  color: '#16A34A' },
  { id: 5, label: 'Corriere',              permCount: 0,  color: '#EA580C' },
];

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [mounted, setMounted]       = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(23,232,143,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(23,232,143,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #17E88F 0%, transparent 70%)' }}
        />

        <div
          className={`relative z-10 flex flex-col justify-between p-12 w-full transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #17E88F, #0FA67A)' }}>
              <IconPackage size={20} />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">LogiChain</span>
              <span className="text-[#17E88F] font-light text-xl"> ERP</span>
            </div>
          </div>

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
                Dall'acquisizione merci alla spedizione finale — un'unica piattaforma per controllare ogni flusso operativo del tuo magazzino.
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

          <div className="space-y-3">
            <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider">5 ruoli operativi</p>
            <div className="space-y-2">
              {ROLES_INFO.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-[#94A3B8] text-sm">{r.label}</span>
                  <span className="text-[#475569] text-xs ml-auto">{r.permCount} permessi</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div
          className={`w-full max-w-md mx-auto transition-all duration-700 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #17E88F, #0FA67A)' }}>
              <IconPackage size={16} />
            </div>
            <span className="text-[#2D2D2D] font-bold text-lg">LogiChain ERP</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F172A]">Accedi al sistema</h2>
            <p className="text-[#6B7280] mt-1 text-sm">Inserisci le tue credenziali per continuare</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="nome@logichain.it"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E5EAF2] rounded-xl text-sm text-[#2D2D2D] bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F]/40 focus:border-[#17E88F] transition-all placeholder:text-[#C4C9D4]"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

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

            
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
                <IconX size={14} />
                <p className="text-sm text-[#DC2626]">{error}</p>
              </div>
            )}

            
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

          
          <div className="mt-6 p-4 bg-white border border-[#E5EAF2] rounded-xl">
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-3">Ruoli disponibili</p>
            <div className="space-y-1.5">
              {ROLES_INFO.map((r) => {
                const conf = ROLE_COLORS[r.id] ?? { color: '#6B7280', bg: '#F3F4F6' };
                return (
                  <div key={r.id} className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: conf.bg, color: conf.color }}
                    >
                      {ROLE_LABELS[r.id]}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">{r.permCount} permessi</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-6">
            LogiChain ERP V3.0 — Sistema di gestione supply chain
          </p>
        </div>
      </div>
    </div>
  );
}
