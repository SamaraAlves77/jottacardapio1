// =======================================================
// VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM
// =======================================================
let carrinho = []; // Array para armazenar os itens do pedido

// Referências aos elementos da interface
const carrinhoModal = document.getElementById('carrinho-modal');
const fecharModalBtn = carrinhoModal ? carrinhoModal.querySelector('.fechar-modal') : null;
const carrinhoBtn = document.getElementById('carrinho-btn');
const contadorCarrinho = document.getElementById('contador-carrinho');
const carrinhoItensContainer = document.getElementById('carrinho-itens');
const carrinhoTotalSpan = document.getElementById('carrinho-total');
const notificacao = document.getElementById('notificacao');

// =======================================================
// FUNÇÕES DE MANIPULAÇÃO DO CARRINHO
// =======================================================

/**
 * Adiciona um item ao carrinho, atualiza a interface e exibe a notificação.
 * @param {object} item - O objeto do item a ser adicionado.
 */
function adicionarAoCarrinho(item) {
    // 1. Adiciona o item ao array do carrinho
    carrinho.push(item);
    
    // 2. Atualiza o contador de itens no cabeçalho
    if (contadorCarrinho) {
        contadorCarrinho.textContent = carrinho.length;
    }

    // 3. Atualiza a modal do carrinho (para ver a lista e total)
    atualizarModalCarrinho();
    
    // 4. Mostra a notificação de sucesso
    if (notificacao) {
        notificacao.classList.add('mostrar');
        
        // Esconde a notificação após 3 segundos
        setTimeout(() => {
            notificacao.classList.remove('mostrar');
        }, 3000);
    }
}

/**
 * Atualiza o conteúdo e o total exibidos na modal do carrinho.
 */
function atualizarModalCarrinho() {
    if (!carrinhoItensContainer || !carrinhoTotalSpan) return;

    // Limpa o conteúdo anterior
    carrinhoItensContainer.innerHTML = '';
    let total = 0;

    // Adiciona cada item do carrinho ao DOM
    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        
        itemDiv.innerHTML = `
            <span>${item.nome}</span>
            <span>R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
            <button class="btn-remover" data-index="${index}">X</button>
        `;
        carrinhoItensContainer.appendChild(itemDiv);
        total += item.preco;
    });

    // Atualiza o total
    carrinhoTotalSpan.textContent = total.toFixed(2).replace('.', ',');

    // Adiciona o listener para os novos botões de remoção
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            removerDoCarrinho(index);
        });
    });
}

/**
 * Remove um item do carrinho pelo seu índice.
 * @param {number} index - O índice do item a ser removido no array do carrinho.
 */
function removerDoCarrinho(index) {
    // Remove 1 elemento a partir do índice
    carrinho.splice(index, 1);
    
    // Atualiza o contador e a modal
    if (contadorCarrinho) {
        contadorCarrinho.textContent = carrinho.length;
    }
    atualizarModalCarrinho();
}

// =======================================================
// FUNÇÕES DE CARREGAMENTO DO CARDÁPIO (MANTIDAS/AJUSTADAS)
// =======================================================

// Função para criar cada item individual do cardápio
function criarItemCardapio(item) {
    const divItem = document.createElement('div');
    divItem.className = 'item-card';

    const img = document.createElement('img');
    // Ajusta o caminho da imagem: 'imagem_cardapio/'
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
    btnAdicionar.textContent = 'Adicionar';
    
    // =======================================================
    // FUNÇÃO CORRIGIDA: Adicionando o Event Listener aqui!
    // =======================================================
    btnAdicionar.addEventListener('click', () => {
        // Quando clicado, chama a função de adicionar, passando o objeto 'item'
        adicionarAoCarrinho(item); 
    });
    // =======================================================

    divItem.appendChild(btnAdicionar);
    return divItem;
}


// Sua função original para criar a seção (mantida)
function criarSecaoCardapio(titulo, itens) {
    let containerId = '';
    switch(titulo) {
        case 'Hambúrgueres Artesanais': containerId = 'hamburgueres-artesanais-grid'; break;
        case 'Combos e Família': containerId = 'combos-e-familia-grid'; break;
        case 'Acompanhamentos': containerId = 'acompanhamentos-grid'; break;
        case 'Bebidas': containerId = 'bebidas-grid'; break;
        case 'Adicionais': containerId = 'adicionais-grid'; break;
        default: console.warn(`Categoria desconhecida: ${titulo}`); return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contêiner não encontrado para a categoria: ${titulo}`);
        return;
    }

    itens.forEach(item => {
        const itemElemento = criarItemCardapio(item);
        container.appendChild(itemElemento);
    });
}

// Sua função original para carregar o JSON (mantida)
async function carregarCardapio() {
    try {
        const response = await fetch('./cardapio.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const cardapioData = await response.json();

        for (const categoria in cardapioData) {
            if (cardapioData.hasOwnProperty(categoria)) {
                criarSecaoCardapio(categoria, cardapioData[categoria]);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar o cardápio:', error);
        // Exibe uma mensagem de erro na página
        document.body.innerHTML = `<h1>Erro ao carregar o cardápio. Tente novamente mais tarde.</h1>`;
    }
}

// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicia o carregamento do cardápio
    carregarCardapio();

    // 2. Evento para abrir a modal do carrinho
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            carrinhoModal.style.display = 'block';
            // Garante que o carrinho está atualizado antes de abrir
            atualizarModalCarrinho(); 
        });
    }

    // 3. Evento para fechar a modal do carrinho pelo 'X'
    if (fecharModalBtn && carrinhoModal) {
        fecharModalBtn.addEventListener('click', () => {
            carrinhoModal.style.display = 'none';
        });
    }

    // 4. Fechar a modal clicando fora dela
    window.addEventListener('click', (event) => {
        if (event.target === carrinhoModal) {
            carrinhoModal.style.display = 'none';
        }
    });
    
    // 5. Lógica do Finalizar Pedido (Apenas um placeholder, precisa de implementação real)
    const btnFinalizar = document.getElementById('btn-finalizar-pedido');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio. Adicione itens antes de finalizar.");
                return;
            }
            
            // Aqui você deve implementar a lógica para enviar o pedido (ex: para WhatsApp ou API)
            alert("Pedido em preparação! (Funcionalidade de envio precisa ser implementada)");
            carrinhoModal.style.display = 'none';
        });
    }
    
    // 6. Lógica do Hamburger Menu (Se precisar de um toggle para o menu lateral)
    const hamburgerBtn = document.getElementById('hamburger-menu-btn');
    const navLinks = document.querySelector('.nav-links'); // Supondo que você quer mostrar/esconder a lista
    
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            // Adicione ou remova uma classe CSS que faz o toggle (ex: 'active')
            navLinks.classList.toggle('active');
        });
    }

});
