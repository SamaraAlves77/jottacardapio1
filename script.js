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

// Elementos da Customização 
const customizacaoModal = document.getElementById('customizacao-modal');
const fecharCustomizacaoBtn = customizacaoModal ? customizacaoModal.querySelector('.fechar-customizacao') : null;
const btnAdicionarCustomizado = document.getElementById('btn-adicionar-customizado');


// =======================================================
// FUNÇÕES DE MANIPULAÇÃO DO CARRINHO
// =======================================================

function atualizarContadorCarrinho() {
    if (contadorCarrinho) {
        // Reduz para somar a quantidade de todos os itens no carrinho
        contadorCarrinho.textContent = carrinho.reduce((total, item) => total + item.quantidade, 0);
    }
}

function calcularTotalCarrinho() {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function atualizarModalCarrinho() {
    if (!carrinhoItensContainer || !carrinhoTotalSpan) return;

    carrinhoItensContainer.innerHTML = '';
    
    if (carrinho.length === 0) {
        carrinhoItensContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Seu carrinho está vazio.</p>';
        carrinhoTotalSpan.textContent = '0.00';
        return;
    }

    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrinho-item';
        
        // Calcula o preço total deste item (Preço unitário * Quantidade)
        const precoFormatado = (item.preco * item.quantidade).toFixed(2).replace('.', ',');

        itemDiv.innerHTML = `
            <div>
                <strong>${item.nomeExibicao}</strong> (${item.quantidade}x)
                <button class="btn-remover" data-index="${index}">Remover</button>
            </div>
            <span>R$ ${precoFormatado}</span>
        `;
        carrinhoItensContainer.appendChild(itemDiv);
    });

    // Adiciona o listener para remover item
    carrinhoItensContainer.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            removerDoCarrinho(index);
        });
    });

    const total = calcularTotalCarrinho();
    carrinhoTotalSpan.textContent = total.toFixed(2).replace('.', ',');
}

function adicionarAoCarrinho(item) {
    // Procura se o item (incluindo nomeExibicao, que diferencia adicionais) já existe
    const itemExistente = carrinho.find(c => c.nomeExibicao === item.nomeExibicao);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        // Usa o spread operator para garantir que o item seja copiado e tenha a quantidade inicial
        carrinho.push({ ...item, quantidade: 1 });
    }

    atualizarContadorCarrinho();
    mostrarNotificacao(`${item.nome} adicionado!`);
}

function removerDoCarrinho(index) {
    if (index >= 0 && index < carrinho.length) {
        carrinho[index].quantidade -= 1;
        if (carrinho[index].quantidade <= 0) {
            carrinho.splice(index, 1); // Remove o item do array se a quantidade for 0
        }
        atualizarContadorCarrinho();
        atualizarModalCarrinho();
    }
}

function mostrarNotificacao(mensagem) {
    if (!notificacao) return;
    notificacao.textContent = mensagem;
    notificacao.classList.add('mostrar');
    setTimeout(() => {
        notificacao.classList.remove('mostrar');
    }, 2000);
}


// =======================================================
// FUNÇÕES DE CUSTOMIZAÇÃO (ADICIONAIS)
// =======================================================

// A função inicializarAdicionais foi removida e seu conteúdo está dentro de carregarCardapio para simplificar.

function renderizarOpcoesAdicionais() {
    const lista = document.getElementById('adicionais-opcoes-lista');
    const nomeItemSpan = document.getElementById('item-customizacao-nome');

    if (!lista || !itemEmCustomizacao || !nomeItemSpan) return;

    lista.innerHTML = '';
    nomeItemSpan.textContent = itemEmCustomizacao.nome;

    adicionaisGlobais.forEach(adicional => {
        // Encontra o adicional no item em customização, se existir
        const itemAtual = itemEmCustomizacao.adicionais.find(ad => ad.id === adicional.id) || { quantidade: 0 };
        const precoFormatado = adicional.preco.toFixed(2).replace('.', ',');
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'adicional-item-opcao';
        itemDiv.innerHTML = `
            <span>${adicional.nome} (R$ ${precoFormatado})</span>
            <div class="adicional-contador">
                <button class="btn-diminuir" data-id="${adicional.id}">-</button>
                <span data-id="${adicional.id}" id="count-${adicional.id}">${itemAtual.quantidade}</span>
                <button class="btn-aumentar" data-id="${adicional.id}">+</button>
            </div>
        `;
        lista.appendChild(itemDiv);
    });

    // Adiciona listeners para os botões de contar
    lista.querySelectorAll('.btn-aumentar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            alterarQuantidadeAdicional(id, 1);
        });
    });

    lista.querySelectorAll('.btn-diminuir').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            alterarQuantidadeAdicional(id, -1);
        });
    });

    atualizarResumoCustomizacao();
}

