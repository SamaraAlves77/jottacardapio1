// =======================================================
// FUNÇÃO PRINCIPAL DE CARREGAMENTO DO CARDÁPIO (CORRIGIDA)
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
            // 1. GUARDA AS OPÇÕES DE ADICIONAIS
            adicionaisGlobais = data.adicionais_opcoes || []; 

            // 2. CORREÇÃO DA ESTRUTURA DO JSON:
            // Transforma o objeto principal em um array de categorias que o código espera.
            const categoriasArray = Object.entries(data)
                // Filtra para remover a chave 'adicionais_opcoes'
                .filter(([key]) => key !== 'adicionais_opcoes')
                .map(([nome, itens]) => {
                    // Cria um ID amigável para navegação
                    const idSlug = nome.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    return {
                        // Garante que a categoria "Hambúrgueres Artesanais" tenha o ID 'hamburgueres'
                        id: (nome === "Hambúrgueres Artesanais" ? "hamburgueres" : idSlug), 
                        nome: nome,
                        itens: itens
                    };
                });
            
            const main = document.querySelector('main');
            if (!main) return;

            // RENDERIZA CADA CATEGORIA DA LISTA (usando categoriasArray)
            categoriasArray.forEach(categoriaData => {
                const categoriaNome = categoriaData.nome;
                const itens = categoriaData.itens;

                const section = document.createElement('section');
                section.className = 'menu-section';
                // O ID agora é gerado a partir do objeto 'categoriaData'
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
                    
                    // Encontra a categoria no array de categorias
                    const categoria = categoriasArray.find(c => c.id === categoriaId); 
                    if (!categoria) return;

                    // Encontra o item dentro da categoria. String(item.id) garante a comparação correta.
                    const itemData = categoria.itens.find(item => String(item.id) === itemId);
                    if (!itemData) return;

                    // Verifica se é um item customizável (ID 'hamburgueres')
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
