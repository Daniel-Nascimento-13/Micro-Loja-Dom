// ============================================
// PRODUTOS.JS — CATÁLOGO DE PRODUTOS DA LOJA
// ============================================

// ---------- DEPENDÊNCIAS ----------
// → EXPORTA PARA: catalogo.js, carrinho.js, confirmacao.js

// ========== CATEGORIAS ==========

export const CATEGORIAS = [
  {
    id: 'bebidas',
    titulo: 'Bebidas',
    subtitulo: 'Hidratação',
    produtos: [
      { id: 'agua-sem-gas',      nome: 'Água s/gás',             preco: 5.00,  img: '/images/agua s:gas.webp' },
      { id: 'agua-com-gas',      nome: 'Água c/gás',             preco: 5.00,  img: '/images/agua c:gas.webp' },
      { id: 'coca-lata',         nome: 'Coca-Cola lata',         preco: 5.00,  img: '/images/coca-cola lata.webp' },
      { id: 'coca-600',          nome: 'Coca-Cola 600ml',        preco: 8.00,  img: '/images/coca-cola 600ml.webp' },
      { id: 'coca-zero-lata',    nome: 'Coca-Cola Zero lata',    preco: 5.00,  img: '/images/coca-cola zero lata.webp' },
      { id: 'coca-zero-600',     nome: 'Coca-Cola Zero 600ml',   preco: 8.00,  img: '/images/coca-cola zero 600ml.webp' },
      { id: 'gatorade',          nome: 'Gatorade',               preco: 10.00, img: '/images/gatorade.webp' },
    ],
  },
  {
    id: 'cervejas',
    titulo: 'Cervejas',
    subtitulo: 'Alcoólicas',
    produtos: [
      { id: 'heineken-long',  nome: 'Heineken Long Neck', preco: 10.00, img: '/images/heineken long neck.webp' },
      { id: 'heineken-zero',  nome: 'Heineken Zero',      preco: 10.00, img: '/images/heineken zero long neck.webp' },
      { id: 'corona',         nome: 'Corona',             preco: 10.00, img: '/images/corona long neck.webp' },
      { id: 'corona-zero',    nome: 'Corona Zero',        preco: 10.00, img: '/images/corona zero long neck.webp' },
    ],
  },
  {
    id: 'doces',
    titulo: 'Doces',
    subtitulo: 'Snacks',
    produtos: [
      { id: 'bis',      nome: 'Bis',      preco: 7.00,  img: '/images/bis.webp' },
      { id: 'kitkat',   nome: 'Kit Kat',  preco: 7.00,  img: '/images/kitkat.webp' },
      { id: 'fivestar', nome: 'Five Star',preco: 7.00,  img: '/images/5star.webp' },
      { id: 'cookie',   nome: 'Cookie',   preco: 12.00, img: null },
    ],
  },
  {
    id: 'salgadinhos',
    titulo: 'Salgadinhos',
    subtitulo: 'Snacks',
    produtos: [
      { id: 'cheetos', nome: 'Cheetos', preco: 15.00, img: '/images/cheetos.webp' },
      { id: 'doritos', nome: 'Doritos', preco: 20.00, img: '/images/doritos.webp' },
      { id: 'ruffles', nome: 'Ruffles', preco: 20.00, img: '/images/ruffles.webp' },
    ],
  },
];

// ========== HELPERS ==========

// ---------- FORMATAR PREÇO ----------
export function formatPreco(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// ---------- BUSCAR PRODUTO POR ID ----------
export function getProdutoPorId(id) {
  for (const cat of CATEGORIAS) {
    const produto = cat.produtos.find(p => p.id === id);
    if (produto) return produto;
  }
  return null;
}