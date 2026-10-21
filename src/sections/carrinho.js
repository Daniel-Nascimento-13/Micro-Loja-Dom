// ============================================
// CARRINHO.JS — SEÇÃO DE CARRINHO DE COMPRAS
// ============================================

// ---------- DEPENDÊNCIAS ----------
// → IMPORTA DE: data/produtos.js, main.js, sections/catalogo.js,
//               sections/pagamento.js
// → EXPORTA PARA: main.js, sections/pagamento.js, sections/confirmacao.js

// ========== IMPORTS ==========

import { formatPreco } from '../data/produtos.js';
import {
  estado,
  adicionarAoCarrinho,
  removerDoCarrinho,
  totalCarrinho,
  qtdItensCarrinho,
  navegarPara,
} from '../main.js';
import { renderCatalogo } from './catalogo.js';
import { renderPagamento } from './pagamento.js';

// ========== RENDER PRINCIPAL ==========

// ---------- RENDER CARRINHO ----------
// RECEBE: nada
// RETORNA: nada. RECONSTRÓI #carrinho-root A PARTIR DE estado.carrinho.
//
// FLUXO DE RE-RENDER: NÃO HÁ ATUALIZAÇÃO PARCIAL DE ITENS. TODA MUDANÇA DE
// QUANTIDADE PASSA POR adicionarAoCarrinho / removerDoCarrinho EM main.js,
// QUE ALTERAM O ESTADO E CHAMAM ESTA FUNÇÃO DE VOLTA. AQUI O innerHTML É
// ZERADO E A ÁRVORE INTEIRA (HEADER, AVISO, LISTA, RODAPÉ) É RECRIADA, ENTÃO
// OS LISTENERS ANTIGOS SOMEM JUNTO COM OS ELEMENTOS E OS NOVOS NASCEM
// LIGADOS AOS PRODUTOS ATUAIS. COM O CARRINHO VAZIO O RENDER PARA NO ESTADO
// VAZIO E NÃO MONTA LISTA NEM RODAPÉ.
export function renderCarrinho() {
  const root = document.getElementById('carrinho-root');
  if (!root) return;

  root.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  container.appendChild(criarHeader());

  if (estado.carrinho.length === 0) {
    container.appendChild(criarVazio());
    root.appendChild(container);
    return;
  }

  container.appendChild(criarAviso());

  const lista = document.createElement('div');
  lista.className = 'carrinho-lista';
  estado.carrinho.forEach(item => lista.appendChild(criarItem(item)));
  container.appendChild(lista);

  container.appendChild(criarRodape());
  root.appendChild(container);
}

// ========== HEADER ==========

// ---------- CRIAR HEADER ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM BOTÃO DE VOLTAR, TÍTULO E CONTAGEM DE ITENS
function criarHeader() {
  const header = document.createElement('div');
  header.className = 'carrinho-header';

  const qtd = qtdItensCarrinho();

  header.innerHTML = `
    <div class="carrinho-header__left">
      <button class="btn-voltar" id="btn-voltar-catalogo" aria-label="Voltar ao catálogo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      <h1 class="carrinho-titulo">Carrinho</h1>
    </div>
    <span class="carrinho-qtd" aria-live="polite">
      ${qtd} ${qtd === 1 ? 'item' : 'itens'}
    </span>
  `;

  header.querySelector('#btn-voltar-catalogo')
    .addEventListener('click', voltarAoCatalogo);

  return header;
}

// ========== AVISO ==========

// ---------- CRIAR AVISO DE ESTOQUE ----------
// RECEBE: nada
// RETORNA: ELEMENTO DE ALERTA SOBRE A DISPONIBILIDADE DO PRODUTO
function criarAviso() {
  const aviso = document.createElement('div');
  aviso.className = 'aviso';
  aviso.setAttribute('role', 'alert');
  aviso.innerHTML = `
    <span class="aviso__icon" aria-hidden="true">⚠</span>
    <p class="aviso__text">
      Antes de finalizar o pagamento, certifique-se de que o produto escolhido
      esteja disponível. O estoque é reabastecido uma vez por dia. Obrigado!
    </p>
  `;
  return aviso;
}

