// ============================================
// PAGAMENTO.JS — SEÇÃO DE ESCOLHA DE PAGAMENTO
// ============================================

// ---------- DEPENDÊNCIAS ----------
// → IMPORTA DE: data/produtos.js, main.js, sections/confirmacao.js,
//               sections/carrinho.js
// → EXPORTA PARA: main.js, sections/carrinho.js

// ========== IMPORTS ==========

import { formatPreco } from '../data/produtos.js';
import {
  estado,
  totalCarrinho,
  navegarPara,
  gerarNumeroPedido,
} from '../main.js';
import { renderConfirmacao } from './confirmacao.js';
import { renderCarrinho } from './carrinho.js';

// ========== CONSTANTES DE MÉTODOS ==========

// MÉTODOS DE PAGAMENTO OFERECIDOS. O id É O VALOR GRAVADO EM
// estado.metodoPagamento; iconeMod É O SUFIXO DA CLASSE DE COR DO ÍCONE
// (.pagamento-opcao__icone--green | --blue).
const METODOS = [
  {
    id: 'pix',
    label: 'PIX',
    desc: 'Pagamento instantâneo',
    detalhe: 'Aprovação na hora',
    icone: 'PIX',
    iconeMod: 'green',
  },
  {
    id: 'maquininha',
    label: 'Maquininha',
    desc: 'Débito ou crédito',
    detalhe: 'Pague no balcão',
    icone: 'CARD',
    iconeMod: 'blue',
  },
];

// ========== RENDER PRINCIPAL ==========

// ---------- RENDER PAGAMENTO ----------
// RECEBE: nada
// RETORNA: nada. RECONSTRÓI #pagamento-root COM HEADER, TOTAL, OPÇÕES E BOTÕES.
export function renderPagamento() {
  const root = document.getElementById('pagamento-root');
  if (!root) return;

  root.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  container.appendChild(criarHeader());
  container.appendChild(criarTotal());
  container.appendChild(criarOpcoes());
  container.appendChild(criarBotoes());

  root.appendChild(container);
}

// ========== HEADER ==========

// ---------- CRIAR HEADER ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM BOTÃO DE VOLTAR AO CARRINHO E TÍTULO DA SEÇÃO
function criarHeader() {
  const header = document.createElement('div');
  header.className = 'pagamento-header';

  header.innerHTML = `
    <button class="btn-voltar" id="btn-voltar-carrinho" aria-label="Voltar ao carrinho">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
    </button>
    <h1 class="pagamento-titulo">Pagamento</h1>
  `;

  header.querySelector('#btn-voltar-carrinho')
    .addEventListener('click', voltarAoCarrinho);

  return header;
}

// ========== TOTAL ==========

// ---------- CRIAR TOTAL A PAGAR ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM O VALOR TOTAL FORMATADO EM DESTAQUE
function criarTotal() {
  const el = document.createElement('div');
  el.className = 'pagamento-total';

  el.innerHTML = `
    <span class="pagamento-total__label">TOTAL A PAGAR</span>
    <span class="pagamento-total__valor" aria-live="polite">
      ${formatPreco(totalCarrinho())}
    </span>
  `;

  return el;
}

// ========== OPÇÕES ==========

// ---------- CRIAR GRUPO DE OPÇÕES ----------
// RECEBE: nada
// RETORNA: ELEMENTO radiogroup COM UMA OPÇÃO POR MÉTODO DE METODOS
function criarOpcoes() {
  const wrap = document.createElement('div');
  wrap.className = 'pagamento-opcoes';
  wrap.setAttribute('role', 'radiogroup');
  wrap.setAttribute('aria-label', 'Método de pagamento');

  METODOS.forEach(metodo => wrap.appendChild(criarOpcao(metodo, wrap)));

  return wrap;
}

