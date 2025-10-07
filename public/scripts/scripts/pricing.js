"use strict";
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
                e.preventDefault();
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
                const card = button.closest('.pricing-card');
                const planName = card?.querySelector('h3')?.textContent || 'Unknown Plan';
                console.log(`Booking: ${planName}`);
                this.showBookingConfirmation(planName);
            });
        });
    }
    showBookingConfirmation(planName) {
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
        const closeBtn = document.getElementById('close-confirmation');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(confirmation);
            });
        }
        setTimeout(() => {
            if (document.body.contains(confirmation)) {
                document.body.removeChild(confirmation);
            }
        }, 5000);
    }
    addScrollAnimations() {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
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
        const inputs = this.form?.querySelectorAll('input, textarea');
        inputs?.forEach(input => {
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
        e.preventDefault();
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
        this.showMessage('Message sent! We will get back to you soon.', 'success');
        this.form?.reset();
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
document.addEventListener('DOMContentLoaded', () => {
    new PricingManager();
    new ContactFormManager();
    console.log('🎯 Pricing page fully loaded');
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const confirmation = document.querySelector('div[style*="position: fixed"]');
        if (confirmation) {
            document.body.removeChild(confirmation);
        }
    }
});
//# sourceMappingURL=pricing.js.map