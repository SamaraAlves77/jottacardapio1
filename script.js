// Variáveis Globais (Dados e Estado)
let cardapioData = [];
let carrinho = [];
let itemIdCustomizando = null;

// Referências de Elementos (IDs e Classes)
const cardapioContainer = document.getElementById('cardapio-container');
const carrinhoBtn = document.querySelector('.carrinho-btn');
const carrinhoModal = document.getElementById('carrinho-modal');
const fecharCarrinho = document.querySelector('.fechar-modal');
const carrinhoItensContainer = document.querySelector('.carrinho-itens');
const carrinhoTotalElement = document.getElementById('carrinho-total');
const contadorCarrinho = document.getElementById('contador-carrinho');
const finalizarPedidoBtn = document.getElementById('btn-finalizar-pedido');
const customizacaoModal = document.getElementById('customizacao-modal');
const fecharCustomizacao = document.querySelector('.fechar-customizacao');
const adicionaisLista = document.getElementById('adicionais-opcoes-lista');
const resumoPrecoBase = document.getElementById('resumo-preco-base');
const resumoPrecoAdicionais = document.getElementById('resumo-preco-adicionais');
const resumoPrecoTotal = document.getElementById('resumo-preco-total');
const btnAdicionarCustomizado = document.getElementById('btn-adicionar-customizado');


// =======================================================
// FUNÇÕES DE UTILIDADE E RENDERIZAÇÃO
// =======================================================

function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function exibirNotificacao(mensagem) {
    const notificacao = document.getElementById('notificacao');
    if (notificacao) {
        notificacao.textContent = mensagem;
        notificacao.classList.add('mostrar');
        setTimeout(() => {
            notificacao.classList.remove('mostrar');
        }, 3000);
    }
}

// -------------------------------------------------------
// 1. CARREGAR E RENDERIZAR CARDÁPIO
// -------------------------------------------------------

async function carregarCardapio() {
    try {
        const response = await fetch('cardapio.json');
        cardapioData = await response.json();
        renderizarCardapio(cardapioData);
    } catch (error) {
        console.error('Erro ao carregar o cardápio:', error);
        cardapioContainer.innerHTML = '<p>Erro ao carregar o cardápio. Tente novamente mais tarde.</p>';
    }
}

