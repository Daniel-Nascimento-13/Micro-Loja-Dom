// ============================================
// CONFIRMACAO.JS — SEÇÃO DE CONFIRMAÇÃO DO PEDIDO
// ============================================

// ---------- DEPENDÊNCIAS ----------
// → IMPORTA DE: data/produtos.js, main.js, sections/catalogo.js,
//               sections/carrinho.js
// → EXPORTA PARA: main.js, sections/pagamento.js

// ========== IMPORTS ==========

import { formatPreco } from '../data/produtos.js';
import {
  estado,
  totalCarrinho,
  limparCarrinho,
  navegarPara,
} from '../main.js';
import { renderCatalogo } from './catalogo.js';
import { renderCarrinho } from './carrinho.js';

// ========== RENDER PRINCIPAL ==========

// ---------- RENDER CONFIRMAÇÃO ----------
// RECEBE: nada
// RETORNA: nada. RECONSTRÓI #confirmacao-root COM CHECK, NÚMERO DO PEDIDO,
// RESUMO, AVISO DE RETIRADA E BOTÃO DE NOVO PEDIDO. DEVE SER CHAMADA DEPOIS
// DE gerarNumeroPedido E ANTES DE LIMPAR O CARRINHO — O RESUMO LÊ OS ITENS
// AINDA PRESENTES EM estado.carrinho.
export function renderConfirmacao() {
  const root = document.getElementById('confirmacao-root');
  if (!root) return;

  root.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  container.appendChild(criarCheck());
  container.appendChild(criarNumeroPedido());
  container.appendChild(criarResumo());
  container.appendChild(criarAviso());
  container.appendChild(criarBotao());

  root.appendChild(container);
}

// ========== CHECK ==========

// ---------- CRIAR CHECK ANIMADO ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM O CÍRCULO DE CONFIRMAÇÃO, TÍTULO E SUBTÍTULO.
// A CLASSE DE ANIMAÇÃO ENTRA NO FRAME SEGUINTE PARA QUE O BROWSER REGISTRE
// O ESTADO INICIAL E A TRANSIÇÃO CSS REALMENTE DISPARE.
function criarCheck() {
  const el = document.createElement('div');
  el.className = 'confirmacao-check';
  el.setAttribute('aria-hidden', 'true');

  el.innerHTML = `
    <div class="confirmacao-check__circulo">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <h1 class="confirmacao-check__titulo">Pedido confirmado!</h1>
    <p class="confirmacao-check__sub">Retire o produto!</p>
  `;

  requestAnimationFrame(() => {
    el.querySelector('.confirmacao-check__circulo')
      ?.classList.add('confirmacao-check__circulo--animado');
  });

  return el;
}

// ========== NÚMERO ==========

// ---------- CRIAR NÚMERO DO PEDIDO ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM O NÚMERO GERADO EM estado.numeroPedido, OU '---'
// QUANDO A VIEW É RENDERIZADA ANTES DE QUALQUER COBRANÇA (BOOT INICIAL).
function criarNumeroPedido() {
  const numero = estado.numeroPedido ?? '---';

  const el = document.createElement('div');
  el.className = 'confirmacao-numero';

  el.innerHTML = `
    <span class="confirmacao-numero__label">Número do pedido</span>
    <span class="confirmacao-numero__valor" aria-live="polite">#${numero}</span>
  `;

  return el;
}

// ========== RESUMO ==========

// ---------- CRIAR RESUMO DO PEDIDO ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM A LISTA DE ITENS (QUANTIDADE × NOME + SUBTOTAL),
// O TOTAL PAGO E O MÉTODO DE PAGAMENTO ESCOLHIDO
function criarResumo() {
  const el = document.createElement('div');
  el.className = 'confirmacao-resumo';

  const itens = estado.carrinho.map(item => `
    <div class="confirmacao-resumo__item">
      <span class="confirmacao-resumo__nome">
        ${item.quantidade}× ${item.produto.nome}
      </span>
      <span class="confirmacao-resumo__preco">
        ${formatPreco(item.produto.preco * item.quantidade)}
      </span>
    </div>
  `).join('');

  const total = totalCarrinho();
  const metodo = estado.metodoPagamento === 'pix' ? 'PIX' : 'Maquininha';

  el.innerHTML = `
    <div class="confirmacao-resumo__lista">
      ${itens}
    </div>
    <div class="confirmacao-resumo__total">
      <span>Total pago</span>
      <span>${formatPreco(total)}</span>
    </div>
    <div class="confirmacao-resumo__metodo">
      Pagamento via ${metodo}
    </div>
  `;

  return el;
}

// ========== AVISO ==========

// ---------- CRIAR AVISO DE RETIRADA ----------
// RECEBE: nada
// RETORNA: ELEMENTO DE STATUS ORIENTANDO A RETIRADA NA LANCHONETE,
// COM VERDE MAIS VIBRANTE QUE O AVISO PADRÃO DO CARRINHO
function criarAviso() {
  const el = document.createElement('div');
  el.className = 'aviso confirmacao-aviso';
  el.setAttribute('role', 'status');

  el.innerHTML = `
    <span class="aviso__icon" aria-hidden="true">✓</span>
    <p class="aviso__text">
      Apresente o número do pedido na lanchonete e retire seu produto.
      Obrigado pela preferência!
    </p>
  `;

  el.style.borderColor = 'var(--color-green)';
  el.style.background = 'var(--color-green-dark)';

  return el;
}

// ========== BOTÃO ==========

// ---------- CRIAR BOTÃO DE NOVO PEDIDO ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM O BOTÃO QUE ZERA CARRINHO E NÚMERO DO PEDIDO E
// DEVOLVE O USUÁRIO AO CATÁLOGO
function criarBotao() {
  const wrap = document.createElement('div');
  wrap.className = 'confirmacao-botoes';

  const btn = document.createElement('button');
  btn.className = 'btn-secondary';
  btn.textContent = 'Fazer novo pedido';

  btn.addEventListener('click', () => {
    limparCarrinho();
    estado.numeroPedido = null;

    // RE-RENDERIZA O DESTINO ANTES DE EXIBIR, SENÃO A VIEW ENTRA VAZIA
    renderCatalogo();
    renderCarrinho(); // REFLETE O CARRINHO ZERADO NA PRÓXIMA VISITA
    navegarPara('catalogo');
  });

  wrap.appendChild(btn);
  return wrap;
}
