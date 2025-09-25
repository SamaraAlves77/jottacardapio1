// Variáveis globais
let cardapioData = {};
let carrinho = [];
let itemSelecionado = null;
const whatsappNumero = '5586994253258'; // Seu número de WhatsApp

const menuContainer = document.getElementById('menu-container');
const navLinksContainer = document.getElementById('nav-links');
const abrirCarrinhoBtn = document.getElementById('abrir-carrinho');
const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
const carrinhoModal = document.getElementById('carrinho-modal');
const fecharModalSpan = document.querySelector('#carrinho-modal .fechar-modal');
const carrinhoItensDiv = document.getElementById('carrinho-itens');
const carrinhoVazioDiv = document.getElementById('carrinho-vazio');
const totalPedidoSpan = document.getElementById('total-pedido');
const finalizarPedidoBtn = document.getElementById('finalizar-pedido-whatsapp');
const notificacaoFlutuante = document.getElementById('notificacao-flutuante');
const adicionaisModal = document.getElementById('adicionais-modal');
const fecharAdicionaisSpan = document.querySelector('#adicionais-modal .fechar-modal');
const adicionaisOpcoesDiv = document.getElementById('adicionais-opcoes');
const confirmarAdicionaisBtn = document.getElementById('confirmar-adicionais');
const observacaoItemTextarea = document.getElementById('observacao-item');
const abrirCardapioVisualBtn = document.getElementById('abrir-cardapio-visual');
const entradaVisualDiv = document.getElementById('entrada-visual');
const mainContentDiv = document.getElementById('main-content');
const hamburgerMenuBtn = document.getElementById('hamburger-menu');

// Botões e campos do formulário
const formaPagamentoSelect = document.getElementById('forma-pagamento');
const observacoesGeraisTextarea = document.getElementById('observacoes-gerais');
const campoRuaInput = document.getElementById('campo-rua');
const campoNumeroInput = document.getElementById('campo-numero');
const campoBairroInput = document.getElementById('campo-bairro');
const observacoesEnderecoTextarea = document.getElementById('observacoes-endereco');
const btnLocalizacao = document.getElementById('btn-localizacao');
const localizacaoStatus = document.getElementById('localizacao-status');

// Funções do Cardápio
// ===================
function gerarCardapio() {
    menuContainer.innerHTML = '';
    navLinksContainer.innerHTML = '';
    let navLinksHtml = '';

    for (const categoria in cardapioData) {
        const categoriaId = categoria.replace(/\s+/g, '-').toLowerCase();
        
        // Adiciona o link na barra de navegação
        navLinksHtml += `<a href="#${categoriaId}">${categoria}</a>`;

        const section = document.createElement('section');
        section.className = 'menu-section';
        section.id = categoriaId;
        section.innerHTML = `<h2>${categoria}</h2>`;

        const grid = document.createElement('div');
        grid.className = 'item-grid';

        cardapioData[categoria].forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <img src="${item.imagem}" alt="${item.nome}">
                <h3>${item.nome}</h3>
                <p>${item.descricao}</p>
                <span class="price">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                <button class="btn-add" data-id="${item.id}" data-categoria="${categoria}">Adicionar</button>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        menuContainer.appendChild(section);
    }
    navLinksContainer.innerHTML = navLinksHtml;

    // Adiciona o evento de rolagem para os links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const offset = 80; // Ajuste para a altura da barra de navegação
                const targetPosition = targetElement.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            // Fecha o menu hambúrguer se estiver aberto
            navLinksContainer.classList.remove('active');
        });
    });
}

function exibirNotificacao(mensagem) {
    notificacaoFlutuante.textContent = mensagem;
    notificacaoFlutuante.classList.add('show');
    setTimeout(() => {
        notificacaoFlutuante.classList.remove('show');
    }, 2000);
}

// Funções do Carrinho
// ===================
function atualizarCarrinho() {
    carrinhoItensDiv.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
        carrinhoVazioDiv.style.display = 'block';
    } else {
        carrinhoVazioDiv.style.display = 'none';
        carrinho.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'carrinho-item';
            
            let adicionaisHtml = '';
            let adicionaisPreco = 0;
            if (item.adicionais && item.adicionais.length > 0) {
                const nomesAdicionais = item.adicionais.map(add => add.nome).join(', ');
                adicionaisHtml = `<p class="item-adicionais">Opcionais: ${nomesAdicionais}</p>`;
                adicionaisPreco = item.adicionais.reduce((sum, add) => sum + add.preco, 0);
            }

            let observacaoHtml = '';
            if (item.observacao) {
                observacaoHtml = `<p class="item-observacao">Obs: ${item.observacao}</p>`;
            }

            const precoTotalItem = (item.preco + adicionaisPreco) * item.quantidade;
            total += precoTotalItem;
            
            itemElement.innerHTML = `
                <div>
                    ${item.nome} (${item.quantidade})
                    <span class="total-item">R$ ${precoTotalItem.toFixed(2).replace('.', ',')}</span>
                    ${adicionaisHtml}
                    ${observacaoHtml}
                </div>
                <div class="carrinho-actions">
                    <button data-index="${index}" class="btn-quantidade-remover">-</button>
                    <button data-index="${index}" class="btn-quantidade-adicionar">+</button>
                    <i class="fas fa-trash-alt remover-item" data-index="${index}"></i>
                </div>
            `;
            carrinhoItensDiv.appendChild(itemElement);
        });
    }

    totalPedidoSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    contadorCarrinhoSpan.textContent = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    // Habilita ou desabilita o botão de finalizar pedido
    finalizarPedidoBtn.disabled = carrinho.length === 0;
}

