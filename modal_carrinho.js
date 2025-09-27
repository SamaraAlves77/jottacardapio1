// modal_carrinho.js (Depende de cardapio.js para variáveis globais e DOM refs)

// =======================================================
// FUNÇÕES DE MANIPULAÇÃO DO CARRINHO
// =======================================================

function updateContadorCarrinho() {
    // Usa variáveis definidas em cardapio.js
    const totalItens = carrinho.length; 
    if (contadorCarrinho) contadorCarrinho.textContent = totalItens;
    if (fabContadorCarrinho) fabContadorCarrinho.textContent = totalItens;
}

function openCarrinhoModal() {
    // Usa variáveis definidas em cardapio.js
    if (carrinhoModal) {
        carrinhoModal.classList.add('ativo');
        
        // Limpa o status da localização e as coordenadas ao abrir o modal
        if (localizacaoStatus) {
            localizacaoStatus.innerText = '';
        }
        coordenadasEnviadas = ''; 
        
        // Limpa os campos do formulário ao abrir o modal
        document.getElementById('nome-cliente').value = '';
        document.getElementById('endereco-cliente').value = '';
        document.getElementById('telefone-cliente').value = '';
        document.getElementById('observacoes-pedido').value = '';
        const formaPagamentoSelect = document.getElementById('forma-pagamento');
        if(formaPagamentoSelect) formaPagamentoSelect.selectedIndex = 0; 
        
        atualizarModalCarrinho();
    }
}