function alterarQuantidadeAdicional(id, mudanca) {
    const adicionalIndex = itemEmCustomizacao.adicionais.findIndex(ad => ad.id === id);
    const adicionalOriginal = adicionaisGlobais.find(ad => ad.id === id);

    if (!adicionalOriginal) return;

    let novaQuantidade = (adicionalIndex !== -1 ? itemEmCustomizacao.adicionais[adicionalIndex].quantidade : 0) + mudanca;

    if (novaQuantidade < 0) novaQuantidade = 0;

    if (adicionalIndex !== -1) {
        if (novaQuantidade === 0) {
            itemEmCustomizacao.adicionais.splice(adicionalIndex, 1); // Remove se for 0
        } else {
            itemEmCustomizacao.adicionais[adicionalIndex].quantidade = novaQuantidade;
        }
    } else if (novaQuantidade > 0) {
        // Adiciona um novo adicional se a quantidade for maior que zero
        itemEmCustomizacao.adicionais.push({
            id: id,
            nome: adicionalOriginal.nome,
            preco: adicionalOriginal.preco,
            quantidade: novaQuantidade
        });
    }

    // Atualiza o contador na modal
    const countSpan = document.getElementById(`count-${id}`);
    if (countSpan) countSpan.textContent = novaQuantidade;

    atualizarResumoCustomizacao();
}

function atualizarResumoCustomizacao() {
    const precoBaseSpan = document.getElementById('preco-base-customizacao');
    const precoAdicionaisSpan = document.getElementById('preco-adicionais-customizacao');
    const precoTotalSpan = document.getElementById('preco-total-customizacao');

    if (!itemEmCustomizacao || !precoBaseSpan || !precoAdicionaisSpan || !precoTotalSpan) return;

    const precoBase = itemEmCustomizacao.preco;
    let precoAdicionais = 0;

    itemEmCustomizacao.adicionais.forEach(ad => {
        precoAdicionais += ad.preco * ad.quantidade;
    });

    const precoTotal = precoBase + precoAdicionais;
    itemEmCustomizacao.precoFinal = precoTotal;

    precoBaseSpan.textContent = precoBase.toFixed(2).replace('.', ',');
    precoAdicionaisSpan.textContent = precoAdicionais.toFixed(2).replace('.', ',');
    precoTotalSpan.textContent = precoTotal.toFixed(2).replace('.', ',');
}

// =======================================================
// FUNÇÃO PRINCIPAL DE CARREGAMENTO DO CARDÁPIO
// =======================================================

function carregarCardapio() {
    fetch('cardapio.json')
        .then(response => {
            if (!response.ok) {
                // Se a resposta não for OK (ex: arquivo não encontrado), lança um erro
                throw new Error('Erro ao carregar cardapio.json. Verifique o caminho do arquivo.');
            }
            return response.json();
        })
        .then(data => {
            // Guarda as opções de adicionais para uso posterior
            adicionaisGlobais = data.adicionais_opcoes || []; 

            const main = document.querySelector('main');
            if (!main) return; // Se não estiver na página cardapio.html, interrompe

            // Renderiza cada seção
            for (const categoria in data) {
                if (categoria === "adicionais_opcoes") continue; // Pula os adicionais
                
                // Cria a seção do cardápio
                const section = document.createElement('section');
                section.className = 'menu-section';
                // Cria um ID amigável para navegação (ex: #hamburgueres-artesanais)
                section.id = categoria.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
                
                section.innerHTML = `<h2>${categoria}</h2><div class="item-grid"></div>`;
                const grid = section.querySelector('.item-grid');

                // Itera sobre os itens dentro da categoria
                data[categoria].forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'item-card';
                    card.setAttribute('data-id', item.id);
                    card.setAttribute('data-categoria', categoria);

                    const precoFormatado = item.preco.toFixed(2).replace('.', ',');

                    card.innerHTML = `
                        <img src="imagem_cardapio/${item.imagem}" alt="${item.nome}">
                        <h3>${item.nome}</h3>
                        <p>${item.descricao}</p>
                        <div class="price">R$ ${precoFormatado}</div>
                        <button class="btn-add" data-id="${item.id}" data-categoria="${categoria}">
                            Adicionar
                        </button>
                    `;
                    grid.appendChild(card);
                });
                main.appendChild(section); // Adiciona a seção ao MAIN
            }

            // Adiciona listeners aos botões "Adicionar"
            document.querySelectorAll('.btn-add').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = parseInt(e.target.dataset.id);
                    const categoria = e.target.dataset.categoria;
                    
                    const itemData = data[categoria].find(item => item.id === itemId);
                    
                    if (!itemData) return;

                    // Verifica se é um item customizável (ex: Hambúrgueres Artesanais)
                    if (categoria === "Hambúrgueres Artesanais") {
                        itemEmCustomizacao = {
                            ...itemData,
                            precoFinal: itemData.preco,
                            adicionais: [] // Sempre começa a customização sem adicionais
                        };
                        abrirModalCustomizacao();
                    } else {
                        // Para itens não customizáveis, adiciona diretamente
                        const itemSimples = {
                            nome: itemData.nome,
                            preco: itemData.preco,
                            nomeExibicao: itemData.nome, 
                            quantidade: 1
                        };
                        adicionarAoCarrinho(itemSimples);
                    }
                });
            });

        })
        .catch(error => {
            console.error('Erro ao carregar ou renderizar o cardápio:', error);
            // Mensagem de erro para o usuário (opcional)
            const main = document.querySelector('main');
            if(main) {
                 main.innerHTML = `<p style="text-align: center; color: var(--primary-color);">Não foi possível carregar o cardápio. Tente recarregar a página.</p>`;
            }
        });
}