function adicionarItemAoCarrinho(item, quantidade, adicionais = [], observacao = '') {
    const itemExistente = carrinho.find(
        c => c.id === item.id && 
             JSON.stringify(c.adicionais) === JSON.stringify(adicionais) &&
             c.observacao === observacao
    );

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        const itemParaAdicionar = {
            id: item.id,
            nome: item.nome,
            preco: item.preco,
            quantidade: quantidade,
            adicionais: adicionais,
            observacao: observacao
        };
        carrinho.push(itemParaAdicionar);
    }
    atualizarCarrinho();
    exibirNotificacao(`"${item.nome}" adicionado!`);
}

function removerItemDoCarrinho(index) {
    if (carrinho[index]) {
        const nomeItem = carrinho[index].nome;
        carrinho.splice(index, 1);
        atualizarCarrinho();
        exibirNotificacao(`"${nomeItem}" removido!`);
    }
}

function alterarQuantidade(index, operacao) {
    if (carrinho[index]) {
        if (operacao === '+') {
            carrinho[index].quantidade++;
        } else if (operacao === '-' && carrinho[index].quantidade > 1) {
            carrinho[index].quantidade--;
        } else if (operacao === '-' && carrinho[index].quantidade === 1) {
            removerItemDoCarrinho(index);
            return;
        }
        atualizarCarrinho();
    }
}

// Funções de Modal e Event Listeners
// ==================================
function abrirModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Impede rolagem do fundo
}
function fecharModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

abrirCarrinhoBtn.addEventListener('click', () => abrirModal(carrinhoModal));
fecharModalSpan.addEventListener('click', () => fecharModal(carrinhoModal));
fecharAdicionaisSpan.addEventListener('click', () => fecharModal(adicionaisModal));

window.addEventListener('click', (event) => {
    if (event.target === carrinhoModal) {
        fecharModal(carrinhoModal);
    }
    if (event.target === adicionaisModal) {
        fecharModal(adicionaisModal);
    }
});

menuContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-add')) {
        const itemId = parseInt(event.target.getAttribute('data-id'));
        const categoria = event.target.getAttribute('data-categoria');
        
        itemSelecionado = cardapioData[categoria].find(item => item.id === itemId);

        if (categoria === 'Combos' || categoria === 'Acompanhamentos' || categoria === 'Bebidas') {
            adicionarItemAoCarrinho(itemSelecionado, 1);
        } else {
            abrirAdicionaisModal();
        }
    }
});

carrinhoItensDiv.addEventListener('click', (event) => {
    if (event.target.classList.contains('remover-item')) {
        const index = event.target.getAttribute('data-index');
        removerItemDoCarrinho(index);
    } else if (event.target.classList.contains('btn-quantidade-adicionar')) {
        const index = event.target.getAttribute('data-index');
        alterarQuantidade(index, '+');
    } else if (event.target.classList.contains('btn-quantidade-remover')) {
        const index = event.target.getAttribute('data-index');
        alterarQuantidade(index, '-');
    }
});

// Funções do Modal de Adicionais
// ===============================
function abrirAdicionaisModal() {
    adicionaisOpcoesDiv.innerHTML = '';
    observacaoItemTextarea.value = '';
    const adicionaisSelecionados = new Map();

    cardapioData['Opcionais'].forEach(adicional => {
        const adicionalCard = document.createElement('div');
        adicionalCard.className = 'adicional-card';
        adicionalCard.innerHTML = `
            <img src="${adicional.imagem}" alt="${adicional.nome}">
            <div class="adicional-info">
                <span>${adicional.nome}</span>
                <span class="price">R$ ${adicional.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="adicional-actions">
                <button class="btn-quantidade-adicional-remover" data-id="${adicional.id}">-</button>
                <span class="quantidade-add" id="quantidade-add-${adicional.id}">0</span>
                <button class="btn-quantidade-adicional-adicionar" data-id="${adicional.id}">+</button>
            </div>
        `;
        adicionaisOpcoesDiv.appendChild(adicionalCard);
    });

    adicionaisOpcoesDiv.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('btn-quantidade-adicional-adicionar')) {
            const id = parseInt(target.getAttribute('data-id'));
            const adicional = cardapioData['Opcionais'].find(add => add.id === id);
            adicionaisSelecionados.set(id, (adicionaisSelecionados.get(id) || 0) + 1);
            document.getElementById(`quantidade-add-${id}`).textContent = adicionaisSelecionados.get(id);
        } else if (target.classList.contains('btn-quantidade-adicional-remover')) {
            const id = parseInt(target.getAttribute('data-id'));
            const quantidade = adicionaisSelecionados.get(id) || 0;
            if (quantidade > 0) {
                adicionaisSelecionados.set(id, quantidade - 1);
                document.getElementById(`quantidade-add-${id}`).textContent = quantidade - 1;
            }
        }
    });

    confirmarAdicionaisBtn.onclick = () => {
        const adicionais = [];
        for (let [id, quantidade] of adicionaisSelecionados.entries()) {
            if (quantidade > 0) {
                const adicional = cardapioData['Opcionais'].find(add => add.id === id);
                for (let i = 0; i < quantidade; i++) {
                    adicionais.push(adicional);
                }
            }
        }
        const observacao = observacaoItemTextarea.value.trim();
        adicionarItemAoCarrinho(itemSelecionado, 1, adicionais, observacao);
        fecharModal(adicionaisModal);
    };

    abrirModal(adicionaisModal);
}

