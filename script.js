// =======================================================
// VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM
// =======================================================
let carrinho = []; // Array para armazenar os itens do pedido
let adicionaisGlobais = []; // Vai armazenar as opções de adicionais do JSON
let itemEmCustomizacao = null; // Armazena o item que está sendo customizado

// Elementos do Carrinho
const carrinhoModal = document.getElementById('carrinho-modal');
const fecharModalBtn = carrinhoModal ? carrinhoModal.querySelector('.fechar-modal') : null;
const carrinhoBtn = document.getElementById('carrinho-btn');
const contadorCarrinho = document.getElementById('contador-carrinho');
const carrinhoItensContainer = document.getElementById('carrinho-itens');
const carrinhoTotalSpan = document.getElementById('carrinho-total');
const notificacao = document.getElementById('notificacao');
const btnFinalizar = document.getElementById('btn-finalizar-pedido');
const hamburgerBtn = document.getElementById('hamburger-menu-btn');

// Elementos da Customização (NOVOS)
const customizacaoModal = document.getElementById('customizacao-modal');
const fecharCustomizacaoBtn = customizacaoModal ? customizacaoModal.querySelector('.fechar-customizacao') : null;
const btnAdicionarCustomizado = document.getElementById('btn-adicionar-customizado');


// =======================================================
// FUNÇÕES DE MANIPULAÇÃO DO CARRINHO
// =======================================================

/**
 * Adiciona um item ao carrinho, atualiza o contador e exibe a notificação.
 * @param {object} item - O objeto do item a ser adicionado (pode ser customizado ou não).
 */
function adicionarAoCarrinho(item) {
    carrinho.push(item); 
    
    if (contadorCarrinho) {
        contadorCarrinho.textContent = carrinho.length;
    }

    atualizarModalCarrinho();
    
    if (notificacao) {
        notificacao.classList.add('mostrar');
        
        setTimeout(() => {
            notificacao.classList.remove('mostrar');
        }, 3000);
    }
}

/**
 * Remove um item do carrinho pelo seu índice.
 * @param {number} index - O índice do item a ser removido no array do carrinho.
 */
function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    
    if (contadorCarrinho) {
        contadorCarrinho.textContent = carrinho.length;
    }
    atualizarModalCarrinho();
}

/**
 * Atualiza o conteúdo e o total exibidos na modal do carrinho.
 */
function atualizarModalCarrinho() {
    if (!carrinhoItensContainer || !carrinhoTotalSpan) return;

    carrinhoItensContainer.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        
        // Usa nomeExibicao se existir (para itens customizados) ou o nome normal
        const nomeExibicao = item.nomeExibicao || item.nome;
        const precoFormatado = item.preco.toFixed(2).replace('.', ',');

        itemDiv.innerHTML = `
            <span class="carrinho-item-nome">${nomeExibicao}</span>
            <span class="carrinho-item-preco">R$ ${precoFormatado}</span>
            <button class="btn-remover" data-index="${index}">X</button>
        `;
        carrinhoItensContainer.appendChild(itemDiv);
        total += item.preco;
    });

    carrinhoTotalSpan.textContent = total.toFixed(2).replace('.', ',');

    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index'); 
            removerDoCarrinho(index);
        });
    });
}


// =======================================================
// FUNÇÕES DE CUSTOMIZAÇÃO (NOVAS)
// =======================================================
// Categorias que acionam a customização
const categoriasCustomizaveis = ['Hambúrgueres Artesanais', 'Acompanhamentos'];


function abrirModalCustomizacao(item) {
    if (!customizacaoModal) return;

    // Inicializa o objeto de customização com o item base
    itemEmCustomizacao = { 
        ...item,
        adicionais: [], // Adicionais selecionados
        precoFinal: item.preco // Preço inicial é o preço base
    };

    // Atualiza os títulos e preços base na modal
    document.getElementById('item-customizacao-nome').textContent = item.nome;
    document.getElementById('preco-base-customizacao').textContent = item.preco.toFixed(2).replace('.', ',');
    
    // Renderiza e atualiza a modal
    renderizarOpcoesAdicionais();
    customizacaoModal.style.display = 'block';
}

