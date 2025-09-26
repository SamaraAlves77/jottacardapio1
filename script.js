// =======================================================
// FUNÇÕES DE CARREGAMENTO DINÂMICO DE HTML
// =======================================================

async function loadHTML(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao carregar ${url}: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        return true; // Sucesso
    } catch (error) {
        console.error(error);
        return false; // Falha
    }
}

// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO (NOVO ORDENAMENTO)
// =======================================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Carregar as partes do HTML sequencialmente
    await loadHTML('navbar.html', 'navbar-container');
    await loadHTML('conteudo_cardapio.html', 'main-content-container');
    await loadHTML('modal_carrinho.html', 'modal-container');
    
    // 2. Após o carregamento de todo o HTML, carregar os dados do cardápio e iniciar os listeners
    
    // CORREÇÃO: As variáveis de DOM (como carrinhoModal, carrinhoBtn) precisam ser redefinidas
    // porque o conteúdo foi carregado DEPOIS do DOMContentLoaded.
    
    // Re-referencia os elementos que foram injetados:
    const rebindElements = () => {
        // Elementos do Carrinho
        window.carrinhoModal = document.getElementById('carrinho-modal');
        window.fecharModalBtn = carrinhoModal ? carrinhoModal.querySelector('.fechar-modal') : null;
        window.carrinhoBtn = document.getElementById('carrinho-btn');
        window.mobileCarrinhoBtn = document.getElementById('mobile-carrinho-btn');
        window.contadorCarrinho = document.getElementById('contador-carrinho');
        window.mobileContadorCarrinho = document.getElementById('mobile-contador-carrinho');
        window.carrinhoItensContainer = document.getElementById('carrinho-itens');
        window.carrinhoTotalSpan = document.getElementById('carrinho-total');
        
        // Elementos do Menu Mobile
        window.hamburgerBtn = document.getElementById('hamburger-menu-btn');
        window.mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
        window.navLinks = document.querySelector('.nav-links');
        
        // Elementos da Customização
        window.customizacaoModal = document.getElementById('customizacao-modal');
        window.fecharCustomizacaoBtn = customizacaoModal ? customizacaoModal.querySelector('.fechar-customizacao') : null;
        window.btnAdicionarCustomizado = document.getElementById('btn-adicionar-customizado');
        window.listaAdicionaisContainer = document.getElementById('adicionais-opcoes-lista');
        window.btnFinalizar = document.getElementById('btn-finalizar-pedido');
    };
    
    rebindElements();
    
    // 3. Carregar os dados do JSON e popular o cardápio
    if (document.querySelector('main')) {
        carregarCardapio();
    }
    
    // 4. Configurar todos os Listeners
    setupEventListeners();
});

function setupEventListeners() {
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

    // ADICIONAR ITEM CUSTOMIZADO AO CARRINHO (Mantido, mas usando window.btnAdicionarCustomizado)
    if (btnAdicionarCustomizado) {
        btnAdicionarCustomizado.addEventListener('click', () => {
            // ... (Lógica de customização aqui, idêntica à versão anterior) ...
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
            // ... (Lógica de finalização aqui, idêntica à versão anterior) ...
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
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });
}
// OBS: MANTENHA O RESTANTE DAS FUNÇÕES DO script.js (adicionarAoCarrinho, carregarCardapio, criarItemCardapio, etc.) INTACTAS!