// Lógica de Finalização do Pedido
// ================================
finalizarPedidoBtn.addEventListener('click', () => {
    let pedidoTexto = 'Olá, gostaria de fazer um pedido!\n\n';
    let total = 0;

    carrinho.forEach(item => {
        let adicionaisTexto = '';
        let adicionaisPreco = 0;
        if (item.adicionais && item.adicionais.length > 0) {
            const nomesAdicionais = item.adicionais.map(add => add.nome).join(', ');
            adicionaisTexto = `\n  - Opcionais: ${nomesAdicionais}`;
            adicionaisPreco = item.adicionais.reduce((sum, add) => sum + add.preco, 0);
        }

        let observacaoTexto = '';
        if (item.observacao) {
            observacaoTexto = `\n  - Obs: ${item.observacao}`;
        }

        const precoItem = item.preco + adicionaisPreco;
        const subtotal = precoItem * item.quantidade;
        total += subtotal;

        pedidoTexto += `*${item.quantidade}x ${item.nome}* - R$ ${subtotal.toFixed(2).replace('.', ',')}${adicionaisTexto}${observacaoTexto}\n`;
    });

    pedidoTexto += `\n*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*`;

    // Dados do formulário
    const formaPagamento = formaPagamentoSelect.value;
    const observacoesGerais = observacoesGeraisTextarea.value.trim();
    const rua = campoRuaInput.value.trim();
    const numero = campoNumeroInput.value.trim();
    const bairro = campoBairroInput.value.trim();
    const observacoesEndereco = observacoesEnderecoTextarea.value.trim();

    pedidoTexto += `\n\n---
*Dados do Pedido:*
- *Pagamento:* ${formaPagamento.charAt(0).toUpperCase() + formaPagamento.slice(1).replace('-', ' ')}
- *Observações Gerais:* ${observacoesGerais || 'Nenhuma'}

*Endereço de Entrega:*
- *Rua:* ${rua || 'Não informado'}
- *Número:* ${numero || 'Não informado'}
- *Bairro:* ${bairro || 'Não informado'}
- *Obs do Endereço:* ${observacoesEndereco || 'Nenhuma'}`;

    const linkWhatsapp = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(pedidoTexto)}`;
    window.open(linkWhatsapp, '_blank');
});

// Funções de Geolocalização
// ===========================
btnLocalizacao.addEventListener('click', () => {
    if (navigator.geolocation) {
        localizacaoStatus.textContent = 'Obtendo sua localização...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                localizacaoStatus.textContent = `Localização obtida. Latitude: ${lat}, Longitude: ${lon}.`;
                // Você pode usar uma API de geocodificação reversa aqui para obter o endereço
                // Ex: fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
                // Por agora, o texto de status é suficiente.
            },
            (error) => {
                localizacaoStatus.textContent = 'Não foi possível obter sua localização. Por favor, preencha o endereço manualmente.';
                console.error(error);
            }
        );
    } else {
        localizacaoStatus.textContent = 'Geolocalização não é suportada pelo seu navegador.';
    }
});

// Lógica de Transição de Tela
// ============================
abrirCardapioVisualBtn.addEventListener('click', () => {
    entradaVisualDiv.style.display = 'none';
    document.body.style.backgroundColor = 'var(--cor-fundo-secundario)';
    mainContentDiv.style.display = 'block';
    // Rola para o topo
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Lógica do Menu Hambúrguer
// ==========================
hamburgerMenuBtn.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
});

// Inicialização da página
// =======================
document.addEventListener('DOMContentLoaded', () => {
    fetch('cardapio.json')
        .then(response => response.json())
        .then(data => {
            cardapioData = data;
            gerarCardapio();
            atualizarCarrinho();
        })
        .catch(error => {
            console.error('Erro ao carregar os dados do cardápio:', error);
            // Mensagem de erro para o usuário, caso o arquivo não seja encontrado
            alert('Não foi possível carregar o cardápio. Por favor, tente novamente mais tarde.');
        });
});