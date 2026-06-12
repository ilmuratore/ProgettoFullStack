import { type ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LoginPage } from '../../pages/LoginPage';

interface PrivateRouteProps {
  children: ReactNode;
  permesso?: string;
  onLoginSuccess: () => void;
}

/**
 * PrivateRoute — wrappa qualsiasi contenuto richiedendo autenticazione.
 * Se l'utente non è loggato mostra la LoginPage.
 * Se è loggato ma manca il permesso specifico, mostra banner 403.
 */
export function PrivateRoute({ children, permesso, onLoginSuccess }: PrivateRouteProps) {
  const { token, utente, hasPermesso } = useAuthStore();

  // Non autenticato
  if (!token || !utente) {
    return <LoginPage onLoginSuccess={onLoginSuccess} />;
  }

  // Autenticato ma senza il permesso richiesto
  if (permesso && !hasPermesso(permesso)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-[#FEE2E2] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#2D2D2D] mb-2">Accesso negato</h3>
          <p className="text-sm text-[#6B7280]">
            Non hai il permesso <code className="text-xs bg-[#F3F4F6] px-1.5 py-0.5 rounded font-mono">{permesso}</code> necessario per questa sezione.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
