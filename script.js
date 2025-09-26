// =======================================================
// VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM
// (Mantidas como window. para serem acessíveis globalmente após a injeção)
// =======================================================
let carrinho = [];
let adicionaisGlobais = [];
let itemEmCustomizacao = null;
const CATEGORIA_CUSTOMIZAVEL = 'Hambúrgueres Artesanais';

// Variáveis globais para os elementos (serão preenchidas em rebindElements)
let carrinhoModal, fecharModalBtn, carrinhoBtn, mobileCarrinhoBtn, contadorCarrinho, mobileContadorCarrinho, carrinhoItensContainer, carrinhoTotalSpan, notificacao, btnFinalizar, navLinks, hamburgerBtn, mobileHamburgerBtn, customizacaoModal, fecharCustomizacaoBtn, btnAdicionarCustomizado, listaAdicionaisContainer;


// =======================================================
// FUNÇÕES DE CARREGAMENTO DINÂMICO DE HTML
// =======================================================

async function loadHTML(url, elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Contêiner de destino '${elementId}' não encontrado em cardapio_base.html.`);
        return false;
    }
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            // Se o arquivo HTML não for encontrado, exibe erro claro
            element.innerHTML = `<h3 style="color: red; text-align: center;">ERRO 404: Arquivo '${url}' não encontrado. Verifique o nome e o caminho.</h3>`;
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

// =======================================================
// FUNÇÕES DE MANIPULAÇÃO DO DOM (CARRINHO E CUSTOMIZAÇÃO)
// (Mantidas iguais, mas dependem das variáveis globais re-ligadas)
// =======================================================

function rebindElements() {
    // Liga as variáveis globais aos elementos que acabaram de ser injetados
    carrinhoModal = document.getElementById('carrinho-modal');
    fecharModalBtn = carrinhoModal ? carrinhoModal.querySelector('.fechar-modal') : null;
    carrinhoBtn = document.getElementById('carrinho-btn');
    mobileCarrinhoBtn = document.getElementById('mobile-carrinho-btn');
    contadorCarrinho = document.getElementById('contador-carrinho');
    mobileContadorCarrinho = document.getElementById('mobile-contador-carrinho');
    carrinhoItensContainer = document.getElementById('carrinho-itens');
    carrinhoTotalSpan = document.getElementById('carrinho-total');
    notificacao = document.getElementById('notificacao');
    btnFinalizar = document.getElementById('btn-finalizar-pedido');
    navLinks = document.querySelector('.nav-links');
    hamburgerBtn = document.getElementById('hamburger-menu-btn');
    mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
    customizacaoModal = document.getElementById('customizacao-modal');
    fecharCustomizacaoBtn = customizacaoModal ? customizacaoModal.querySelector('.fechar-customizacao') : null;
    btnAdicionarCustomizado = document.getElementById('btn-adicionar-customizado');
    listaAdicionaisContainer = document.getElementById('adicionais-opcoes-lista');
}

// ... (Resto das funções: adicionarAoCarrinho, removerDoCarrinho, atualizarModalCarrinho, 
//      abrirModalCustomizacao, renderizarOpcoesAdicionais, gerenciarAdicional, 
//      atualizarResumoCustomizacao, criarItemCardapio, criarSecaoCardapio, carregarCardapio) 
//      - MANTENHA-AS EXATAMENTE COMO NO BACKUP ANTERIOR.

// Apenas a função carregarCardapio() está aqui para garantir o tratamento de erro.

async function carregarCardapio() {
    try {
        const response = await fetch('./cardapio.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}. Verifique se o cardapio.json está na raiz.`);
        }
        
        const cardapioData = await response.json(); 
        
        // ... (resto da lógica de processamento do JSON) ...
        const adicionaisCategoria = cardapioData.find(c => c.id === 'adicionais-extras');
        
        if (adicionaisCategoria) {
            adicionaisGlobais = adicionaisCategoria.itens || []; 
        }

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
                ❌ Erro ao carregar o cardápio. Verifique o formato do seu cardapio.json.
            </h1>`;
        }
    }
}


function setupEventListeners() {
    // Configuração dos Event Listeners (Use as variáveis re-ligadas)
    
    // ABRIR MODAL DO CARRINHO (Header - Desktop)
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            carrinhoModal.classList.add('ativo');
            atualizarModalCarrinho();
        });
    }
    
    // ABRIR MODAL DO CARRINHO (Barra Fixa - Mobile)
    if (mobileCarrinhoBtn && carrinhoModal) {
        mobileCarrinhoBtn.addEventListener('click', () => {
            carrinhoModal.classList.add('ativo');
            atualizarModalCarrinho();
        });
    }

    // FECHAR MODAIS PELO 'X' E CLICANDO FORA
    if (fecharModalBtn && carrinhoModal) {
        fecharModalBtn.addEventListener('click', () => {
            carrinhoModal.classList.remove('ativo');
        });
    }
    if (fecharCustomizacaoBtn && customizacaoModal) {
        fecharCustomizacaoBtn.addEventListener('click', () => {
            customizacaoModal.classList.remove('ativo');
        });
    }
    window.addEventListener('click', (event) => {
        if (event.target === carrinhoModal) {
            event.target.classList.remove('ativo');
        } else if (event.target === customizacaoModal) {
            event.target.classList.remove('ativo');
        }
    });

    // ADICIONAR ITEM CUSTOMIZADO AO CARRINHO (Lógica completa omitida aqui por brevidade, mas deve ser a mesma da versão anterior)
    if (btnAdicionarCustomizado) {
        btnAdicionarCustomizado.addEventListener('click', () => {
            // ... (Lógica completa da customização)
        });
    }
    
    // Lógica do Finalizar Pedido (Lógica completa omitida aqui por brevidade, mas deve ser a mesma da versão anterior)
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            // ... (Lógica completa de finalização)
        });
    }

    // Lógica do Hamburger Menu
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    if (mobileHamburgerBtn && navLinks) {
        mobileHamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Fecha o menu mobile ao clicar em um link
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }
}


// =======================================================
// INICIALIZAÇÃO
// =======================================================

document.addEventListener('DOMContentLoaded', async () => {
    
    const navbarOK = await loadHTML('navbar.html', 'navbar-container');
    const conteudoOK = await loadHTML('conteudo_cardapio.html', 'main-content-container');
    const modalOK = await loadHTML('modal_carrinho.html', 'modal-container');
    
    // Só prossegue se todos os arquivos HTML necessários foram carregados com sucesso
    if (navbarOK && conteudoOK && modalOK) {
        
        // 1. Re-liga os elementos injetados às variáveis JS
        rebindElements(); 
        
        // 2. Carrega os dados do JSON e popula o cardápio
        await carregarCardapio(); 
        
        // 3. Configura os Listeners
        setupEventListeners();
        
    } else {
        console.error("Não foi possível carregar todas as partes do HTML. O cardápio não será exibido.");
    }
});
