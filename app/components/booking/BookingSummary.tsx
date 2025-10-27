// Info : app/components/booking/BookingSummary.tsx
import React from "react";
import type { Service } from "~/types/api";

interface BookingSummaryProps {
    type: 'session' | 'product';
    service: Service;
    selectedDate?: string;
    selectedTime?: string;
    formatDate: (date: string) => string;
    paymentAmounts?: {
        depositAmount: number;
        remainingAmount: number;
        totalAmount: number;
    };
}

export function BookingSummary({ type, service, selectedDate, selectedTime, formatDate, paymentAmounts }: BookingSummaryProps) {
    return (
        <div className="booking-summary">
            <h3>Récapitulatif</h3>
            <div className="summary-content">
                <div className="summary-item">
                    <span>Service:</span>
                    <span>{service.name}</span>
                </div>
                <div className="summary-item">
                    <span>Description:</span>
                    <span>{service.description}</span>
                </div>

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
                        <span>{service.price}€</span>
                    </div>
                )}
            </div>
        </div>
    );
}