function renderizarCardapio(data) {
    if (!cardapioContainer) return;
    cardapioContainer.innerHTML = '';

    data.forEach(secao => {
        const section = document.createElement('section');
        section.className = 'menu-section';
        section.id = `secao-${secao.id}`;

        const h2 = document.createElement('h2');
        h2.textContent = secao.nome;
        section.appendChild(h2);

        const grid = document.createElement('div');
        grid.className = 'item-grid';

        secao.itens.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.setAttribute('data-item-id', item.id);
            card.setAttribute('data-secao-id', secao.id);

            card.innerHTML = `
                <img src="imagem_cardapio/${item.imagem}" alt="${item.nome}">
                <h3>${item.nome}</h3>
                <p>${item.descricao}</p>
                <div class="price">${formatarMoeda(item.preco)}</div>
                <button class="btn-add" data-item-id="${item.id}" data-secao-id="${secao.id}">
                    Customizar e Adicionar
                </button>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        cardapioContainer.appendChild(section);
    });

    // Adiciona listener para os botões "Customizar e Adicionar"
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            const secaoId = e.target.dataset.secaoId;
            abrirModalCustomizacao(secaoId, itemId);
        });
    });
}

// -------------------------------------------------------
// 2. FUNÇÕES DO CARRINHO
// -------------------------------------------------------

function calcularTotalCarrinho() {
    let total = 0;
    carrinho.forEach(item => {
        total += item.precoTotal;
    });
    return total;
}

function atualizarContadorCarrinho() {
    contadorCarrinho.textContent = carrinho.length;
}

function adicionarAoCarrinho(item) {
    carrinho.push(item);
    atualizarModalCarrinho();
    atualizarContadorCarrinho();
    exibirNotificacao(`${item.nome} adicionado ao carrinho!`);
}

function removerDoCarrinho(index) {
    if (index > -1 && index < carrinho.length) {
        const nomeItem = carrinho[index].nome;
        carrinho.splice(index, 1);
        atualizarModalCarrinho();
        atualizarContadorCarrinho();
        exibirNotificacao(`${nomeItem} removido do carrinho.`);
    }
}

function atualizarModalCarrinho() {
    if (!carrinhoItensContainer) return;

    carrinhoItensContainer.innerHTML = '';
    const total = calcularTotalCarrinho();
    carrinhoTotalElement.textContent = formatarMoeda(total);

    if (carrinho.length === 0) {
        carrinhoItensContainer.innerHTML = '<p style="text-align: center; color: #666;">Seu carrinho está vazio.</p>';
        finalizarPedidoBtn.disabled = true;
        return;
    }

    finalizarPedidoBtn.disabled = false;

    carrinho.forEach((item, index) => {
        let descricaoAdicionais = item.adicionais.length > 0
            ? item.adicionais.map(add => `${add.nome} (${add.quantidade}x)`).join(', ')
            : 'Nenhum adicional.';

        const itemElement = document.createElement('div');
        itemElement.className = 'carrinho-item';
        itemElement.innerHTML = `
            <div>
                <p><strong>${item.quantidade}x ${item.nome}</strong></p>
                <small>${descricaoAdicionais}</small>
            </div>
            <div class="carrinho-actions">
                <span>${formatarMoeda(item.precoTotal)}</span>
                <button class="btn-remover" data-index="${index}">&times;</button>
            </div>
        `;
        carrinhoItensContainer.appendChild(itemElement);
    });

    document.querySelectorAll('.btn-remover').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            removerDoCarrinho(index);
        });
    });
}

// -------------------------------------------------------
// 3. FUNÇÕES DE CUSTOMIZAÇÃO (ADICIONAIS)
// -------------------------------------------------------

function encontrarItem(secaoId, itemId) {
    const secao = cardapioData.find(s => s.id === secaoId);
    if (secao) {
        return secao.itens.find(i => i.id === itemId);
    }
    return null;
}

function abrirModalCustomizacao(secaoId, itemId) {
    const item = encontrarItem(secaoId, itemId);
    if (!item || !customizacaoModal || !adicionaisLista) return;

    itemIdCustomizando = { secaoId: secaoId, itemId: itemId, adicionaisSelecionados: {}, precoBase: item.preco };

    const modalTitle = customizacaoModal.querySelector('h3');
    modalTitle.textContent = item.nome;
    
    // Reseta a lista de adicionais
    adicionaisLista.innerHTML = '';

    // Renderiza Adicionais
    if (item.adicionais && item.adicionais.length > 0) {
        item.adicionais.forEach(adicional => {
            const div = document.createElement('div');
            div.className = 'adicional-item-opcao';
            div.setAttribute('data-adicional-id', adicional.id);
            
            div.innerHTML = `
                <div>
                    ${adicional.nome}
                    <small>+${formatarMoeda(adicional.preco)}</small>
                </div>
                <div class="adicional-contador">
                    <button class="btn-diminuir-adicional" data-adicional-id="${adicional.id}" disabled>-</button>
                    <span class="quantidade-adicional" data-adicional-id="${adicional.id}">0</span>
                    <button class="btn-aumentar-adicional" data-adicional-id="${adicional.id}">+</button>
                </div>
            `;
            adicionaisLista.appendChild(div);
        });

        // Adiciona listeners para os botões +/-
        document.querySelectorAll('.adicional-contador button').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.adicionalId;
                const tipo = e.target.classList.contains('btn-aumentar-adicional') ? 'aumentar' : 'diminuir';
                atualizarAdicional(id, tipo, item.adicionais);
            });
        });

    } else {
        adicionaisLista.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Este item não possui adicionais.</p>';
    }

    // Exibe o preço base e calcula o total inicial (apenas o preço base)
    atualizarResumoCustomizacao();
    customizacaoModal.style.display = 'flex';
}

function atualizarAdicional(adicionalId, tipo, listaAdicionais) {
    let quantidade = itemIdCustomizando.adicionaisSelecionados[adicionalId] || 0;
    const adicionalInfo = listaAdicionais.find(a => a.id === adicionalId);

    if (!adicionalInfo) return;

    if (tipo === 'aumentar') {
        quantidade++;
    } else if (tipo === 'diminuir' && quantidade > 0) {
        quantidade--;
    }

    itemIdCustomizando.adicionaisSelecionados[adicionalId] = quantidade;

    // Atualiza o display da quantidade
    const displayElement = document.querySelector(`.quantidade-adicional[data-adicional-id="${adicionalId}"]`);
    if (displayElement) {
        displayElement.textContent = quantidade;
    }

    // Atualiza o estado do botão de diminuir
    const diminuirBtn = document.querySelector(`.btn-diminuir-adicional[data-adicional-id="${adicionalId}"]`);
    if (diminuirBtn) {
        diminuirBtn.disabled = quantidade === 0;
    }

    if (quantidade === 0) {
        delete itemIdCustomizando.adicionaisSelecionados[adicionalId];
    }
    
    atualizarResumoCustomizacao(listaAdicionais);
}

function calcularTotalAdicionais(listaAdicionais) {
    let totalAdicionais = 0;
    for (const id in itemIdCustomizando.adicionaisSelecionados) {
        const quantidade = itemIdCustomizando.adicionaisSelecionados[id];
        const adicional = listaAdicionais.find(a => a.id === id);
        if (adicional) {
            totalAdicionais += adicional.preco * quantidade;
        }
    }
    return totalAdicionais;
}

function atualizarResumoCustomizacao(listaAdicionais) {
    const precoBase = itemIdCustomizando ? itemIdCustomizando.precoBase : 0;
    const totalAdicionais = listaAdicionais ? calcularTotalAdicionais(listaAdicionais) : 0;
    const totalGeral = precoBase + totalAdicionais;

    if (resumoPrecoTotal) {
        resumoPrecoTotal.innerHTML = `Total do Item: <span>${formatarMoeda(totalGeral)}</span>`;
    }

    if (btnAdicionarCustomizado) {
        btnAdicionarCustomizado.textContent = `ADICIONAR ${formatarMoeda(totalGeral)}`;
    }
}


// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 💥 CORREÇÃO CRÍTICA: Força o fechamento das modais no carregamento
    const carrinhoModal = document.getElementById('carrinho-modal');
    const customizacaoModal = document.getElementById('customizacao-modal');
    
    if (carrinhoModal) {
        carrinhoModal.style.display = 'none';
    }
    if (customizacaoModal) {
        customizacaoModal.style.display = 'none';
    }
    // ⬆️ FIM DO CÓDIGO DE CORREÇÃO


    // 1. Inicia o carregamento do cardápio
    carregarCardapio();

    // 2. Evento para abrir a modal do carrinho
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            carrinhoModal.style.display = 'flex'; // Usa flex para centralizar
            atualizarModalCarrinho();
        });
    }

    // 3. Evento para fechar a modal do carrinho
    if (fecharCarrinho && carrinhoModal) {
        fecharCarrinho.addEventListener('click', () => {
            carrinhoModal.style.display = 'none';
        });
    }

    // 4. Evento para fechar a modal de customização
    if (fecharCustomizacao && customizacaoModal) {
        fecharCustomizacao.addEventListener('click', () => {
            customizacaoModal.style.display = 'none';
            itemIdCustomizando = null; 
        });
    }

    // 5. Adicionar item customizado ao carrinho
    if (btnAdicionarCustomizado) {
        btnAdicionarCustomizado.addEventListener('click', () => {
            if (!itemIdCustomizando) return;

            const itemOriginal = encontrarItem(itemIdCustomizando.secaoId, itemIdCustomizando.itemId);
            if (!itemOriginal) return;

            const listaAdicionais = itemOriginal.adicionais || [];
            const precoAdicionais = calcularTotalAdicionais(listaAdicionais);
            const precoBase = itemOriginal.preco;
            const precoTotal = precoBase + precoAdicionais;

            const adicionaisFinais = [];
            for (const id in itemIdCustomizando.adicionaisSelecionados) {
                const quantidade = itemIdCustomizando.adicionaisSelecionados[id];
                const adicionalInfo = listaAdicionais.find(a => a.id === id);
                if (adicionalInfo && quantidade > 0) {
                    adicionaisFinais.push({
                        nome: adicionalInfo.nome,
                        preco: adicionalInfo.preco,
                        quantidade: quantidade
                    });
                }
            }

            const novoItemCarrinho = {
                id: itemOriginal.id,
                nome: itemOriginal.nome,
                precoBase: precoBase,
                adicionais: adicionaisFinais,
                precoTotal: precoTotal,
                quantidade: 1 
            };

            adicionarAoCarrinho(novoItemCarrinho);
            customizacaoModal.style.display = 'none';
            itemIdCustomizando = null;
        });
    }

    // 6. Fechar modais clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === carrinhoModal) {
            carrinhoModal.style.display = 'none';
        }
        if (event.target === customizacaoModal) {
            customizacaoModal.style.display = 'none';
            itemIdCustomizando = null;
        }
    });

    // 7. Evento de Finalizar Pedido (Apenas um placeholder)
    if (finalizarPedidoBtn) {
        finalizarPedidoBtn.addEventListener('click', () => {
            if (carrinho.length === 0) {
                exibirNotificacao("O carrinho está vazio!");
                return;
            }
            
            // Aqui você deve integrar com o WhatsApp ou sistema de pedidos
            alert("A função de Finalizar Pedido precisa ser implementada para enviar o pedido.");
        });
    }
});
