// =======================================================
// VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM
// =======================================================
let carrinho = [];
let adicionaisGlobais = [];
let itemEmCustomizacao = null;
const CATEGORIA_CUSTOMIZAVEL = 'Hambúrgueres Artesanais'; // Garante que apenas Artesanais possam ser customizados

// Variáveis globais para os elementos (serão preenchidas em rebindElements após a injeção do HTML)
// ATENÇÃO: fabCarrinho e fabContadorCarrinho adicionados aqui
let carrinhoModal, fecharModalBtn, carrinhoBtn, mobileCarrinhoBtn, contadorCarrinho, mobileContadorCarrinho, fabCarrinho, fabContadorCarrinho, carrinhoItensContainer, carrinhoTotalSpan, notificacao, btnFinalizar, navLinks, hamburgerBtn, mobileHamburgerBtn, customizacaoModal, fecharCustomizacaoBtn, btnAdicionarCustomizado, listaAdicionaisContainer;


// =======================================================
// FUNÇÕES DE CARREGAMENTO DINÂMICO DE HTML (Fetch)
// =======================================================

async function loadHTML(url, elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Contêiner de destino '${elementId}' não encontrado. Verifique se o cardapio.html possui este ID.`);
        return false;
    }
    
    try {
        // O fetch busca o arquivo na raiz (mesmo nível do script.js)
        const response = await fetch(url);
        
        if (!response.ok) {
            // Se der erro 404, avisa o usuário diretamente na tela
            element.innerHTML = `<h3 style="color: red; text-align: center;">ERRO 404: Arquivo '${url}' não encontrado. Verifique o nome.</h3>`;
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
    // ⚠️ Liga as variáveis globais aos elementos que acabaram de ser injetados no DOM ⚠️
    carrinhoModal = document.getElementById('carrinho-modal');
    fecharModalBtn = carrinhoModal ? carrinhoModal.querySelector('.fechar-modal') : null;
    carrinhoBtn = document.getElementById('carrinho-btn');
    mobileCarrinhoBtn = document.getElementById('mobile-carrinho-btn');
    contadorCarrinho = document.getElementById('contador-carrinho');
    mobileContadorCarrinho = document.getElementById('mobile-contador-carrinho');
    
    // NOVO: Referências do Botão Fixo (FAB)
    fabCarrinho = document.getElementById('fab-carrinho');
    fabContadorCarrinho = document.getElementById('fab-contador-carrinho');

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

// =======================================================
// FUNÇÕES DE MANIPULAÇÃO DO CARRINHO E UTILIDADE
// =======================================================

// NOVO: Função centralizada para atualizar todos os contadores
function updateContadorCarrinho() {
    const totalItens = carrinho.length;
    if (contadorCarrinho) contadorCarrinho.textContent = totalItens;
    if (mobileContadorCarrinho) mobileContadorCarrinho.textContent = totalItens;
    if (fabContadorCarrinho) fabContadorCarrinho.textContent = totalItens; // NOVO: Atualiza o contador do FAB
}

// NOVO: Função centralizada para abrir o modal do carrinho
function openCarrinhoModal() {
    if (carrinhoModal) {
        carrinhoModal.classList.add('ativo');
        atualizarModalCarrinho();
    }
}


function adicionarAoCarrinho(item) {
    carrinho.push(item);
    
    // Lógica de contador substituída pela nova função
    updateContadorCarrinho();

    atualizarModalCarrinho();
    
    if (notificacao) {
        notificacao.classList.add('mostrar');
        setTimeout(() => {
            notificacao.classList.remove('mostrar');
        }, 3000);
    }
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    
    // Lógica de contador substituída pela nova função
    updateContadorCarrinho();

    atualizarModalCarrinho();
}

function atualizarModalCarrinho() {
    if (!carrinhoItensContainer || !carrinhoTotalSpan) return;

    carrinhoItensContainer.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        
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
// FUNÇÕES DE CUSTOMIZAÇÃO
// =======================================================

function abrirModalCustomizacao(item) {
    if (!customizacaoModal) return;

    // Cria uma cópia do item para customização
    itemEmCustomizacao = { 
        ...item,
        adicionais: [], 
        precoFinal: item.preco 
    };

    document.getElementById('item-customizacao-nome').textContent = item.nome;
    document.getElementById('preco-base-customizacao').textContent = item.preco.toFixed(2).replace('.', ',');
    
    renderizarOpcoesAdicionais();
    customizacaoModal.classList.add('ativo'); 
}

function renderizarOpcoesAdicionais() {
    if (!listaAdicionaisContainer) return;

    listaAdicionaisContainer.innerHTML = '';
    
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
        listaAdicionaisContainer.appendChild(div);
    });
    
    adicionarListenersContador();
    atualizarResumoCustomizacao();
}

function adicionarListenersContador() {
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
    
    renderizarOpcoesAdicionais();
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
// FUNÇÕES DE CARREGAMENTO DO CARDÁPIO E CRIAÇÃO DE CARDS
// =======================================================

function criarItemCardapio(item, categoriaNome) {
    const divItem = document.createElement('div');
    divItem.className = 'item-card';

    // ATENÇÃO: Confirme que o nome do arquivo da imagem está correto no JSON e na pasta!
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

function criarSecaoCardapio(titulo, idContainer, itens) {
    // O ID deve ser o nome da seção + '-grid' (ex: hamburgueres-artesanais-grid)
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
        // Busca o cardapio.json na raiz
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


// =======================================================
// EVENT LISTENERS E INICIALIZAÇÃO
// =======================================================

function setupEventListeners() {
    // ABRIR MODAL DO CARRINHO (Desktop, Mobile e FAB)
    if (carrinhoBtn) {
        carrinhoBtn.addEventListener('click', openCarrinhoModal);
    }
    if (mobileCarrinhoBtn) {
        mobileCarrinhoBtn.addEventListener('click', openCarrinhoModal);
    }
    // NOVO: Adiciona o listener para o Botão Fixo Neon (FAB)
    if (fabCarrinho) {
        fabCarrinho.addEventListener('click', openCarrinhoModal);
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

    // ADICIONAR ITEM CUSTOMIZADO AO CARRINHO
    if (btnAdicionarCustomizado) {
        btnAdicionarCustomizado.addEventListener('click', () => {
            if (!itemEmCustomizacao || itemEmCustomizacao.precoFinal === undefined) {
                alert("Erro na customização. Tente novamente.");
                return;
            }
            
            const adicionaisSelecionados = itemEmCustomizacao.adicionais
                .map(ad => `${ad.nome} x${ad.quantidade}`).join(', ');
            
            const nomeFinal = `${itemEmCustomizacao.nome} (+ ${itemEmCustomizacao.adicionais.length} itens)`;

            const itemFinal = {
                nome: itemEmCustomizacao.nome,
                preco: itemEmCustomizacao.precoFinal,
                nomeExibicao: adicionaisSelecionados ? nomeFinal : itemEmCustomizacao.nome,
                nomeWhatsApp: `${itemEmCustomizacao.nome} (${adicionaisSelecionados || 'Sem Adicionais'})`,
                adicionais: itemEmCustomizacao.adicionais
            };
            
            adicionarAoCarrinho(itemFinal);
            customizacaoModal.classList.remove('ativo');
        });
    }
    
    // Lógica do Finalizar Pedido (Geração do Link WhatsApp)
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
                const nomeItem = item.nomeWhatsApp || item.nome;
                mensagem += `${index + 1}. ${nomeItem} - R$ ${precoFormatado}\n`;
            });
            
            const totalFinal = carrinhoTotalSpan.textContent;
            mensagem += `\n*TOTAL: R$ ${totalFinal}*`;
            
            // SUBSTITUA ESTE NÚMERO PELO NÚMERO CORRETO DO SEU WHATSAPP
            const numeroWhatsApp = '5586981147596'; 
            const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            
            window.open(linkWhatsApp, '_blank');
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
// FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL
// =======================================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Carrega o HTML dinamicamente. **VERIFIQUE O NOME DESTES ARQUIVOS!**
    const navbarOK = await loadHTML('navbar.html', 'navbar-container');
    const conteudoOK = await loadHTML('conteudo_cardapio.html', 'main-content-container');
    const modalOK = await loadHTML('modal_carrinho.html', 'modal-container');
    
    // 2. Só prossegue se todos os arquivos HTML necessários foram carregados
    if (navbarOK && conteudoOK && modalOK) {
        
        // Re-liga os elementos injetados às variáveis JS
        rebindElements(); 
        
        // Carrega os dados do JSON e popula o cardápio
        await carregarCardapio(); 
        
        // Configura os Listeners de botões e modais
        setupEventListeners();
        
        // Garante que o contador inicial seja 0 (incluindo o novo FAB)
        updateContadorCarrinho();
        
    } else {
        console.error("Não foi possível carregar todas as partes do HTML. Verifique os erros acima.");
    }
});