function renderizarOpcoesAdicionais() {
    const lista = document.getElementById('adicionais-opcoes-lista');
    lista.innerHTML = '';
    
    adicionaisGlobais.forEach(adicional => {
        const selecionado = itemEmCustomizacao.adicionais.find(a => a.nome === adicional.nome);
        const quantidade = selecionado ? selecionado.quantidade : 0;
        
        const div = document.createElement('div');
        div.className = 'adicional-item-opcao';
        
        div.innerHTML = `
            <span>${adicional.nome} <small>(R$ ${adicional.preco.toFixed(2).replace('.', ',')})</small></span>
            <div class="adicional-contador">
                <button class="btn-diminuir-adicional" data-nome="${adicional.nome}">-</button>
                <span class="quantidade-adicional">${quantidade}</span>
                <button class="btn-aumentar-adicional" data-nome="${adicional.nome}">+</button>
            </div>
        `;
        lista.appendChild(div);
    });
    
    adicionarListenersContador();
    atualizarResumoCustomizacao();
}

function adicionarListenersContador() {
    // É importante remover os listeners antigos antes de adicionar os novos
    document.querySelectorAll('.btn-aumentar-adicional').forEach(btn => {
        btn.onclick = null; // Limpa para evitar duplicidade
        btn.onclick = () => { gerenciarAdicional(btn.dataset.nome, 1); };
    });
    
    document.querySelectorAll('.btn-diminuir-adicional').forEach(btn => {
        btn.onclick = null; // Limpa para evitar duplicidade
        btn.onclick = () => { gerenciarAdicional(btn.dataset.nome, -1); };
    });
}

function gerenciarAdicional(nomeAdicional, delta) {
    const adicionalData = adicionaisGlobais.find(a => a.nome === nomeAdicional);
    if (!adicionalData) return;

    let adicionalSelecionado = itemEmCustomizacao.adicionais.find(a => a.nome === nomeAdicional);

    if (!adicionalSelecionado) {
        if (delta > 0) {
            itemEmCustomizacao.adicionais.push({
                ...adicionalData,
                quantidade: 1
            });
        }
    } else {
        adicionalSelecionado.quantidade += delta;
        
        if (adicionalSelecionado.quantidade <= 0) {
            itemEmCustomizacao.adicionais = itemEmCustomizacao.adicionais.filter(a => a.nome !== nomeAdicional);
        }
    }
    
    renderizarOpcoesAdicionais(); // Re-renderiza para atualizar a UI
}

function atualizarResumoCustomizacao() {
    let precoAdicionais = 0;
    
    itemEmCustomizacao.adicionais.forEach(ad => {
        precoAdicionais += ad.preco * ad.quantidade;
    });

    const precoBase = itemEmCustomizacao.preco;
    const precoTotal = precoBase + precoAdicionais;

    document.getElementById('preco-adicionais-customizacao').textContent = precoAdicionais.toFixed(2).replace('.', ',');
    document.getElementById('preco-total-customizacao').textContent = precoTotal.toFixed(2).replace('.', ',');
    
    itemEmCustomizacao.precoFinal = precoTotal;
}

// =======================================================
// FUNÇÕES DE CARREGAMENTO (MODIFICADAS)
// =======================================================

// Função para criar cada item individual do cardápio (AJUSTADA para Customização)
function criarItemCardapio(item, categoria) {
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
    
    // Lógica para Customizar ou Adicionar Direto
    if (categoriasCustomizaveis.includes(categoria)) {
        btnAdicionar.textContent = 'Customizar e Adicionar';
        btnAdicionar.addEventListener('click', () => {
            abrirModalCustomizacao(item);
        });
    } else {
        btnAdicionar.textContent = 'Adicionar';
        btnAdicionar.addEventListener('click', () => {
            adicionarAoCarrinho(item); 
        });
    }

    divItem.appendChild(btnAdicionar);
    return divItem;
}


