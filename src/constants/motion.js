// ============================================
// MOTION.JS — CONSTANTES DE ANIMAÇÃO
// ============================================

// ---------- DEPENDÊNCIAS ----------
// → IMPORTA DE: nenhum
// → EXPORTA PARA: nenhum consumidor atual (RESERVADO PARA AS ANIMAÇÕES GSAP)

// ========== DURAÇÕES ==========

// DURAÇÃO DAS TRANSIÇÕES EM SEGUNDOS — ESCALA ÚNICA USADA POR TODAS AS ANIMAÇÕES.
// fast: MICROINTERAÇÕES (HOVER, FEEDBACK DE BOTÃO)
// base: TRANSIÇÕES PADRÃO (TROCA DE VIEW, ENTRADA DE CARDS)
// slow / slower: ANIMAÇÕES DE DESTAQUE (CHECK DE CONFIRMAÇÃO, REVEALS LONGOS)
export const DURATION = {
  fast:   0.4,
  base:   0.7,
  slow:   1.0,
  slower: 1.2,
};

// ========== CURVAS DE EASING ==========

// CURVAS NO FORMATO GSAP.
// out:  DESACELERAÇÃO PADRÃO PARA ENTRADAS
// expo: DESACELERAÇÃO AGRESSIVA PARA ÊNFASE
// loop: CURVA SIMÉTRICA PARA ANIMAÇÕES QUE SE REPETEM
export const EASE = {
  out:     'power3.out',
  expo:    'expo.out',
  loop:    'power1.inOut',
};

// ========== STAGGER ==========

// ATRASO EM SEGUNDOS ENTRE ELEMENTOS DE UMA MESMA SEQUÊNCIA ANIMADA.
export const STAGGER = 0.12;

// ========== PREFERÊNCIA DE MOVIMENTO ==========

// FALSE QUANDO O USUÁRIO PEDE MENOS MOVIMENTO NO SISTEMA OPERACIONAL —
// SERVE DE GUARDA PARA PULAR OU ENCURTAR ANIMAÇÕES.
export const MOTION_OK = !window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
