import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import t from '../theme.js';
import { getScreenComponent } from './config.js';
import { Navigation, PageHeader, MainLayout } from './components/index.js';

// ── Ensure fonts are loaded ─────────────────────────────────────────
import './constants.js';

/**
 * Componente principal FloatingBentoV5
 * Aplicación de seguimiento de sueño con navegación por pestañas
 * Arquitectura desacoplada con componentes separados para mejor mantenibilidad
 */
export default function FloatingBentoV5({ state = {} }) {
  const [activeTab, setActiveTab] = useState('sleep');

  const ActiveScreen = getScreenComponent(activeTab);

  return (
    <MainLayout>
      {/* Navegación flotante */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Encabezado de página */}
      <PageHeader activeTab={activeTab} />

      {/* Área de contenido */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: `0 ${t.spacing.lg} ${t.spacing.xxl}`,
        position: 'relative',
        zIndex: 1,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {ActiveScreen && <ActiveScreen state={state} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