function abrirModalCustomizacao() {
    if (!customizacaoModal) return;
    
    renderizarOpcoesAdicionais();

    // CORREÇÃO MANTIDA: Abre com display: flex para centralizar
    customizacaoModal.style.display = 'flex'; 
}


// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Se estiver na página do cardápio, carrega os dados
    if (document.querySelector('main')) {
        carregarCardapio();
    }
    
    // 1. ABRIR MODAL DO CARRINHO
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            // CORREÇÃO MANTIDA: Abre com display: flex para centralizar
            carrinhoModal.style.display = 'flex'; 
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

    // 4. Lógica do Botão "Adicionar ao Carrinho" da Customização
    if (btnAdicionarCustomizado) {
        btnAdicionarCustomizado.addEventListener('click', () => {
            if (!itemEmCustomizacao) return;

            const adicionaisSelecionados = itemEmCustomizacao.adicionais
                .map(ad => `${ad.nome} x${ad.quantidade}`).join(', ');
            
            // Cria um nome de exibição mais descritivo
            const nomeFinal = `${itemEmCustomizacao.nome} (${adicionaisSelecionados || 'Sem Adicionais'})`;

            const itemFinal = {
                nome: itemEmCustomizacao.nome,
                preco: itemEmCustomizacao.precoFinal,
                nomeExibicao: nomeFinal,
                adicionais: itemEmCustomizacao.adicionais,
                quantidade: 1 // Adiciona apenas uma unidade do item customizado de uma vez
            };
            
            adicionarAoCarrinho(itemFinal); 
            customizacaoModal.style.display = 'none';
        });
    }
    
    // 5. Lógica do Finalizar Pedido (WhatsApp)
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            const nome = document.getElementById('nome-cliente').value;
            const endereco = document.getElementById('endereco-cliente').value;
            const telefone = document.getElementById('telefone-cliente').value;

            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio.");
                return;
            }
            
            let mensagem = `*PEDIDO JottaV Burguer*\n\n`;
            mensagem += `*Cliente:* ${nome || 'Não Informado'}\n`;
            mensagem += `*Endereço:* ${endereco || 'Não Informado'}\n`;
            mensagem += `*Telefone:* ${telefone || 'Não Informado'}\n\n`;
            mensagem += `*ITENS:*\n`;
            
            carrinho.forEach(item => {
                const precoTotalItem = (item.preco * item.quantidade).toFixed(2).replace('.', ',');
                mensagem += `- ${item.nomeExibicao} (${item.quantidade}x) = R$ ${precoTotalItem}\n`;
            });
            
            const total = calcularTotalCarrinho();
            mensagem += `\n*TOTAL DO PEDIDO: R$ ${total.toFixed(2).replace('.', ',')}*`;
            
            // Substitua '5586981147596' pelo seu número de WhatsApp
            const linkWhatsApp = `https://wa.me/5586981147596?text=${encodeURIComponent(mensagem)}`;
            window.open(linkWhatsApp, '_blank');
            
            // Limpa o carrinho
            carrinho = [];
            atualizarContadorCarrinho();
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
