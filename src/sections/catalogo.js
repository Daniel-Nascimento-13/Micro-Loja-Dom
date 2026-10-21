// ============================================
// CATALOGO.JS — SEÇÃO DE CATÁLOGO DE PRODUTOS
// ============================================

// ---------- DEPENDÊNCIAS ----------
// → IMPORTA DE: data/produtos.js, main.js
// → EXPORTA PARA: main.js, sections/carrinho.js, sections/confirmacao.js

// ========== IMPORTS ==========

import { CATEGORIAS, formatPreco } from '../data/produtos.js';
import { adicionarAoCarrinho, estado } from '../main.js';

// ========== ESTADO DOS CARROSSÉIS ==========

// UM REGISTRO POR CATEGORIA: { indice, visiveis }.
// indice   = PRIMEIRO CARD VISÍVEL NA JANELA DO CARROSSEL
// visiveis = QUANTOS CARDS CABEM NA LARGURA ATUAL DA TELA
const estadoCarrosseis = {};

// ---------- ABORTCONTROLLER DOS LISTENERS ----------
// CADA renderCatalogo REGISTRA UM LISTENER DE resize POR CARROSSEL, AMARRADO
// AOS BOTÕES DAQUELE RENDER. COMO O RENDER LIMPA O innerHTML DA RAIZ, OS
// LISTENERS ANTIGOS CONTINUARIAM VIVOS EM window APONTANDO PARA BOTÕES JÁ
// REMOVIDOS DO DOM — EMPILHANDO UM VAZAMENTO A CADA RE-RENDER.
// O CONTROLLER É ABORTADO NO INÍCIO DE CADA RENDER (DESCARTANDO TODOS OS
// LISTENERS DO CICLO ANTERIOR DE UMA VEZ) E SUBSTITUÍDO POR UM NOVO, CUJO
// signal É PASSADO A CADA addEventListener CRIADO NESTE CICLO.
let controleListeners = null;

// ========== RENDER PRINCIPAL ==========

// ---------- RENDER CATÁLOGO ----------
// RECEBE: nada
// RETORNA: nada. MONTA UMA SEÇÃO COM CARROSSEL PARA CADA CATEGORIA DENTRO
// DE #catalogo-root, SUBSTITUINDO O CONTEÚDO ANTERIOR.
export function renderCatalogo() {
  const root = document.getElementById('catalogo-root');
  if (!root) return;

  controleListeners?.abort();
  controleListeners = new AbortController();

  root.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  CATEGORIAS.forEach(categoria => {
    const secao = criarSecao(categoria);
    container.appendChild(secao);
  });

  root.appendChild(container);
}

// ========== SEÇÃO ==========

// ---------- CRIAR SEÇÃO DE CATEGORIA ----------
// RECEBE: categoria (OBJETO DE CATEGORIAS)
// RETORNA: ELEMENTO COM TÍTULO + CARROSSEL DA CATEGORIA
function criarSecao(categoria) {
  const secao = document.createElement('div');
  secao.className = 'catalogo-secao';
  secao.dataset.categoriaId = categoria.id;

  // ---------- TÍTULO ----------
  const titulo = document.createElement('div');
  titulo.className = 'section-title';
  titulo.innerHTML = `
    <div class="section-title__bar" aria-hidden="true"></div>
    <div>
      <div class="section-title__text">${categoria.titulo}</div>
      <div class="section-title__sub">${categoria.subtitulo}</div>
    </div>
  `;

  // ---------- CARROSSEL ----------
  const carrossel = criarCarrossel(categoria);

  secao.appendChild(titulo);
  secao.appendChild(carrossel);

  return secao;
}

// ========== CARROSSEL ==========

// ---------- CRIAR CARROSSEL ----------
// RECEBE: categoria (OBJETO DE CATEGORIAS)
// RETORNA: ELEMENTO COM BOTÃO ANTERIOR, TRACK DE CARDS E BOTÃO PRÓXIMO,
// JÁ COM OS EVENTOS DE NAVEGAÇÃO E RESIZE LIGADOS.
function criarCarrossel(categoria) {
  const { id, produtos } = categoria;

  // ---------- ESTADO INICIAL ----------
  estadoCarrosseis[id] = { indice: 0, visiveis: calcularVisiveis() };

  const wrap = document.createElement('div');
  wrap.className = 'carousel-wrap';

  // ---------- BOTÃO ANTERIOR ----------
  const btnEsq = document.createElement('button');
  btnEsq.className = 'carousel-btn carousel-btn--prev';
  btnEsq.setAttribute('aria-label', `Anterior em ${categoria.titulo}`);
  btnEsq.innerHTML = '&#8249;';

  // ---------- TRACK DE CARDS ----------
  const trackWrap = document.createElement('div');
  trackWrap.className = 'carousel-track-wrap';

  const track = document.createElement('div');
  track.className = 'carousel-track';
  track.id = `track-${id}`;

  produtos.forEach(produto => {
    const card = criarCard(produto);
    track.appendChild(card);
  });

  trackWrap.appendChild(track);

  // ---------- BOTÃO PRÓXIMO ----------
  const btnDir = document.createElement('button');
  btnDir.className = 'carousel-btn carousel-btn--next';
  btnDir.setAttribute('aria-label', `Próximo em ${categoria.titulo}`);
  btnDir.innerHTML = '&#8250;';

  // ---------- EVENTOS DE NAVEGAÇÃO ----------
  btnEsq.addEventListener('click', () => moverCarrossel(id, -1, btnEsq, btnDir));
  btnDir.addEventListener('click', () => moverCarrossel(id, 1, btnEsq, btnDir));

  atualizarBotoes(id, btnEsq, btnDir, produtos.length);

  wrap.appendChild(btnEsq);
  wrap.appendChild(trackWrap);
  wrap.appendChild(btnDir);

  // ---------- RECALCULAR AO REDIMENSIONAR ----------
  // signal DO controleListeners: ESTE LISTENER MORRE JUNTO COM O PRÓXIMO RENDER.
  window.addEventListener('resize', () => {
    estadoCarrosseis[id].visiveis = calcularVisiveis();
    estadoCarrosseis[id].indice = 0;
    aplicarTranslate(id);
    atualizarBotoes(id, btnEsq, btnDir, produtos.length);
  }, { signal: controleListeners.signal });

  return wrap;
}

