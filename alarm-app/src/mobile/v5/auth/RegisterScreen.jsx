import { useState } from 'react';
import { motion } from 'framer-motion';
import theme from '../theme';
import { register } from '../../../shared/authStore.js';

const t = theme;

function StatusBar() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '44px 24px 8px',
      fontSize: '13px',
      fontFamily: t.fonts.body,
      fontWeight: 700,
      color: t.colors.text,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.colors.teal }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.colors.accent }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.colors.yellow }} />
      </div>
    </div>
  );
}

function ChunkyButton({ children, onClick, variant = 'primary', color, disabled, style: extra = {} }) {
  const variants = {
    primary: {
      background: color || t.colors.accent,
      color: t.colors.white,
      border: `3px solid ${t.colors.text}`,
      fontWeight: 700,
      boxShadow: `4px 4px 0px ${t.colors.text}`,
    },
    secondary: {
      background: t.colors.surface,
      color: t.colors.text,
      border: `3px solid ${t.colors.text}`,
      fontWeight: 600,
      boxShadow: `4px 4px 0px ${t.colors.text}`,
    },
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97, boxShadow: `2px 2px 0px ${t.colors.text}`, y: 2, x: 2 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px 24px',
        borderRadius: t.radii.sm,
        fontSize: '15px',
        fontFamily: t.fonts.display,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: '52px',
        opacity: disabled ? 0.5 : 1,
        ...variants[variant],
        ...extra,
      }}
    >
      {children}
    </motion.button>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div style={{ marginBottom: t.spacing.md }}>
      <label style={{
        fontFamily: t.fonts.display,
        fontSize: '13px',
        fontWeight: 700,
        color: t.colors.text,
        display: 'block',
        marginBottom: '6px',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '15px',
          fontFamily: t.fonts.body,
          border: `3px solid ${t.colors.text}`,
          borderRadius: t.radii.sm,
          background: t.colors.surface,
          color: t.colors.text,
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    </div>
  );
}

export default function RegisterScreen({ onNavigateToLogin, onNavigateToVerification }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = register(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onNavigateToVerification(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        height: '100%',
        background: t.colors.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar />
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: `0 ${t.spacing.lg}`,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: t.spacing.xl, marginTop: t.spacing.xl }}>
          <div style={{ fontSize: '64px', marginBottom: t.spacing.sm }}>✨</div>
          <h1 style={{
            fontFamily: t.fonts.display,
            fontSize: '28px',
            fontWeight: 800,
            color: t.colors.text,
            margin: '0 0 8px',
          }}>
            Crear Cuenta
          </h1>
          <p style={{
            fontFamily: t.fonts.body,
            fontSize: '15px',
            color: t.colors.textSecondary,
            margin: 0,
          }}>
            Regístrate para comenzar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
          />
          
          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
          />

          <div style={{
            fontFamily: t.fonts.body,
            fontSize: '13px',
            color: t.colors.textMuted,
            marginTop: '-8px',
            marginBottom: t.spacing.md,
          }}>
            Mínimo 6 caracteres
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FFE5E2',
                border: `3px solid ${t.colors.accentDark}`,
                borderRadius: t.radii.sm,
                padding: '12px 16px',
                marginBottom: t.spacing.md,
                fontFamily: t.fonts.body,
                fontSize: '14px',
                color: t.colors.accentDark,
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Submit button */}
          <div style={{ marginTop: t.spacing.lg }}>
            <ChunkyButton
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              color={t.colors.teal}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </ChunkyButton>
          </div>
        </form>

        {/* Login link */}
        <div style={{
          marginTop: t.spacing.lg,
          textAlign: 'center',
          fontFamily: t.fonts.body,
          fontSize: '14px',
          color: t.colors.textSecondary,
          paddingBottom: t.spacing.xl,
        }}>
          ¿Ya tienes cuenta?{' '}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: t.colors.teal,
              fontFamily: t.fonts.display,
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Iniciar sesión
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