// ========== ITEM ==========

// ---------- CRIAR ITEM DO CARRINHO ----------
// RECEBE: item ({ produto, quantidade })
// RETORNA: ELEMENTO COM IMAGEM (OU PLACEHOLDER), NOME, PREÇO UNITÁRIO,
// CONTROLES DE QUANTIDADE E SUBTOTAL. OS BOTÕES − E + DISPARAM O
// RE-RENDER COMPLETO DESCRITO EM renderCarrinho.
function criarItem(item) {
  const { produto, quantidade } = item;

  const el = document.createElement('div');
  el.className = 'carrinho-item';
  el.dataset.produtoId = produto.id;

  // ---------- IMAGEM OU PLACEHOLDER ----------
  const imgHTML = produto.img
    ? `<img
        class="carrinho-item__img"
        src="${produto.img}"
        alt="${produto.nome}"
        loading="lazy"
        width="72"
        height="72"
      />`
    : `<div class="carrinho-item__img-placeholder" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>`;

  el.innerHTML = `
    ${imgHTML}
    <div class="carrinho-item__info">
      <div class="carrinho-item__nome">${produto.nome}</div>
      <div class="carrinho-item__preco-unit">${formatPreco(produto.preco)} cada</div>
    </div>
    <div class="carrinho-item__controles">
      <button class="qty-btn qty-btn--menos" aria-label="Remover um ${produto.nome}">−</button>
      <span class="qty-num" aria-live="polite">${quantidade}</span>
      <button class="qty-btn qty-btn--mais" aria-label="Adicionar mais ${produto.nome}">+</button>
    </div>
    <div class="carrinho-item__subtotal">
      ${formatPreco(produto.preco * quantidade)}
    </div>
  `;

  // ---------- CONTROLES DE QUANTIDADE ----------
  el.querySelector('.qty-btn--menos')
    .addEventListener('click', () => removerDoCarrinho(produto.id));

  el.querySelector('.qty-btn--mais')
    .addEventListener('click', () => adicionarAoCarrinho(produto));

  return el;
}

// ========== VAZIO ==========

// ---------- CRIAR ESTADO VAZIO ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM ÍCONE, MENSAGEM E ATALHO DE VOLTA AO CATÁLOGO
function criarVazio() {
  const vazio = document.createElement('div');
  vazio.className = 'carrinho-vazio';
  vazio.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.5" opacity="0.2" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    <p class="carrinho-vazio__texto">Seu carrinho está vazio</p>
    <button class="btn-primary" id="btn-ir-catalogo" style="max-width:280px; margin-top: 8px;">
      Ver produtos
    </button>
  `;

  vazio.querySelector('#btn-ir-catalogo')
    .addEventListener('click', voltarAoCatalogo);

  return vazio;
}

// ========== RODAPÉ ==========

// ---------- CRIAR RODAPÉ ----------
// RECEBE: nada
// RETORNA: ELEMENTO COM O TOTAL E O BOTÃO QUE RENDERIZA E ABRE O PAGAMENTO
function criarRodape() {
  const rodape = document.createElement('div');
  rodape.className = 'carrinho-rodape';

  const total = totalCarrinho();

  rodape.innerHTML = `
    <div class="carrinho-total">
      <span class="carrinho-total__label">Total</span>
      <span class="carrinho-total__valor">${formatPreco(total)}</span>
    </div>
    <button class="btn-primary" id="btn-finalizar">
      Finalizar pedido
    </button>
  `;

  rodape.querySelector('#btn-finalizar')
    .addEventListener('click', () => {
      renderPagamento();
      navegarPara('pagamento');
    });

  return rodape;
}

// ========== NAVEGAÇÃO ==========

// ---------- VOLTAR AO CATÁLOGO ----------
// RECEBE: nada
// RETORNA: nada. RE-RENDERIZA O CATÁLOGO ANTES DE EXIBIR A VIEW, SENÃO ELA
// ENTRARIA COM O CONTEÚDO DESATUALIZADO.
function voltarAoCatalogo() {
  renderCatalogo();
  navegarPara('catalogo');
}