// ========== CARD ==========

// ---------- CRIAR CARD DE PRODUTO ----------
// RECEBE: produto (OBJETO DO CATÁLOGO)
// RETORNA: ELEMENTO DO CARD COM IMAGEM (OU PLACEHOLDER), NOME, PREÇO E
// BOTÃO QUE ADICIONA O PRODUTO AO CARRINHO.
function criarCard(produto) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', produto.nome);

  // ---------- IMAGEM OU PLACEHOLDER ----------
  const imgHTML = produto.img
    ? `<img
        class="product-card__img"
        src="${produto.img}"
        alt="${produto.nome}"
        loading="lazy"
        width="220"
        height="220"
      />`
    : `<div class="product-card__img-placeholder" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>`;

  card.innerHTML = `
    ${imgHTML}
    <div class="product-card__name">${produto.nome}</div>
    <div class="product-card__price">${formatPreco(produto.preco)}</div>
    <button
      class="product-card__btn"
      aria-label="Adicionar ${produto.nome} ao carrinho"
    >
      + Adicionar
    </button>
    <span class="product-card__qty" id="qty-${produto.id}" aria-live="polite"></span>
  `;

  // ---------- EVENTO DE ADICIONAR ----------
  const btn = card.querySelector('.product-card__btn');
  btn.addEventListener('click', () => {
    adicionarAoCarrinho(produto);
    feedbackBotao(btn, produto.id);
  });

  return card;
}

// ========== FEEDBACK ==========

// ---------- FEEDBACK VISUAL DO BOTÃO ----------
// RECEBE: btn (ELEMENTO DO BOTÃO CLICADO), produtoId (STRING)
// RETORNA: nada. ATUALIZA O BADGE DE QUANTIDADE DO CARD E TROCA RÓTULO E
// ESTILO DO BOTÃO POR 1,2s, DEPOIS RESTAURANDO O ORIGINAL.
function feedbackBotao(btn, produtoId) {
  const item = estado.carrinho.find(i => i.produto.id === produtoId);
  const qtd = item ? item.quantidade : 0;
  const badge = document.getElementById(`qty-${produtoId}`);

  if (badge) {
    badge.textContent = qtd > 0 ? `${qtd} no carrinho` : '';
    badge.classList.toggle('visible', qtd > 0);
  }

  btn.textContent = '✓ Adicionado';
  btn.classList.add('added');

  setTimeout(() => {
    btn.textContent = '+ Adicionar';
    btn.classList.remove('added');
  }, 1200);
}

// ========== MOVIMENTO ==========

// ---------- MOVER CARROSSEL ----------
// RECEBE: id (STRING DA CATEGORIA), direcao (-1 ANTERIOR | 1 PRÓXIMO),
//         btnEsq e btnDir (BOTÕES DAQUELE CARROSSEL)
// RETORNA: nada. IGNORA O CLIQUE QUANDO O NOVO ÍNDICE SAIRIA DOS LIMITES.
function moverCarrossel(id, direcao, btnEsq, btnDir) {
  const estado = estadoCarrosseis[id];
  const track = document.getElementById(`track-${id}`);
  if (!track) return;

  const total = track.children.length;
  const novoIndice = estado.indice + direcao;

  if (novoIndice < 0 || novoIndice + estado.visiveis > total) return;

  estado.indice = novoIndice;
  aplicarTranslate(id);
  atualizarBotoes(id, btnEsq, btnDir, total);
}

// ---------- APLICAR TRANSLATE ----------
// RECEBE: id (STRING DA CATEGORIA)
// RETORNA: nada. DESLOCA O TRACK EM indice × (LARGURA DO CARD + GAP).
function aplicarTranslate(id) {
  const track = document.getElementById(`track-${id}`);
  if (!track) return;

  const cardWidth = track.children[0]?.offsetWidth || 220;
  const gap = 20;
  const offset = estadoCarrosseis[id].indice * (cardWidth + gap);

  track.style.transform = `translateX(-${offset}px)`;
}

// ========== UTILITÁRIOS ==========

// ---------- ATUALIZAR BOTÕES ----------
// RECEBE: id (STRING DA CATEGORIA), btnEsq, btnDir, total (NUMBER DE CARDS)
// RETORNA: nada. DESABILITA CADA BOTÃO AO ATINGIR O RESPECTIVO EXTREMO.
function atualizarBotoes(id, btnEsq, btnDir, total) {
  const { indice, visiveis } = estadoCarrosseis[id];
  btnEsq.disabled = indice <= 0;
  btnDir.disabled = indice + visiveis >= total;
}

// ---------- CALCULAR CARDS VISÍVEIS ----------
// RECEBE: nada
// RETORNA: NUMBER DE CARDS QUE CABEM NA LARGURA ATUAL DA JANELA.
function calcularVisiveis() {
  const largura = window.innerWidth;
  if (largura < 600) return 2;
  if (largura < 900) return 3;
  return 3;
}
