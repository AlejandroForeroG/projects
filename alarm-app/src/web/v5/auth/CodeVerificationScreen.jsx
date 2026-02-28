import { useState } from 'react';
import { motion } from 'framer-motion';
import t from '../../theme.js';
import { PillButton, DecoShape } from '../components/index.js';
import { verifyCode, resendCode } from '../../../shared/authStore.js';

export default function CodeVerificationScreen({ email, onVerificationSuccess, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = verifyCode(email, code);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onVerificationSuccess();
  };

  const handleResend = () => {
    setError('');
    setResending(true);
    
    const result = resendCode(email);
    setResending(false);

    if (!result.success) {
      setError(result.error);
    } else {
      setCode('');
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
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
      <DecoShape shape="circle" size={220} color={t.colors.purpleLight} top={-70} right={-50} opacity={0.1} />
      <DecoShape shape="square" size={130} color={t.colors.tealLight} bottom={-50} left={-30} opacity={0.08} />
      <DecoShape shape="diamond" size={90} color={t.colors.yellowLight} top={'45%'} right={-25} opacity={0.1} />
      <DecoShape shape="circle" size={110} color={t.colors.accentLight} bottom={'35%'} left={-35} opacity={0.09} />

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
        {/* Back button */}
        {onBack && (
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: t.colors.textSecondary,
              fontFamily: t.fonts.display,
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: t.spacing.md,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Volver
          </motion.button>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: t.spacing.lg }}>
          <div style={{ fontSize: '48px', marginBottom: t.spacing.sm }}>🔐</div>
          <h1 style={{
            fontFamily: t.fonts.display,
            fontWeight: 800,
            fontSize: '32px',
            color: t.colors.text,
            margin: 0,
            marginBottom: '8px',
          }}>
            Verifica tu Cuenta
          </h1>
          <p style={{
            fontFamily: t.fonts.body,
            fontSize: '15px',
            color: t.colors.textMuted,
            margin: 0,
          }}>
            Ingresa el código enviado a
          </p>
          <p style={{
            fontFamily: t.fonts.display,
            fontSize: '15px',
            color: t.colors.accent,
            margin: '4px 0 0',
            fontWeight: 700,
          }}>
            {email}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Code input */}
          <div style={{ marginBottom: t.spacing.md }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              style={{
                fontFamily: t.fonts.display,
                fontSize: '32px',
                fontWeight: 700,
                padding: '16px',
                border: t.chunkyBorder,
                borderRadius: t.radii.sm,
                background: t.colors.bg,
                color: t.colors.text,
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'center',
                letterSpacing: '8px',
                outline: 'none',
              }}
            />
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
              label={loading ? 'Verificando...' : 'Verificar'}
              onClick={handleSubmit}
              disabled={loading || code.length !== 6}
              color={t.colors.purple}
            />
          </div>
        </form>

        {/* Resend code link */}
        <div style={{
          marginTop: t.spacing.lg,
          textAlign: 'center',
          fontFamily: t.fonts.body,
          fontSize: '14px',
          color: t.colors.textSecondary,
        }}>
          ¿No recibiste el código?{' '}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResend}
            disabled={resending}
            style={{
              background: 'none',
              border: 'none',
              color: resending ? t.colors.textMuted : t.colors.purple,
              fontFamily: t.fonts.display,
              fontWeight: 700,
              fontSize: '14px',
              cursor: resending ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
            }}
          >
            {resending ? 'Reenviando...' : 'Reenviar código'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