// Função para criar a seção do cardápio (AJUSTADA para passar a categoria)
function criarSecaoCardapio(titulo, itens) {
    let containerId = '';
    switch(titulo) {
        case 'Hambúrgueres Artesanais': containerId = 'hamburgueres-artesanais-grid'; break;
        case 'Combos e Família': containerId = 'combos-e-familia-grid'; break;
        case 'Acompanhamentos': containerId = 'acompanhamentos-grid'; break;
        case 'Bebidas': containerId = 'bebidas-grid'; break;
        // A categoria 'Adicionais' não existe mais como seção separada
        default: console.warn(`Categoria desconhecida: ${titulo}`); return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contêiner não encontrado para a categoria: ${titulo}`);
        return;
    }

    itens.forEach(item => {
        const itemElemento = criarItemCardapio(item, titulo); // Passa o título/categoria
        container.appendChild(itemElemento);
    });
}

// A função principal que carrega e exibe os dados do cardápio (AJUSTADA para carregar Adicionais)
async function carregarCardapio() {
    try {
        const response = await fetch('./cardapio.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const cardapioData = await response.json();
        
        // **CRÍTICO**: Carrega os adicionais globais e remove a chave principal
        adicionaisGlobais = cardapioData.adicionais_opcoes || []; 
        delete cardapioData.adicionais_opcoes; 

        for (const categoria in cardapioData) {
            if (cardapioData.hasOwnProperty(categoria)) {
                criarSecaoCardapio(categoria, cardapioData[categoria]);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar o cardápio:', error);
        document.body.innerHTML = `<h1>Erro ao carregar o cardápio. Tente novamente mais tarde.</h1>`;
    }
}

// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicia o carregamento do cardápio
    carregarCardapio();

    // 1. ABRIR MODAL DO CARRINHO
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            carrinhoModal.style.display = 'block';
            atualizarModalCarrinho(); 
        });
    }

    // 2. FECHAR MODAIS (CARRINHO E CUSTOMIZAÇÃO) PELO 'X'
    if (fecharModalBtn && carrinhoModal) {
        fecharModalBtn.addEventListener('click', () => {
            carrinhoModal.style.display = 'none';
        });
    }
    if (fecharCustomizacaoBtn && customizacaoModal) {
        fecharCustomizacaoBtn.addEventListener('click', () => {
            customizacaoModal.style.display = 'none';
        });
    }

    // 3. FECHAR AMBAS AS MODAIS CLICANDO FORA
    window.addEventListener('click', (event) => {
        if (event.target === carrinhoModal || event.target === customizacaoModal) {
            event.target.style.display = 'none';
        }
    });

    // 4. ADICIONAR ITEM CUSTOMIZADO AO CARRINHO (Botão da Modal de Customização)
    if (btnAdicionarCustomizado) {
        btnAdicionarCustomizado.addEventListener('click', () => {
            if (!itemEmCustomizacao || itemEmCustomizacao.precoFinal === undefined) {
                 alert("Erro na customização. Tente novamente.");
                 return;
            }
            
            // Monta o nome customizado para exibição no carrinho
            const adicionaisSelecionados = itemEmCustomizacao.adicionais
                .map(ad => `${ad.nome} x${ad.quantidade}`).join(', ');
            
            const nomeFinal = `${itemEmCustomizacao.nome} (${adicionaisSelecionados || 'Sem Adicionais'})`;

            const itemFinal = {
                nome: itemEmCustomizacao.nome,
                preco: itemEmCustomizacao.precoFinal,
                nomeExibicao: nomeFinal,
                adicionais: itemEmCustomizacao.adicionais
            };
            
            adicionarAoCarrinho(itemFinal); 
            customizacaoModal.style.display = 'none';
        });
    }
    
    // 5. Lógica do Finalizar Pedido (Simulação)
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio.");
                return;
            }
            alert(`Pedido finalizado! Total: R$ ${carrinhoTotalSpan.textContent}. Entraremos em contato!`);
            // Lógica para limpar o carrinho e fechar modal (se desejar)
            carrinho = [];
            if (contadorCarrinho) contadorCarrinho.textContent = 0;
            carrinhoModal.style.display = 'none';
        });
    }

    // 6. Lógica do Hamburger Menu
    const navLinks = document.querySelector('.nav-links');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active'); 
        });
    }

});
