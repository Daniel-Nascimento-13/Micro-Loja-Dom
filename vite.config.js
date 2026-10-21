// ============================================
// VITE.CONFIG.JS — CONFIGURAÇÃO DE BUILD DO VITE
// ============================================

// ---------- DEPENDÊNCIAS ----------
// → IMPORTA DE: vite, @tailwindcss/vite
// → EXPORTA PARA: CLI DO VITE (dev, build, preview)

// ========== IMPORTS ==========

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// ========== CONFIGURAÇÃO ==========

export default defineConfig({
  plugins: [tailwindcss()],
});
