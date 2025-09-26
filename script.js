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

function renderizarOpcoesAdicionais() {
    const lista = document.getElementById('adicionais-opcoes-lista');
    const nomeItemSpan = document.getElementById('item-customizacao-nome');

    if (!lista || !itemEmCustomizacao || !nomeItemSpan) return;

    lista.innerHTML = '';
    nomeItemSpan.textContent = itemEmCustomizacao.nome;

    adicionaisGlobais.forEach(adicional => {
        // Verifica se o ID do adicional é uma string (como no seu JSON) ou um número
        const adicionalId = adicional.id; 
        const itemAtual = itemEmCustomizacao.adicionais.find(ad => ad.id === adicionalId) || { quantidade: 0 };
        const precoFormatado = adicional.preco.toFixed(2).replace('.', ',');
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'adicional-item-opcao';
        itemDiv.innerHTML = `
            <span>${adicional.nome} (R$ ${precoFormatado})</span>
            <div class="adicional-contador">
                <button class="btn-diminuir" data-id="${adicionalId}">-</button>
                <span data-id="${adicionalId}" id="count-${adicionalId}">${itemAtual.quantidade}</span>
                <button class="btn-aumentar" data-id="${adicionalId}">+</button>
            </div>
        `;
        lista.appendChild(itemDiv);
    });

    // Adiciona listeners para os botões de contar
    lista.querySelectorAll('.btn-aumentar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id; // ID pode ser string ou number
            alterarQuantidadeAdicional(id, 1);
        });
    });

    lista.querySelectorAll('.btn-diminuir').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id; // ID pode ser string ou number
            alterarQuantidadeAdicional(id, -1);
        });
    });

    atualizarResumoCustomizacao();
}

function alterarQuantidadeAdicional(id, mudanca) {
    if (!itemEmCustomizacao) return;
    
    // Converte para string para garantir que a comparação funcione corretamente, já que IDs podem ser strings.
    const adicionalId = String(id); 
    const adicionalIndex = itemEmCustomizacao.adicionais.findIndex(ad => String(ad.id) === adicionalId);
    const adicionalOriginal = adicionaisGlobais.find(ad => String(ad.id) === adicionalId);

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
        itemEmCustomizacao.adicionais.push({
            id: adicionalOriginal.id, // Mantém o ID original (string ou number)
            nome: adicionalOriginal.nome,
            preco: adicionalOriginal.preco,
            quantidade: novaQuantidade
        });
    }

    // Atualiza o contador na modal
    const countSpan = document.getElementById(`count-${adicionalId}`);
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
                throw new Error('Erro ao carregar cardapio.json. Verifique o caminho e nome do arquivo.');
            }
            return response.json();
        })
        .then(data => {
            // GUARDA AS OPÇÕES DE ADICIONAIS
            adicionaisGlobais = data.adicionais_opcoes || []; 

            const main = document.querySelector('main');
            if (!main) return;

            // RENDERIZA CADA CATEGORIA DA LISTA (data.categorias)
            data.categorias.forEach(categoriaData => {
                const categoriaNome = categoriaData.nome;
                const itens = categoriaData.itens;

                const section = document.createElement('section');
                section.className = 'menu-section';
                // Cria um ID amigável para navegação (usa o ID do JSON se houver)
                const sectionId = categoriaData.id || categoriaNome.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                section.id = sectionId;
                
                section.innerHTML = `<h2>${categoriaNome}</h2><div class="item-grid"></div>`;
                const grid = section.querySelector('.item-grid');

                itens.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'item-card';
                    card.setAttribute('data-id', item.id);
                    card.setAttribute('data-categoria', categoriaNome); // Usa o nome completo da categoria

                    const precoFormatado = item.preco.toFixed(2).replace('.', ',');

                    card.innerHTML = `
                        <img src="imagem_cardapio/${item.imagem}" alt="${item.nome}">
                        <h3>${item.nome}</h3>
                        <p>${item.descricao}</p>
                        <div class="price">R$ ${precoFormatado}</div>
                        <button class="btn-add" data-item-id="${item.id}" data-categoria-id="${categoriaData.id}">
                            Adicionar
                        </button>
                    `;
                    grid.appendChild(card);
                });
                main.appendChild(section); 
            });

            // Adiciona listeners aos botões "Adicionar"
            document.querySelectorAll('.btn-add').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.target.dataset.itemId;
                    const categoriaId = e.target.dataset.categoriaId;
                    
                    // Encontra a categoria no JSON
                    const categoria = data.categorias.find(c => c.id === categoriaId);
                    if (!categoria) return;

                    // Encontra o item dentro da categoria
                    const itemData = categoria.itens.find(item => item.id === itemId);
                    if (!itemData) return;

                    // Verifica se é um item customizável (ex: Hambúrgueres Artesanais - ID 'hamburgueres')
                    if (categoriaId === "hamburgueres") {
                        itemEmCustomizacao = {
                            ...itemData,
                            precoFinal: itemData.preco,
                            adicionais: []
                        };
                        abrirModalCustomizacao();
                    } else {
                        // Para itens não customizáveis, adiciona diretamente
                        const itemSimples = {
                            nome: itemData.nome,
                            preco: itemData.preco,
                            nomeExibicao: itemData.nome, 
                        };
                        adicionarAoCarrinho(itemSimples);
                    }
                });
            });

        })
        .catch(error => {
            console.error('Erro ao carregar ou renderizar o cardápio:', error);
            const main = document.querySelector('main');
            if(main) {
                 main.innerHTML = `<p style="text-align: center; color: var(--primary-color);">Não foi possível carregar o cardápio. Verifique se o arquivo cardapio.json existe e está com a estrutura correta.</p>`;
            }
        });
}

function abrirModalCustomizacao() {
    if (!customizacaoModal) return;
    
    renderizarOpcoesAdicionais();

    // Abre com display: flex para centralizar
    customizacaoModal.style.display = 'flex'; 
}


// =======================================================
// EVENT LISTENERS DE INICIALIZAÇÃO
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega o cardápio APENAS se estiver no cardapio.html (tem o elemento <main>)
    if (document.querySelector('main')) {
        carregarCardapio();
    }
    
    // 2. ABRIR MODAL DO CARRINHO
    if (carrinhoBtn && carrinhoModal) {
        carrinhoBtn.addEventListener('click', () => {
            carrinhoModal.style.display = 'flex'; // Abre com flex para centralizar
            atualizarModalCarrinho(); 
        });
    }

    // 3. FECHAR MODAIS (CARRINHO E CUSTOMIZAÇÃO) PELO 'X'
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

    // 4. FECHAR AMBAS AS MODAIS CLICANDO FORA
    window.addEventListener('click', (event) => {
        if (event.target === carrinhoModal || event.target === customizacaoModal) {
            event.target.style.display = 'none';
        }
    });

    // 5. Lógica do Botão "Adicionar ao Carrinho" da Customização
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
                quantidade: 1 
            };
            
            adicionarAoCarrinho(itemFinal); 
            customizacaoModal.style.display = 'none';
        });
    }
    
    // 6. Lógica do Finalizar Pedido (WhatsApp)
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
            
            const linkWhatsApp = `https://wa.me/5586981147596?text=${encodeURIComponent(mensagem)}`;
            window.open(linkWhatsApp, '_blank');
            
            // Limpa o carrinho
            carrinho = [];
            atualizarContadorCarrinho();
            carrinhoModal.style.display = 'none';
        });
    }

    // 7. Lógica do Hamburger Menu
    const navLinks = document.querySelector('.nav-links');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});
