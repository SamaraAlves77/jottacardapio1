// =======================================================
// VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM
// =======================================================
let carrinho = []; // Array para armazenar os itens do pedido

// Referências aos elementos da interface (Modal e Botões)
const carrinhoModal = document.getElementById('carrinho-modal');
// Verificação de existência para evitar erros, caso o elemento ainda não esteja carregado
const fecharModalBtn = carrinhoModal ? carrinhoModal.querySelector('.fechar-modal') : null; 
const carrinhoBtn = document.getElementById('carrinho-btn');
const contadorCarrinho = document.getElementById('contador-carrinho');
const carrinhoItensContainer = document.getElementById('carrinho-itens');
const carrinhoTotalSpan = document.getElementById('carrinho-total');
const notificacao = document.getElementById('notificacao');
const btnFinalizar = document.getElementById('btn-finalizar-pedido');
const hamburgerBtn = document.getElementById('hamburger-menu-btn');


// =======================================================
// FUNÇÕES DE MANIPULAÇÃO DO CARRINHO (NOVAS FUNÇÕES)
// =======================================================

/**
 * Adiciona um item ao carrinho, atualiza o contador e exibe a notificação.
 * @param {object} item - O objeto do item a ser adicionado.
 */
function adicionarAoCarrinho(item) {
    // 1. Adiciona o item ao array do carrinho
    carrinho.push(item); 
    
    // 2. Atualiza o contador de itens no cabeçalho
    if (contadorCarrinho) {
        contadorCarrinho.textContent = carrinho.length;
    }

    // 3. Atualiza a modal (lista de itens e total)
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

/**
 * Atualiza o conteúdo e o total exibidos na modal do carrinho.
 */
function atualizarModalCarrinho() {
    if (!carrinhoItensContainer || !carrinhoTotalSpan) return;

    // Limpa o conteúdo anterior
    carrinhoItensContainer.innerHTML = '';
    let total = 0;

    // Adiciona cada item do carrinho ao DOM e calcula o total
    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        
        // Garante a exibição do preço com duas casas decimais
        const precoFormatado = item.preco.toFixed(2).replace('.', ',');

        itemDiv.innerHTML = `
            <span>${item.nome}</span>
            <span>R$ ${precoFormatado}</span>
            <button class="btn-remover" data-index="${index}">X</button>
        `;
        carrinhoItensContainer.appendChild(itemDiv);
        total += item.preco;
    });

    // Atualiza o total
    carrinhoTotalSpan.textContent = total.toFixed(2).replace('.', ',');

    // Adiciona o listener para os botões de remoção criados dinamicamente
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // O dataset pega o atributo 'data-index'
            const index = e.target.getAttribute('data-index'); 
            removerDoCarrinho(index);
        });
    });
}


// =======================================================
// FUNÇÕES DE CARREGAMENTO DO CARDÁPIO (Ajuste no Botão)
// =======================================================

// Função para criar cada item individual do cardápio
function criarItemCardapio(item) {
    const divItem = document.createElement('div');
    divItem.className = 'item-card';

    const img = document.createElement('img');
    // Caminho da imagem (ajustado para sua pasta)
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
    // CORREÇÃO ESSENCIAL: Adicionando o Event Listener ao botão
    // =======================================================
    btnAdicionar.addEventListener('click', () => {
        adicionarAoCarrinho(item); 
    });
    // =======================================================

    divItem.appendChild(btnAdicionar);
    return divItem;
}


// Função para criar a seção do cardápio (MANTIDA)
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

// A função principal que carrega e exibe os dados do cardápio (MANTIDA)
async function carregarCardapio() {
    try {
        // Faz a requisição para o arquivo JSON
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
        document.body.innerHTML = `<h1>Erro ao carregar o cardápio. Tente novamente mais tarde.</h1>`;
    }
}

// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// =======================================================

// Inicia o carregamento do cardápio e configura os botões
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicia o carregamento do cardápio
    carregarCardapio();

    // 2. Evento para abrir a modal do carrinho
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            carrinhoModal.style.display = 'block';
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
    
    // 5. Lógica do Finalizar Pedido (Apenas um alerta placeholder)
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio. Adicione itens antes de finalizar.");
                return;
            }
            // Implementação real deve ser feita aqui (ex: envio para WhatsApp/API)
            alert(`Pedido finalizado! Total: R$ ${carrinhoTotalSpan.textContent}. Entraremos em contato!`);
            // Resetar o carrinho após finalizar (opcional, dependendo da sua lógica)
            // carrinho = [];
            // contadorCarrinho.textContent = 0;
            carrinhoModal.style.display = 'none';
        });
    }
    
    // 6. Lógica do Hamburger Menu (Apenas toggle de classe)
    const navLinks = document.querySelector('.nav-links');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            // Requer que você tenha um CSS para a classe 'active'
            navLinks.classList.toggle('active'); 
        });
    }

});
