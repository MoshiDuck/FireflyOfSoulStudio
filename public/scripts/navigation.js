"use strict";
// Navigation active state management
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.setActiveNavigation();
    }
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        // Simplifier le nom de la page
        if (page === 'index.html' || page === '' || page === '/') {
            return 'home';
        }
        return page.replace('.html', '');
    }
    setActiveNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            const href = button.getAttribute('href');
            if (!href)
                return;
            // Déterminer la page cible du bouton
            let targetPage = href.replace('.html', '');
            if (targetPage === 'index' || targetPage === '' || targetPage === '/') {
                targetPage = 'home';
            }
            // Ajouter la classe active si c'est la page actuelle
            if (targetPage === this.currentPage) {
                button.classList.add('active');
            }
            else {
                button.classList.remove('active');
            }
        });
        console.log(`✅ Navigation active set for: ${this.currentPage}`);
    }
}
// Initialiser la navigation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
});
