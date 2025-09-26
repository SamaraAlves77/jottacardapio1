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
const navLinks = document.querySelector('.nav-links'); // Referência para o menu

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
    
    // Mostra a notificação de item adicionado
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

    // Adiciona listeners para os botões de remover dentro do modal
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index'); 
            removerDoCarrinho(index);
        });
    });
}


// =======================================================
// FUNÇÕES DE CUSTOMIZAÇÃO (JANELA FLUTUANTE)
// =======================================================
// Apenas itens desta categoria podem ser customizados
const CATEGORIA_CUSTOMIZAVEL = 'Hambúrgueres Artesanais';


/**
 * Abre a modal de customização para um item específico.
 * @param {object} item - O objeto do item base (ex: Smash Original).
 */
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
    customizacaoModal.style.display = 'flex'; // Usamos flex para centralizar
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
            <div>
                <span>${adicional.nome}</span> 
                <small>(R$ ${adicional.preco.toFixed(2).replace('.', ',')})</small>
            </div>
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
    // Adiciona listeners de clique dinamicamente
    document.querySelectorAll('.btn-aumentar-adicional').forEach(btn => {
        btn.onclick = () => { gerenciarAdicional(btn.dataset.nome, 1); };
    });
    
    document.querySelectorAll('.btn-diminuir-adicional').forEach(btn => {
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
// FUNÇÕES DE CARREGAMENTO DO CARDÁPIO
// =======================================================

function criarItemCardapio(item, categoriaNome) {
    const divItem = document.createElement('div');
    divItem.className = 'item-card';

    const img = document.createElement('img');
    img.src = `imagem_cardapio/${item.imagem}`; // Caminho da imagem
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
    
    // Lógica para Customizar (se for Hambúrguer Artesanal) ou Adicionar Direto
    if (categoriaNome === CATEGORIA_CUSTOMIZAVEL) {
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

/**
 * Cria a seção do cardápio e carrega os itens.
 * @param {string} titulo - Título da categoria (ex: Hambúrgueres Artesanais).
 * @param {string} idContainer - O ID do elemento div-grid no HTML (ex: hamburgueres-artesanais-grid).
 * @param {Array<Object>} itens - Lista de itens da categoria.
 */
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

/**
 * Carrega e processa o arquivo JSON do cardápio.
 */
async function carregarCardapio() {
    try {
        const response = await fetch('./cardapio.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const cardapioData = await response.json(); // Espera um Array de Categorias

        // Separa os adicionais e o restante do cardápio
        const adicionaisCategoria = cardapioData.find(c => c.id === 'adicionais-extras');
        
        if (adicionaisCategoria) {
            adicionaisGlobais = adicionaisCategoria.itens || []; 
        }

        // Renderiza cada seção
        cardapioData.forEach(categoriaObj => {
            if (categoriaObj.id !== 'adicionais-extras') {
                // O HTML usa o ID do objeto + '-grid'
                const idContainerGrid = categoriaObj.id + '-grid'; 
                criarSecaoCardapio(categoriaObj.nome, idContainerGrid, categoriaObj.itens);
            }
        });
    } catch (error) {
        console.error('Erro CRÍTICO ao carregar o cardápio. Verifique o JSON:', error);
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `<h1 style="text-align:center; color: var(--primary-color);">Erro ao carregar o cardápio. Verifique o formato do seu cardapio.json.</h1>`;
        }
    }
}

// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicia o carregamento do cardápio
    if (document.querySelector('main')) {
        carregarCardapio();
    }
    
    // 1. ABRIR MODAL DO CARRINHO
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            carrinhoModal.style.display = 'flex'; // Garante o display flex para centralizar
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
            
            // Ajuste do nome final para ser mais curto
            const nomeFinal = `${itemEmCustomizacao.nome} (+ ${itemEmCustomizacao.adicionais.length} itens)`;

            const itemFinal = {
                nome: itemEmCustomizacao.nome,
                preco: itemEmCustomizacao.precoFinal,
                // Nome completo para o WhatsApp, Nome curto para o carrinho
                nomeExibicao: adicionaisSelecionados ? nomeFinal : itemEmCustomizacao.nome,
                nomeWhatsApp: `${itemEmCustomizacao.nome} (${adicionaisSelecionados || 'Sem Adicionais'})`,
                adicionais: itemEmCustomizacao.adicionais
            };
            
            adicionarAoCarrinho(itemFinal); 
            customizacaoModal.style.display = 'none';
        });
    }
    
    // 5. Lógica do Finalizar Pedido (Geração do Link WhatsApp)
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio.");
                return;
            }
            
            const nomeCliente = document.getElementById('nome-cliente').value;
            const enderecoCliente = document.getElementById('endereco-cliente').value;
            const telefoneCliente = document.getElementById('telefone-cliente').value;
            
            if (!nomeCliente || !enderecoCliente || !telefoneCliente) {
                alert("Por favor, preencha seu nome, endereço e telefone para finalizar o pedido.");
                return;
            }

            let mensagem = `*PEDIDO JOTTAV BURGUER*\n\n`;
            mensagem += `*Nome:* ${nomeCliente}\n`;
            mensagem += `*Endereço:* ${enderecoCliente}\n`;
            mensagem += `*Telefone:* ${telefoneCliente}\n\n`;
            mensagem += `*ITENS DO PEDIDO (${carrinho.length}):*\n`;
            
            carrinho.forEach((item, index) => {
                const precoFormatado = item.preco.toFixed(2).replace('.', ',');
                // Usa nomeWhatsApp se existir (para customizados) ou o nome normal
                const nomeItem = item.nomeWhatsApp || item.nome; 
                mensagem += `${index + 1}. ${nomeItem} - R$ ${precoFormatado}\n`;
            });
            
            const totalFinal = carrinhoTotalSpan.textContent;
            mensagem += `\n*TOTAL: R$ ${totalFinal}*`;
            
            const numeroWhatsApp = '5586981147596'; // Seu número
            const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            
            window.open(linkWhatsApp, '_blank');
        });
    }

    // 6. Lógica do Hamburger Menu
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active'); 
        });
        
        // Fecha o menu mobile ao clicar em um link (âncora)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }

});
