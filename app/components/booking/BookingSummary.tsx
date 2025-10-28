// app/components/booking/BookingSummary.tsx
import React from "react";
import type { Service, CartItemComponent } from "~/types/api";

interface BookingSummaryProps {
    type: 'session' | 'product';
    service?: Service;
    cart?: CartItemComponent[];
    selectedDate?: string;
    selectedTime?: string;
    formatDate: (date: string) => string;
    paymentAmounts?: {
        depositAmount: number;
        remainingAmount: number;
        totalAmount: number;
    };
}

export function BookingSummary({ type, service, cart, selectedDate, selectedTime, formatDate, paymentAmounts }: BookingSummaryProps) {
    // Si c'est un panier, afficher tous les articles
    const hasCart = cart && cart.length > 0;

    return (
        <div className="booking-summary">
            <h3>Récapitulatif {hasCart ? `du panier (${cart.length} article${cart.length > 1 ? 's' : ''})` : 'de la commande'}</h3>
            <div className="summary-content">
                {hasCart ? (
                    // Affichage du panier
                    <>
                        <div className="cart-items-summary">
                            {cart.map((item, index) => {
                                const price = item.selectedCapacity?.price || item.service.price;
                                const totalItemPrice = price * item.quantity;
                                return (
                                    <div key={index} className="cart-summary-item">
                                        <div className="cart-item-header">
                                            <span className="item-name">{item.service.name}</span>
                                            <span className="item-quantity">x{item.quantity}</span>
                                        </div>
                                        {item.selectedCapacity && (
                                            <div className="item-capacity">{item.selectedCapacity.size}</div>
                                        )}
                                        <div className="item-price">{totalItemPrice}€</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="summary-divider"></div>
                    </>
                ) : service ? (
                    // Affichage d'un seul service
                    <>
                        <div className="summary-item">
                            <span>Service:</span>
                            <span>{service.name}</span>
                        </div>
                        <div className="summary-item">
                            <span>Description:</span>
                            <span>{service.description}</span>
                        </div>
                    </>
                ) : null}

                {type === 'session' && selectedDate && (
                    <>
                        <div className="summary-item">
                            <span>Date:</span>
                            <span>{formatDate(selectedDate)}</span>
                        </div>
                        <div className="summary-item">
                            <span>Heure:</span>
                            <span>{selectedTime}</span>
                        </div>
                    </>
                )}

                {paymentAmounts && type === 'session' ? (
                    <>
                        <div className="summary-item highlight">
                            <span>Acompte (30%):</span>
                            <span>{paymentAmounts.depositAmount}€</span>
                        </div>
                        <div className="summary-item">
                            <span>Solde après séance (70%):</span>
                            <span>{paymentAmounts.remainingAmount}€</span>
                        </div>
                        <div className="summary-item total">
                            <span>Total:</span>
                            <span>{paymentAmounts.totalAmount}€</span>
                        </div>
                    </>
                ) : (
                    <div className="summary-item total">
                        <span>Total:</span>
                        <span>{paymentAmounts?.totalAmount || 0}€</span>
                    </div>
                )}
            </div>
        </div>
    );
}