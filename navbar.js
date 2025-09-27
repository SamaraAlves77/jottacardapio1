// navbar.js (Depende de cardapio.js para hamburgerBtn e navLinks)

// =======================================================
// FUNÇÕES DE NAVEGAÇÃO
// =======================================================

function toggleMenu() {
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

function setupNavbarListeners() {
    // Configura o botão do menu hamburger
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }

    // Fecha o menu mobile ao clicar em um link (para melhor UX mobile)
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }
}
