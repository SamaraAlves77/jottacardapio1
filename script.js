// A função principal que carrega e exibe os dados do cardápio
async function carregarCardapio() {
  try {
    // Faz a requisição para o arquivo JSON
    const response = await fetch('./cardapio.json');
    
    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const cardapioData = await response.json();

    // Itera sobre cada categoria no JSON e cria a seção correspondente na página
    for (const categoria in cardapioData) {
      if (cardapioData.hasOwnProperty(categoria)) {
        criarSecaoCardapio(categoria, cardapioData[categoria]);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar o cardápio:', error);
    // Adiciona uma mensagem de erro na página para o usuário
    document.body.innerHTML = `<h1>Erro ao carregar o cardápio. Tente novamente mais tarde.</h1>`;
  }
}

// Função para criar uma seção (título da categoria) no HTML
function criarSecaoCardapio(titulo, itens) {
  let containerId = '';
  switch(titulo) {
      case 'Hambúrgueres Artesanais':
          containerId = 'hamburgueres-artesanais-grid';
          break;
      case 'Combos e Família':
          containerId = 'combos-e-familia-grid';
          break;
      case 'Acompanhamentos':
          containerId = 'acompanhamentos-grid';
          break;
      case 'Bebidas':
          containerId = 'bebidas-grid';
          break;
      case 'Adicionais':
          containerId = 'adicionais-grid';
          break;
      default:
          console.warn(`Categoria desconhecida: ${titulo}`);
          return;
  }
  
  const container = document.getElementById(containerId);

  // Se o contêiner não for encontrado, não faz nada
  if (!container) {
    console.error(`Contêiner não encontrado para a categoria: ${titulo}`);
    return;
  }

  // Cria os itens e adiciona ao contêiner correto
  itens.forEach(item => {
    const itemElemento = criarItemCardapio(item);
    container.appendChild(itemElemento);
  });
}

// Função para criar cada item individual do cardápio
function criarItemCardapio(item) {
  const divItem = document.createElement('div');
  divItem.className = 'item-card';

  const img = document.createElement('img');
  // Ajusta o caminho da imagem, pois suas imagens estão na pasta 'imagem_cardapio'
  img.src = `imagem_cardapio/${item.imagem}`;
  img.alt = item.nome;
  divItem.appendChild(img);

  const h3 = document.createElement('h3');
  h3.textContent = item.nome;
  divItem.appendChild(h3);

  // Adiciona a descrição apenas se ela existir no JSON
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
  divItem.appendChild(btnAdicionar);

  return divItem;
}

// Inicia o carregamento do cardápio quando a página é carregada
document.addEventListener('DOMContentLoaded', carregarCardapio);
