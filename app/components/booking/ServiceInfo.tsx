import React from 'react';
import type { Service } from '~/types/api';

interface ServiceInfoProps {
    service?: Service; // Rendez service optionnel
    additionalInfo?: string;
}

export const ServiceInfo = ({ service, additionalInfo }: ServiceInfoProps) => {
    if (!service) return null; // Ne rien afficher si pas de service

    return (
        <div className="selected-service-info">
            <div className="service-name">{service.name}</div>
            <div className="service-details">
                {service.description} • {service.price}€
                {additionalInfo && ` • ${additionalInfo}`}
            </div>
        </div>
    );
};