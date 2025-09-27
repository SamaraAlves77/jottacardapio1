// cardapio.js

// =======================================================
// VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM (Globais)
// =======================================================
// Estas variáveis são globais e acessíveis pelos outros scripts
let carrinho = [];
let adicionaisGlobais = [];
let itemEmCustomizacao = null;
const CATEGORIA_CUSTOMIZAVEL = 'Hambúrgueres Artesanais'; 

// Variáveis de Referência do DOM (Serão ligadas em rebindElements)
let carrinhoModal, fecharModalBtn, carrinhoBtn, contadorCarrinho, fabCarrinho, fabContadorCarrinho, carrinhoItensContainer, carrinhoTotalSpan, notificacao, btnFinalizar, navLinks, hamburgerBtn, customizacaoModal, fecharCustomizacaoBtn, btnAdicionarCustomizado, listaAdicionaisContainer;

// Variáveis para Geolocalização
let btnAnexarLocalizacao;
let localizacaoStatus;
let coordenadasEnviadas = ''; 

// =======================================================
// FUNÇÕES DE CARREGAMENTO DINÂMICO DE HTML (Fetch)
// =======================================================

async function loadHTML(url, elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Contêiner de destino '${elementId}' não encontrado.`);
        return false;
    }
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (url !== 'conteudo_cardapio.html') { 
                element.innerHTML = `<h3 style="color: red; text-align: center;">ERRO ${response.status}: Arquivo '${url}' não encontrado.</h3>`;
            }
            throw new Error(`Erro ao carregar o arquivo HTML: ${url}. Status: ${response.status}`);
        }
        
        const html = await response.text();
        element.innerHTML = html;
        return true; 
    } catch (error) {
        console.error(`Falha CRÍTICA ao carregar ${url}:`, error);
        return false; 
    }
}

function rebindElements() {
    // Liga as variáveis globais aos elementos que acabaram de ser injetados no DOM
    carrinhoModal = document.getElementById('carrinho-modal');
    fecharModalBtn = carrinhoModal ? carrinhoModal.querySelector('.fechar-modal') : null;
    carrinhoBtn = document.getElementById('carrinho-btn');
    contadorCarrinho = document.getElementById('contador-carrinho');
    fabCarrinho = document.getElementById('fab-carrinho');
    fabContadorCarrinho = document.getElementById('fab-contador-carrinho');

    carrinhoItensContainer = document.getElementById('carrinho-itens');
    carrinhoTotalSpan = document.getElementById('carrinho-total');
    notificacao = document.getElementById('notificacao');
    btnFinalizar = document.getElementById('btn-finalizar-pedido');
    navLinks = document.querySelector('.nav-links');
    hamburgerBtn = document.getElementById('hamburger-menu-btn');
    
    customizacaoModal = document.getElementById('customizacao-modal');
    fecharCustomizacaoBtn = customizacaoModal ? customizacaoModal.querySelector('.fechar-customizacao') : null;
    btnAdicionarCustomizado = document.getElementById('btn-adicionar-customizado');
    listaAdicionaisContainer = document.getElementById('adicionais-opcoes-lista');
    
    // Referências dos elementos de Localização (injetados em modal_carrinho.html)
    btnAnexarLocalizacao = document.getElementById('btn-anexar-localizacao'); 
    localizacaoStatus = document.getElementById('localizacao-status');
}

// =======================================================
// FUNÇÕES DE CRIAÇÃO DE CARDS
// =======================================================

function criarItemCardapio(item, categoriaNome) {
    const divItem = document.createElement('div');
    divItem.className = 'item-card';

    const img = document.createElement('img');
    img.src = `imagem_cardapio/${item.imagem}`; 
    img.alt = item.nome;
    divItem.appendChild(img);

    const h3 = document.createElement('h3');
    h3.textContent = item.nome;
    divItem.appendChild(h3);

    if (item.descricao) {
        const pDescricao = document.createElement('p');
        pDescricao.textContent = item.descricao;
        divItem.appendChild(pDescricao);
    }

    const pPreco = document.createElement('p');
    pPreco.className = 'price';
    pPreco.textContent = `R$ ${item.preco.toFixed(2).replace('.', ',')}`;
    divItem.appendChild(pPreco);

    const btnAdicionar = document.createElement('button');
    btnAdicionar.className = 'btn-add';
    
    // Lógica para adicionar ao carrinho / customizar (usa funções de modal_carrinho.js)
    if (categoriaNome === CATEGORIA_CUSTOMIZAVEL) {
        btnAdicionar.textContent = 'Customizar e Adicionar';
        btnAdicionar.addEventListener('click', () => {
            // Chama a função definida em modal_carrinho.js
            abrirModalCustomizacao(item); 
        });
    } else {
        btnAdicionar.textContent = 'Adicionar';
        btnAdicionar.addEventListener('click', () => {
            // Chama a função definida em modal_carrinho.js
            adicionarAoCarrinho(item); 
        });
    }

    divItem.appendChild(btnAdicionar);
    return divItem;
}

function criarSecaoCardapio(titulo, idContainer, itens) {
    const container = document.getElementById(idContainer); 
    if (!container) {
        console.error(`Contêiner não encontrado para a categoria: ${titulo} (ID: ${idContainer})`);
        return;
    }

    itens.forEach(item => {
        const itemElemento = criarItemCardapio(item, titulo); 
        container.appendChild(itemElemento);
    });
}

async function carregarCardapio() {
    try {
        const response = await fetch('./cardapio.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}. Verifique se o cardapio.json está na raiz.`);
        }
        
        const cardapioData = await response.json(); 

        const adicionaisCategoria = cardapioData.find(c => c.id === 'adicionais-extras');
        
        if (adicionaisCategoria) {
            adicionaisGlobais = adicionaisCategoria.itens || []; 
        }

        // Popula as seções do cardápio
        cardapioData.forEach(categoriaObj => {
            if (categoriaObj.id !== 'adicionais-extras') {
                const idContainerGrid = categoriaObj.id + '-grid'; 
                criarSecaoCardapio(categoriaObj.nome, idContainerGrid, categoriaObj.itens);
            }
        });
    } catch (error) {
        console.error('Erro CRÍTICO ao carregar o cardápio. Verifique o JSON:', error);
        const main = document.querySelector('#main-content-container');
        if (main) {
            main.innerHTML = `<h1 style="text-align:center; color: var(--primary-color);">
                ❌ Erro ao carregar o cardápio. Verifique se o arquivo cardapio.json existe e está formatado corretamente.
            </h1>`;
        }
    }
}
