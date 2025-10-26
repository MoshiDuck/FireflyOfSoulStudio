import React from 'react';
import { motion } from 'motion/react';
import type { CartItemComponent } from '~/types/api';

interface StoreCartProps {
    cart: CartItemComponent[];
    onUpdateQuantity: (index: number, quantity: number) => void;
    onRemoveItem: (index: number) => void;
    onCheckout: () => void;
}

export function StoreCart({ cart, onUpdateQuantity, onRemoveItem, onCheckout }: StoreCartProps) {
    const total = cart.reduce((sum, item) => {
        const price = item.selectedCapacity?.price || item.service.price;
        return sum + (price * item.quantity);
    }, 0);

    if (cart.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="cart-sidebar"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="cart-header">
                <h3>Votre Panier</h3>
                <span className="cart-count">{cart.length} article{cart.length > 1 ? 's' : ''}</span>
            </div>

            <div className="cart-items">
                {cart.map((item, index) => {
                    const price = item.selectedCapacity?.price || item.service.price;
                    return (
                        <div key={index} className="cart-item">
                            <div className="cart-item-info">
                                <div className="cart-item-name">{item.service.name}</div>
                                {item.selectedCapacity && (
                                    <div className="cart-item-capacity">{item.selectedCapacity.size}</div>
                                )}
                                <div className="cart-item-price">{price}€</div>
                            </div>

                            <div className="cart-item-controls">
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                                        className="quantity-btn"
                                    >
                                        −
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => onRemoveItem(index)}
                                    className="remove-btn"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="cart-footer">
                <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-price">{total}€</span>
                </div>
                <motion.button
                    onClick={onCheckout}
                    className="checkout-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Commander ({total}€)
                </motion.button>
            </div>
        </motion.div>
    );
}