// ---------- CRIAR UMA OPÇÃO ----------
// RECEBE: metodo (ITEM DE METODOS), wrap (O radiogroup QUE A CONTÉM)
// RETORNA: BOTÃO role="radio" JÁ MARCADO CONFORME estado.metodoPagamento
function criarOpcao(metodo, wrap) {
  const ativa = estado.metodoPagamento === metodo.id;

  const btn = document.createElement('button');
  btn.className = `pagamento-opcao${ativa ? ' pagamento-opcao--ativa' : ''}`;
  btn.dataset.metodo = metodo.id;
  btn.setAttribute('role', 'radio');
  btn.setAttribute('aria-checked', String(ativa));

  btn.innerHTML = `
    <span class="pagamento-opcao__icone pagamento-opcao__icone--${metodo.iconeMod}"
      aria-hidden="true">${metodo.icone}</span>
    <span class="pagamento-opcao__info">
      <span class="pagamento-opcao__label">${metodo.label}</span>
      <span class="pagamento-opcao__desc">${metodo.desc}</span>
      <span class="pagamento-opcao__detalhe">${metodo.detalhe}</span>
    </span>
    <span class="pagamento-opcao__radio${ativa ? ' pagamento-opcao__radio--on' : ''}"
      aria-hidden="true">
      <span class="pagamento-opcao__radio-dot"></span>
    </span>
  `;

  btn.addEventListener('click', () => selecionarMetodo(metodo.id, wrap));

  return btn;
}

// ========== SELEÇÃO ==========

// ---------- SELECIONAR MÉTODO ----------
// RECEBE: metodoId (STRING), wrap (O radiogroup COM TODAS AS OPÇÕES)
// RETORNA: nada. GRAVA A ESCOLHA NO ESTADO E ALTERNA APENAS AS CLASSES —
// SEM RE-RENDER, PARA PRESERVAR A TRANSIÇÃO CSS DO RADIO.
function selecionarMetodo(metodoId, wrap) {
  estado.metodoPagamento = metodoId;

  wrap.querySelectorAll('.pagamento-opcao').forEach(opcao => {
    const ativa = opcao.dataset.metodo === metodoId;

    opcao.classList.toggle('pagamento-opcao--ativa', ativa);
    opcao.setAttribute('aria-checked', String(ativa));

    opcao.querySelector('.pagamento-opcao__radio')
      .classList.toggle('pagamento-opcao__radio--on', ativa);
  });
}

// ========== BOTÕES ==========

// ---------- CRIAR BOTÕES DE AÇÃO ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM "GERAR COBRANÇA" (DESABILITADO SE O CARRINHO ESTIVER
// VAZIO) E O BOTÃO SECUNDÁRIO DE VOLTA AO CARRINHO
function criarBotoes() {
  const wrap = document.createElement('div');
  wrap.className = 'pagamento-botoes';

  // ---------- GERAR COBRANÇA ----------
  const btnGerar = document.createElement('button');
  btnGerar.className = 'btn-primary';
  btnGerar.id = 'btn-gerar-cobranca';
  btnGerar.textContent = 'Gerar cobrança';
  btnGerar.disabled = estado.carrinho.length === 0;

  btnGerar.addEventListener('click', () => {
    if (estado.carrinho.length === 0) return;

    gerarNumeroPedido();
    renderConfirmacao();
    navegarPara('confirmacao');
  });

  // ---------- VOLTAR AO CARRINHO ----------
  const btnVoltar = document.createElement('button');
  btnVoltar.className = 'btn-secondary';
  btnVoltar.id = 'btn-voltar-carrinho-secundario';
  btnVoltar.textContent = 'Voltar ao carrinho';
  btnVoltar.addEventListener('click', voltarAoCarrinho);

  wrap.appendChild(btnGerar);
  wrap.appendChild(btnVoltar);

  return wrap;
}

// ========== NAVEGAÇÃO ==========

// ---------- VOLTAR AO CARRINHO ----------
// RECEBE: nada
// RETORNA: nada. RE-RENDERIZA O CARRINHO ANTES DE EXIBIR A VIEW, SENÃO ELA
// ENTRARIA COM O CONTEÚDO DESATUALIZADO.
function voltarAoCarrinho() {
  renderCarrinho();
  navegarPara('carrinho');
}