function adicionarAoCarrinho(item) {
    carrinho.push(item);
    
    updateContadorCarrinho();

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
    
    updateContadorCarrinho();

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

// =======================================================
// FUNÇÕES DE CUSTOMIZAÇÃO
// =======================================================

function abrirModalCustomizacao(item) {
    if (!customizacaoModal) return;

    // Cria uma cópia do item para customização
    itemEmCustomizacao = { 
        ...item,
        adicionais: [], 
        precoFinal: item.preco 
    };

    document.getElementById('item-customizacao-nome').textContent = item.nome;
    document.getElementById('preco-base-customizacao').textContent = item.preco.toFixed(2).replace('.', ',');
    
    renderizarOpcoesAdicionais();
    customizacaoModal.classList.add('ativo'); 
}

function renderizarOpcoesAdicionais() {
    if (!listaAdicionaisContainer) return;

    listaAdicionaisContainer.innerHTML = '';
    
    adicionaisGlobais.forEach(adicional => {
        const selecionado = itemEmCustomizacao.adicionais.find(a => a.nome === adicional.nome);
        const quantidade = selecionado ? selecionado.quantidade : 0;
        
        const div = document.createElement('div');
        div.className = 'adicional-item-opcao';
        
        div.innerHTML = `
            <span>${adicional.nome}</span> 
            <div class="adicional-contador">
                <span class="preco-adicional">R$ ${adicional.preco.toFixed(2).replace('.', ',')}</span>
                <div class="contador-botoes">
                    <button class="btn-diminuir-adicional" data-nome="${adicional.nome}">-</button>
                    <span class="quantidade-adicional">${quantidade}</span>
                    <button class="btn-aumentar-adicional" data-nome="${adicional.nome}">+</button>
                </div>
            </div>
        `;
        listaAdicionaisContainer.appendChild(div);
    });
    
    adicionarListenersContador();
    atualizarResumoCustomizacao();
}

function adicionarListenersContador() {
    document.querySelectorAll('.btn-aumentar-adicional').forEach(btn => {
        btn.onclick = () => { gerenciarAdicional(btn.dataset.nome, 1); };
    });
    
    document.querySelectorAll('.btn-diminuir-adicional').forEach(btn => {
        btn.onclick = () => { gerenciarAdicional(btn.dataset.nome, -1); };
    });
}

function gerenciarAdicional(nomeAdicional, delta) {
    const adicionalData = adicionaisGlobais.find(a => a.nome === nomeAdicional);
    if (!adicionalData) return;

    let adicionalSelecionado = itemEmCustomizacao.adicionais.find(a => a.nome === nomeAdicional);

    if (!adicionalSelecionado) {
        if (delta > 0) {
            itemEmCustomizacao.adicionais.push({
                ...adicionalData,
                quantidade: 1
            });
        }
    } else {
        adicionalSelecionado.quantidade += delta;
        
        if (adicionalSelecionado.quantidade <= 0) {
            itemEmCustomizacao.adicionais = itemEmCustomizacao.adicionais.filter(a => a.nome !== nomeAdicional);
        }
    }
    
    renderizarOpcoesAdicionais();
}

function atualizarResumoCustomizacao() {
    let precoAdicionais = 0;
    
    itemEmCustomizacao.adicionais.forEach(ad => {
        precoAdicionais += ad.preco * ad.quantidade;
    });

    const precoBase = itemEmCustomizacao.preco;
    const precoTotal = precoBase + precoAdicionais;

    document.getElementById('preco-adicionais-customizacao').textContent = precoAdicionais.toFixed(2).replace('.', ',');
    document.getElementById('preco-total-customizacao').textContent = precoTotal.toFixed(2).replace('.', ',');
    
    itemEmCustomizacao.precoFinal = precoTotal;
}

// =======================================================
// FUNÇÕES DE GEOLOCALIZAÇÃO
// =======================================================

function obterLocalizacao() {
    if (navigator.geolocation) {
        if (localizacaoStatus) {
            localizacaoStatus.innerText = 'Aguardando permissão...';
            localizacaoStatus.style.color = '#ccc';
        }

        navigator.geolocation.getCurrentPosition(
            sucessoLocalizacao,
            erroLocalizacao,
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        if (localizacaoStatus) {
            localizacaoStatus.innerText = 'Erro: Geolocalização não suportada.';
            localizacaoStatus.style.color = '#e53935';
        }
        coordenadasEnviadas = '';
    }
}

function sucessoLocalizacao(posicao) {
    const lat = posicao.coords.latitude;
    const lon = posicao.coords.longitude;
    
    // CORREÇÃO CRÍTICA: Sintaxe correta para o link do Google Maps.
    const linkMapa = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    coordenadasEnviadas = `Localização (Lat: ${lat}, Lon: ${lon}). Link: ${linkMapa}`;
    
    if (localizacaoStatus) {
        localizacaoStatus.innerHTML = '✅ Localização Anexada!';
        localizacaoStatus.style.color = '#25d366'; // Verde do WhatsApp
    }
}

function erroLocalizacao(erro) {
    let mensagem;
    
    switch (erro.code) {
        case erro.PERMISSION_DENIED:
            mensagem = "❌ Permissão negada. Ative nas configurações do navegador.";
            break;
        case erro.POSITION_UNAVAILABLE:
            mensagem = "❌ Sinal fraco. Posição não determinada.";
            break;
        case erro.TIMEOUT:
            mensagem = "❌ Tempo esgotado. Tente novamente.";
            break;
        default:
            mensagem = "❌ Erro desconhecido: " + erro.message;
    }
    
    if (localizacaoStatus) {
        localizacaoStatus.innerText = mensagem;
        localizacaoStatus.style.color = '#e53935'; // Cor de erro
    }
    coordenadasEnviadas = '';
}

// =======================================================
// FUNÇÃO DE CONFIGURAÇÃO DE LISTENERS
// =======================================================

function setupEventListeners() {
    // ABRIR MODAL DO CARRINHO (Desktop e FAB)
    if (carrinhoBtn) {
        carrinhoBtn.addEventListener('click', openCarrinhoModal);
    }
    if (fabCarrinho) {
        fabCarrinho.addEventListener('click', openCarrinhoModal);
    }
    // Adiciona o listener para o Botão de Localização
    if (btnAnexarLocalizacao) {
        btnAnexarLocalizacao.addEventListener('click', obterLocalizacao);
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

    // ADICIONAR ITEM CUSTOMIZADO AO CARRINHO
    if (btnAdicionarCustomizado) {
        btnAdicionarCustomizado.addEventListener('click', () => {
            if (!itemEmCustomizacao || itemEmCustomizacao.precoFinal === undefined) {
                alert("Erro na customização. Tente novamente.");
                return;
            }
            
            const adicionaisSelecionados = itemEmCustomizacao.adicionais
                .map(ad => `${ad.nome} x${ad.quantidade}`).join(', ');
            
            const nomeFinal = `${itemEmCustomizacao.nome}${adicionaisSelecionados ? ` (+ Adicionais)` : ''}`;

            const itemFinal = {
                nome: itemEmCustomizacao.nome,
                preco: itemEmCustomizacao.precoFinal,
                nomeExibicao: nomeFinal,
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
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio.");
                return;
            }
            
            const nomeCliente = document.getElementById('nome-cliente').value;
            const formaPagamento = document.getElementById('forma-pagamento').value;
            const enderecoCliente = document.getElementById('endereco-cliente').value;
            const telefoneCliente = document.getElementById('telefone-cliente').value;
            const observacoesPedido = document.getElementById('observacoes-pedido').value; 

            
            if (!nomeCliente || !enderecoCliente || !telefoneCliente || !formaPagamento) {
                alert("Por favor, preencha todos os campos (Nome, Endereço, Telefone e Pagamento) para finalizar o pedido.");
                return;
            }

            let mensagem = `*PEDIDO JOTTAV BURGUER*\n\n`;
            mensagem += `*Nome:* ${nomeCliente}\n`;
            mensagem += `*Telefone:* ${telefoneCliente}\n`; 
            mensagem += `*Endereço:* ${enderecoCliente}\n`;
            
            // Adiciona a Localização, se capturada
            if (coordenadasEnviadas) {
                mensagem += `*Localização GPS:* ${coordenadasEnviadas}\n`;
            }
            
            mensagem += `*Pagamento:* ${formaPagamento.toUpperCase().replace('_', ' ')}\n`;
            
            // Adiciona as observações
            if (observacoesPedido) {
                mensagem += `*Obs:* ${observacoesPedido}\n`;
            }
            
            mensagem += `\n*ITENS DO PEDIDO (${carrinho.length}):*\n`;
            
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
            
            // Limpa o carrinho e fecha o modal após o envio
            carrinho = [];
            updateContadorCarrinho();
            carrinhoModal.classList.remove('ativo');
        });
    }
}
