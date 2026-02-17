import t from '../../theme.js';
import { DecoShape } from './index.js';

/**
 * Componente de layout principal
 * Proporciona la estructura base con fondo, formas decorativas y contenedor
 */
export default function MainLayout({ children }) {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: t.colors.bg,
      fontFamily: t.fonts.body,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative shapes */}
      <DecoShape 
        shape="circle" 
        size={250} 
        color={t.colors.accentLight} 
        top={-80} 
        right={-60} 
        opacity={0.08} 
      />
      <DecoShape 
        shape="circle" 
        size={180} 
        color={t.colors.purpleLight} 
        bottom={-60} 
        left={-40} 
        opacity={0.1} 
      />
      <DecoShape 
        shape="square" 
        size={120} 
        color={t.colors.yellowLight} 
        top={'40%'} 
        right={-30} 
        opacity={0.08} 
      />
      <DecoShape 
        shape="diamond" 
        size={80} 
        color={t.colors.tealLight} 
        top={'25%'} 
        left={-20} 
        opacity={0.1} 
      />

      {/* Content */}
      {children}
    </div>
  );
}
