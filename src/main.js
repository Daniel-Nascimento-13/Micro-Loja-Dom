// ============================================
// MAIN.JS — ESTADO GLOBAL, NAVEGAÇÃO E BOOT
// ============================================

// ---------- DEPENDÊNCIAS ----------
// → IMPORTA DE: sections/catalogo.js, sections/carrinho.js,
//               sections/pagamento.js, sections/confirmacao.js
// → EXPORTA PARA: sections/catalogo.js, sections/carrinho.js,
//                 sections/pagamento.js, sections/confirmacao.js

// ========== IMPORTS ==========

import { renderCatalogo } from './sections/catalogo.js';
import { renderCarrinho } from './sections/carrinho.js';
import { renderPagamento } from './sections/pagamento.js';
import { renderConfirmacao } from './sections/confirmacao.js';

// ========== ESTADO GLOBAL ==========

// FONTE ÚNICA DE VERDADE DA LOJA, COMPARTILHADA POR TODAS AS SEÇÕES.
// carrinho: LISTA DE { produto, quantidade }
// metodoPagamento: 'pix' | 'maquininha'
// numeroPedido: NUMBER GERADO NA COBRANÇA, OU null ANTES DISSO
export const estado = {
  carrinho: [],
  metodoPagamento: 'pix',
  numeroPedido: null,
};

// ========== NAVEGAÇÃO ENTRE VIEWS ==========

// ---------- NAVEGAR PARA ----------
// RECEBE: viewId (STRING) — SUFIXO DO ID DA SEÇÃO, EX.: 'carrinho' → #view-carrinho
// RETORNA: nada. EXIBE A VIEW ALVO, OCULTA AS DEMAIS E SOBE A PÁGINA.
//
// A VISIBILIDADE É CONTROLADA SÓ POR CLASSES. NADA DE style.display INLINE:
// INLINE VENCE A CLASSE E DEIXARIA .view--active INERTE PARA SEMPRE.
export function navegarPara(viewId) {
  const alvo = document.getElementById(`view-${viewId}`);
  if (!alvo) {
    console.warn(`[navegarPara] view inexistente: view-${viewId}`);
    return;
  }

  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('view--active', 'view--entering');
    v.style.removeProperty('display'); // LIMPA INLINE LEGADO
  });

  // PASSO 1: ENTRA NO LAYOUT AINDA INVISÍVEL (opacity 0 DE .view)
  alvo.classList.add('view--entering');

  // PASSO 2: DOIS FRAMES GARANTEM QUE O BROWSER REGISTRE O ESTADO INICIAL
  // ANTES DO FINAL — SEM ISSO A TRANSIÇÃO NÃO DISPARA E A VIEW FICA EM BRANCO.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      alvo.classList.remove('view--entering');
      alvo.classList.add('view--active');
    });
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== HELPERS DO CARRINHO ==========

// ---------- ADICIONAR AO CARRINHO ----------
// RECEBE: produto (OBJETO DO CATÁLOGO)
// RETORNA: nada. INCREMENTA A QUANTIDADE SE JÁ EXISTIR, SENÃO INSERE COM 1,
// E EM SEGUIDA SINCRONIZA BADGE E VIEW DO CARRINHO.
export function adicionarAoCarrinho(produto) {
  const existente = estado.carrinho.find(i => i.produto.id === produto.id);

  if (existente) {
    existente.quantidade += 1;
  } else {
    estado.carrinho.push({ produto, quantidade: 1 });
  }

  atualizarBadge();
  renderCarrinho();
}

// ---------- REMOVER DO CARRINHO ----------
// RECEBE: produtoId (STRING)
// RETORNA: nada. DECREMENTA A QUANTIDADE E, AO CHEGAR EM ZERO, REMOVE O ITEM.
// IGNORA IDS QUE NÃO ESTÃO NO CARRINHO.
export function removerDoCarrinho(produtoId) {
  const idx = estado.carrinho.findIndex(i => i.produto.id === produtoId);
  if (idx === -1) return;

  if (estado.carrinho[idx].quantidade > 1) {
    estado.carrinho[idx].quantidade -= 1;
  } else {
    estado.carrinho.splice(idx, 1);
  }

  atualizarBadge();
  renderCarrinho();
}

// ---------- TOTAL DO CARRINHO ----------
// RECEBE: nada
// RETORNA: NUMBER — SOMA DE preco × quantidade DE TODOS OS ITENS
export function totalCarrinho() {
  return estado.carrinho.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  );
}

// ---------- QUANTIDADE DE ITENS ----------
// RECEBE: nada
// RETORNA: NUMBER — SOMA DAS QUANTIDADES (NÃO O NÚMERO DE LINHAS DO CARRINHO)
export function qtdItensCarrinho() {
  return estado.carrinho.reduce((acc, item) => acc + item.quantidade, 0);
}

// ---------- LIMPAR CARRINHO ----------
// RECEBE: nada
// RETORNA: nada. ESVAZIA O CARRINHO E ZERA O BADGE.
export function limparCarrinho() {
  estado.carrinho = [];
  atualizarBadge();
}

// ========== BADGE DO HEADER ==========

// ---------- ATUALIZAR BADGE ----------
// RECEBE: nada
// RETORNA: nada. ESCREVE A QUANTIDADE NO BADGE E O EXIBE APENAS SE FOR > 0.
function atualizarBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  const qtd = qtdItensCarrinho();
  badge.textContent = qtd;
  badge.classList.toggle('visible', qtd > 0);
}

// ========== NÚMERO DO PEDIDO ==========

// ---------- GERAR NÚMERO DO PEDIDO ----------
// RECEBE: nada
// RETORNA: NUMBER DE 3 DÍGITOS (100–999), TAMBÉM GRAVADO EM estado.numeroPedido
export function gerarNumeroPedido() {
  estado.numeroPedido = Math.floor(Math.random() * 900) + 100;
  return estado.numeroPedido;
}

// ========== BOOT ==========

// ---------- INIT ----------
// RECEBE: nada
// RETORNA: nada. RENDERIZA TODAS AS VIEWS, ABRE O CATÁLOGO E LIGA O BOTÃO
// DE CARRINHO DO HEADER.
function init() {
  renderCatalogo();
  renderCarrinho();
  renderPagamento();
  renderConfirmacao();

  navegarPara('catalogo');

  const btnCarrinho = document.getElementById('btn-carrinho');
  btnCarrinho?.addEventListener('click', () => {
    renderCarrinho();
    navegarPara('carrinho');
  });

  // ---------- LOGO — VOLTAR AO INÍCIO ----------
  const btnLogo = document.getElementById('btn-logo');
  btnLogo?.addEventListener('click', () => navegarPara('catalogo'));
}

// MÓDULOS SÃO DEFERIDOS, MAS O GUARD EVITA init SILENCIOSAMENTE PERDIDO
// CASO ESTE SCRIPT PASSE A SER CARREGADO DE FORMA SÍNCRONA.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
