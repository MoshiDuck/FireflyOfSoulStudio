"use strict";
// Todo : src/scripts/pricing.ts
// Pricing page functionality
class PricingManager {
    constructor() {
        this.pricingCards = document.querySelectorAll('.pricing-card');
        this.pricingButtons = document.querySelectorAll('.pricing-btn');
        this.init();
    }
    init() {
        this.addCardInteractions();
        this.addButtonEvents();
        this.addScrollAnimations();
        console.log('✅ PricingManager initialized');
    }
    addCardInteractions() {
        this.pricingCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.pricingCards.forEach(c => {
                    if (c !== card && !c.classList.contains('featured')) {
                        c.style.opacity = '0.7';
                    }
                });
            });
            card.addEventListener('mouseleave', () => {
                this.pricingCards.forEach(c => {
                    c.style.opacity = '1';
                });
            });
        });
    }
    addButtonEvents() {
        this.pricingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                var _a;
                e.preventDefault();
                // Animation de clic
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
                // Ici vous pouvez ajouter la logique de réservation
                const card = button.closest('.pricing-card');
                const planName = ((_a = card === null || card === void 0 ? void 0 : card.querySelector('h3')) === null || _a === void 0 ? void 0 : _a.textContent) || 'Unknown Plan';
                console.log(`Booking: ${planName}`);
                // Animation de confirmation
                this.showBookingConfirmation(planName);
            });
        });
    }
    showBookingConfirmation(planName) {
        // Créer un élément de confirmation
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 213, 128, 0.95);
            color: #0D0D0D;
            padding: 2rem;
            border-radius: 8px;
            z-index: 1000;
            text-align: center;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        confirmation.innerHTML = `
            <h3 style="margin-bottom: 1rem; font-family: 'Cinzel', serif;">Booking Request Sent!</h3>
            <p style="margin-bottom: 1.5rem;">We'll contact you shortly about: <strong>${planName}</strong></p>
            <button id="close-confirmation" style="
                background: #0D0D0D;
                color: #FFD580;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-family: 'Inter', sans-serif;
            ">Close</button>
        `;
        document.body.appendChild(confirmation);
        // Ajouter l'événement de fermeture
        const closeBtn = document.getElementById('close-confirmation');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(confirmation);
            });
        }
        // Fermeture automatique après 5 secondes
        setTimeout(() => {
            if (document.body.contains(confirmation)) {
                document.body.removeChild(confirmation);
            }
        }, 5000);
    }
    addScrollAnimations() {
        // Utiliser GSAP pour les animations de défilement
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            // Animation des cartes de prix
            gsap.from('.pricing-card', {
                scrollTrigger: {
                    trigger: '.pricing-cards',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power2.out'
            });
            // Animation des services additionnels
            gsap.from('.service-item', {
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }
    }
}
// Gestionnaire de formulaire de contact
class ContactFormManager {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.init();
    }
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.addInputAnimations();
        }
    }
    addInputAnimations() {
        var _a;
        const inputs = (_a = this.form) === null || _a === void 0 ? void 0 : _a.querySelectorAll('input, textarea');
        inputs === null || inputs === void 0 ? void 0 : inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.transform = 'scale(1.02)';
                input.style.transition = 'transform 0.2s ease';
            });
            input.addEventListener('blur', () => {
                input.style.transform = 'scale(1)';
            });
        });
    }
    handleSubmit(e) {
        var _a;
        e.preventDefault();
        // Validation simple
        const formData = new FormData(this.form);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        if (!name || !email || !message) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }
        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }
        // Simulation d'envoi
        this.showMessage('Message sent! We will get back to you soon.', 'success');
        (_a = this.form) === null || _a === void 0 ? void 0 : _a.reset();
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    showMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 4px;
            color: #0D0D0D;
            font-family: 'Inter', sans-serif;
            z-index: 1000;
            background: ${type === 'success' ? '#FFD580' : '#ff6b6b'};
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        messageDiv.textContent = text;
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 5000);
    }
}
// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new PricingManager();
    new ContactFormManager();
    console.log('🎯 Pricing page fully loaded');
});
// Gestion des interactions au clavier
document.addEventListener('keydown', (e) => {
    // Échappe pour fermer les modales
    if (e.key === 'Escape') {
        const confirmation = document.querySelector('div[style*="position: fixed"]');
        if (confirmation) {
            document.body.removeChild(confirmation);
        }
    }
});
