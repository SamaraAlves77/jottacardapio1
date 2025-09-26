// =======================================================
// VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM
// =======================================================
let carrinho = [];
let adicionaisGlobais = [];
let itemEmCustomizacao = null;

// Elementos do Carrinho
const carrinhoModal = document.getElementById('carrinho-modal');
const fecharModalBtn = carrinhoModal ? carrinhoModal.querySelector('.fechar-modal') : null;
const carrinhoBtn = document.getElementById('carrinho-btn'); // Botão do header (Desktop)
const mobileCarrinhoBtn = document.getElementById('mobile-carrinho-btn'); // NOVO: Botão da barra fixa (Mobile)
const contadorCarrinho = document.getElementById('contador-carrinho'); // Contador do header (Desktop)
const mobileContadorCarrinho = document.getElementById('mobile-contador-carrinho'); // NOVO: Contador da barra fixa (Mobile)
const carrinhoItensContainer = document.getElementById('carrinho-itens');
const carrinhoTotalSpan = document.getElementById('carrinho-total');
const notificacao = document.getElementById('notificacao');
const btnFinalizar = document.getElementById('btn-finalizar-pedido');
const navLinks = document.querySelector('.nav-links');

// Elementos do Menu Mobile
const hamburgerBtn = document.getElementById('hamburger-menu-btn'); // Botão do header (Desktop)
const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn'); // NOVO: Botão da barra fixa (Mobile)

// Elementos da Customização (Modal Flutuante)
const customizacaoModal = document.getElementById('customizacao-modal');
const fecharCustomizacaoBtn = customizacaoModal ? customizacaoModal.querySelector('.fechar-customizacao') : null;
const btnAdicionarCustomizado = document.getElementById('btn-adicionar-customizado');
const listaAdicionaisContainer = document.getElementById('adicionais-opcoes-lista');

// =======================================================
// FUNÇÕES DE MANIPULAÇÃO DO CARRINHO
// =======================================================

function adicionarAoCarrinho(item) {
    carrinho.push(item);
    
    // Atualiza contadores
    if (contadorCarrinho) {
        contadorCarrinho.textContent = carrinho.length;
    }
    if (mobileContadorCarrinho) { // NOVO
        mobileContadorCarrinho.textContent = carrinho.length;
    }

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
    
    // Atualiza contadores
    if (contadorCarrinho) {
        contadorCarrinho.textContent = carrinho.length;
    }
    if (mobileContadorCarrinho) { // NOVO
        mobileContadorCarrinho.textContent = carrinho.length;
    }
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


// ... (Mantenha as funções de Customização e Carregamento do Cardápio idênticas)
// ... (abrirModalCustomizacao, renderizarOpcoesAdicionais, adicionarListenersContador, gerenciarAdicional, atualizarResumoCustomizacao, criarItemCardapio, criarSecaoCardapio, carregarCardapio)

// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    
    if (document.querySelector('main')) {
        carregarCardapio();
    }
    
    // ABRIR MODAL DO CARRINHO (Header - Desktop)
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            carrinhoModal.classList.add('ativo');
            atualizarModalCarrinho();
        });
    }
    
    // NOVO: ABRIR MODAL DO CARRINHO (Barra Fixa - Mobile)
    if (mobileCarrinhoBtn && carrinhoModal) {
        mobileCarrinhoBtn.addEventListener('click', () => {
            carrinhoModal.classList.add('ativo');
            atualizarModalCarrinho();
        });
    }

    // FECHAR MODAIS PELO 'X' E CLICANDO FORA
    // ... (mantenha o código de fechar modal)
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
    // ... (mantenha o código de adicionar item customizado)
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
    // ... (mantenha o código de finalizar pedido)
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
            
            const numeroWhatsApp = '5586981147596';
            const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            
            window.open(linkWhatsApp, '_blank');
        });
    }

    // Lógica do Hamburger Menu (Header - Desktop)
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // NOVO: Lógica do Hamburger Menu (Barra Fixa - Mobile)
    if (mobileHamburgerBtn && navLinks) {
        mobileHamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Fecha o menu mobile ao clicar em um link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });
});
