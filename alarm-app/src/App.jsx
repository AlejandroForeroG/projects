import { useState, Suspense, useEffect } from 'react';
import PhoneFrame from './shared/PhoneFrame';
import { useAlarmState } from './shared/useAlarmState';
import mobileRegistry, { versionMeta } from './mobile/registry';
import webRegistry, { webVersionMeta } from './web/registry';
import StyleTile from './components/StyleTile';
import { isAuthenticated } from './shared/authStore';
import { LoginScreen as WebLoginScreen, RegisterScreen as WebRegisterScreen, CodeVerificationScreen as WebCodeScreen } from './web/v5/auth';
import { LoginScreen as MobileLoginScreen, RegisterScreen as MobileRegisterScreen, CodeVerificationScreen as MobileCodeScreen } from './mobile/v5/auth';

function LoadingFallback({ isWeb }) {
  return (
    <div style={{
      height: isWeb ? '400px' : '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isWeb ? '#FFFBF5' : '#f5f5f5',
      fontFamily: "'Sora', system-ui, sans-serif",
      color: '#9AACBB',
      fontSize: '14px',
      fontWeight: 600,
      borderRadius: isWeb ? '20px' : 0,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px', height: '32px',
          border: '3px solid #E0E8EE', borderTopColor: '#FF6B5A',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        Loading design…
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─── Platform toggle pill ─── */
function PlatformSelector({ platform, onPlatformChange }) {
  return (
    <div style={{
      display: 'flex',
      background: '#F0F3F6',
      borderRadius: '100px',
      padding: '4px',
      border: '2px solid #1A2B3C',
      boxShadow: '3px 3px 0px #1A2B3C',
    }}>
      {['mobile', 'web'].map((p) => (
        <button
          key={p}
          onClick={() => onPlatformChange(p)}
          style={{
            padding: '8px 24px',
            borderRadius: '100px',
            border: 'none',
            background: platform === p ? '#1A2B3C' : 'transparent',
            color: platform === p ? '#FFFFFF' : '#5A6E7F',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: "'Sora', system-ui, sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textTransform: 'capitalize',
            letterSpacing: '0.03em',
          }}
        >
          {p === 'mobile' ? '📱 Mobile' : '🖥️ Web'}
        </button>
      ))}
    </div>
  );
}

function ViewSelector({ view, onViewChange }) {
  return (
    <div style={{
      display: 'flex',
      background: '#F0F3F6',
      borderRadius: '100px',
      padding: '4px',
      border: '2px solid #1A2B3C',
      boxShadow: '3px 3px 0px #1A2B3C',
    }}>
      {['flows', 'styletile'].map((v) => (
        <button
          key={v}
          onClick={() => onViewChange(v)}
          style={{
            padding: '8px 24px',
            borderRadius: '100px',
            border: 'none',
            background: view === v ? '#1A2B3C' : 'transparent',
            color: view === v ? '#FFFFFF' : '#5A6E7F',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: "'Sora', system-ui, sans-serif",
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textTransform: 'capitalize',
            letterSpacing: '0.03em',
          }}
        >
          {v === 'flows' ? 'Flujos' : 'System Design'}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [platform, setPlatform] = useState('mobile');
  const [view, setView] = useState('flows');
  const [authenticated, setAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register' | 'verify'
  const [verificationEmail, setVerificationEmail] = useState('');
  const state = useAlarmState();

  // Check authentication on mount
  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  // Mobile always shows v5 only, Web always shows v1 only
  const MobileComponent = mobileRegistry[5];
  const WebComponent = webRegistry[1];

  // Auth handlers
  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleNavigateToRegister = () => {
    setAuthScreen('register');
  };

  const handleNavigateToLogin = () => {
    setAuthScreen('login');
  };

  const handleNavigateToVerification = (email) => {
    setVerificationEmail(email);
    setAuthScreen('verify');
  };

  const handleVerificationSuccess = () => {
    setAuthenticated(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: view === 'styletile' ? '#F0F3F6' : '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* ─── Top control bar (on white page background) ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        paddingTop: '16px',
        paddingBottom: view === 'styletile' ? '16px' : (platform === 'web' ? '20px' : '0px'),
        flexWrap: 'wrap',
      }}>
        <ViewSelector view={view} onViewChange={setView} />
        <PlatformSelector platform={platform} onPlatformChange={setPlatform} />
      </div>

      {view === 'styletile' && (
        <div style={{ width: '100%', padding: '0 24px 24px', boxSizing: 'border-box' }}>
          <StyleTile />
        </div>
      )}

      {/* ─── Auth Flow (when not authenticated) ─── */}
      {view === 'flows' && !authenticated && platform === 'mobile' && (
        <>
          <PhoneFrame
            version={5}
            onVersionChange={() => {}}
            totalVersions={1}
            singleVersion
          >
            {authScreen === 'login' && (
              <MobileLoginScreen
                onNavigateToRegister={handleNavigateToRegister}
                onNavigateToVerification={handleNavigateToVerification}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
            {authScreen === 'register' && (
              <MobileRegisterScreen
                onNavigateToLogin={handleNavigateToLogin}
                onNavigateToVerification={handleNavigateToVerification}
              />
            )}
            {authScreen === 'verify' && (
              <MobileCodeScreen
                email={verificationEmail}
                onVerificationSuccess={handleVerificationSuccess}
                onBack={handleNavigateToLogin}
              />
            )}
          </PhoneFrame>

          <div style={{
            marginTop: '16px',
            marginBottom: '32px',
            textAlign: 'center',
            fontFamily: "'Sora', system-ui, sans-serif",
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
            }}>
              Sistema de Autenticación
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '2px',
            }}>
              Login, Registro y Verificación
            </div>
          </div>
        </>
      )}

      {view === 'flows' && !authenticated && platform === 'web' && (
        <div style={{
          width: '100%',
          minHeight: 'calc(100vh - 100px)',
        }}>
          {authScreen === 'login' && (
            <WebLoginScreen
              onNavigateToRegister={handleNavigateToRegister}
              onNavigateToVerification={handleNavigateToVerification}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
          {authScreen === 'register' && (
            <WebRegisterScreen
              onNavigateToLogin={handleNavigateToLogin}
              onNavigateToVerification={handleNavigateToVerification}
            />
          )}
          {authScreen === 'verify' && (
            <WebCodeScreen
              email={verificationEmail}
              onVerificationSuccess={handleVerificationSuccess}
              onBack={handleNavigateToLogin}
            />
          )}
        </div>
      )}

      {/* ─── Flows: Mobile mode (authenticated) ─── */}
      {view === 'flows' && authenticated && platform === 'mobile' && (
        <>
          <PhoneFrame
            version={5}
            onVersionChange={() => {}}
            totalVersions={1}
            singleVersion
          >
            <Suspense fallback={<LoadingFallback />}>
              <MobileComponent state={state} />
            </Suspense>
          </PhoneFrame>

          {/* Version info label */}
          <div style={{
            marginTop: '16px',
            marginBottom: '32px',
            textAlign: 'center',
            fontFamily: "'Sora', system-ui, sans-serif",
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
            }}>
              {versionMeta[5]?.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '2px',
            }}>
              {versionMeta[5]?.desc}
            </div>
          </div>
        </>
      )}

      {/* ─── Flows: Web mode (authenticated) ─── */}
      {view === 'flows' && authenticated && platform === 'web' && (
        <div style={{
          width: '100%',
          maxWidth: '1280px',
          minHeight: 'calc(100vh - 100px)',
          padding: '0 24px 40px',
        }}>
          {/* Web version info */}
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
            fontFamily: "'Sora', system-ui, sans-serif",
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#5A6E7F',
            }}>
              {webVersionMeta[1]?.name}
            </span>
            <span style={{
              fontSize: '12px',
              color: '#9AACBB',
              marginLeft: '8px',
            }}>
              — {webVersionMeta[1]?.desc}
            </span>
          </div>

          {/* Web component */}
          <Suspense fallback={<LoadingFallback isWeb />}>
            <WebComponent state={state} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
