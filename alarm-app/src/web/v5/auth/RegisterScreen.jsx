import { useState } from 'react';
import { motion } from 'framer-motion';
import t from '../../theme.js';
import { Field, PillButton, DecoShape } from '../components/index.js';
import { register } from '../../../shared/authStore.js';

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
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: t.colors.bg,
      fontFamily: t.fonts.body,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Background decorative shapes */}
      <DecoShape shape="circle" size={200} color={t.colors.tealLight} top={-50} left={-40} opacity={0.1} />
      <DecoShape shape="square" size={150} color={t.colors.purpleLight} bottom={-40} right={-50} opacity={0.08} />
      <DecoShape shape="diamond" size={100} color={t.colors.yellowLight} top={'35%'} left={-30} opacity={0.1} />
      <DecoShape shape="circle" size={90} color={t.colors.accentLight} bottom={'30%'} right={-20} opacity={0.12} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: t.colors.surface,
          border: t.chunkyBorder,
          borderRadius: t.radii.lg,
          padding: t.spacing.xl,
          maxWidth: '440px',
          width: '90%',
          boxShadow: t.chunkyShadow,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: t.spacing.lg }}>
          <div style={{ fontSize: '48px', marginBottom: t.spacing.sm }}>✨</div>
          <h1 style={{
            fontFamily: t.fonts.display,
            fontWeight: 800,
            fontSize: '32px',
            color: t.colors.text,
            margin: 0,
            marginBottom: '8px',
          }}>
            Crear Cuenta
          </h1>
          <p style={{
            fontFamily: t.fonts.body,
            fontSize: '15px',
            color: t.colors.textMuted,
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
                background: t.colors.accentLight,
                border: `3px solid ${t.colors.accent}`,
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
          <div style={{ marginTop: t.spacing.lg, textAlign: 'center' }}>
            <PillButton
              label={loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              color={t.colors.teal}
            />
          </div>
        </form>

        {/* Login link */}
        <div style={{
          marginTop: t.spacing.lg,
          textAlign: 'center',
          fontFamily: t.fonts.body,
          fontSize: '14px',
          color: t.colors.textSecondary,
        }}>
          ¿Ya tienes cuenta?{' '}
          <motion.button
            whileHover={{ scale: 1.05 }}
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
      </motion.div>
    </div>
  );
}
