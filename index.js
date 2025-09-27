// index.js (Orquestrador)

// =======================================================
// FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL
// =======================================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Carrega o HTML dinamicamente (Função de cardapio.js)
    const navbarOK = await loadHTML('navbar.html', 'navbar-container');
    const modalOK = await loadHTML('modal_carrinho.html', 'modal-container');
    
    if (navbarOK && modalOK) {
        
        // 2. Re-liga os elementos injetados às variáveis JS (Função de cardapio.js)
        rebindElements(); 
        
        // 3. Configura os Listeners da Navbar (Função de navbar.js)
        setupNavbarListeners();
        
        // 4. Carrega os dados do JSON e popula o cardápio (Função de cardapio.js)
        await carregarCardapio(); 
        
        // 5. Configura os Listeners de botões e modais (Função de modal_carrinho.js)
        setupEventListeners();
        
        // 6. Garante que o contador inicial seja 0 (Função de modal_carrinho.js)
        updateContadorCarrinho();
        
    } else {
        console.error("Não foi possível carregar todas as partes do HTML. Verifique se 'navbar.html' e 'modal_carrinho.html' existem.");
    }
});
