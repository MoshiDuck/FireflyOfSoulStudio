// Info : app/components/booking/BookingSummary.tsx
import React from 'react';
import type { Service } from '~/types/api';

interface BookingSummaryProps {
    type: 'session' | 'product';
    service: Service;
    selectedDate?: string;
    selectedTime?: string;
    formatDate: (date: string) => string;
}

export const BookingSummary = ({ type, service, selectedDate, selectedTime, formatDate }: BookingSummaryProps) => (
    <div className="booking-summary">
        <div className="summary-service">Votre {type === 'session' ? 'Réservation' : 'Commande'}</div>
        {type === 'session' && selectedDate && selectedTime ? (
            <div className="summary-details">
                {formatDate(selectedDate)} à {selectedTime}
            </div>
        ) : (
            <div className="summary-details">
                {service.name}
            </div>
        )}
        <div className="summary-price">{service.price}€</div>

        <div className="cart-summary">
            <div className="cart-summary-item">
                <span>{service.name}</span>
                <span>{service.price}€</span>
            </div>
        </div>
    </div>
);