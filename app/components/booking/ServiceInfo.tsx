// Info : app/components/booking/ServiceInfo.tsx
import React from 'react';
import type { Service } from '~/types/api';

interface ServiceInfoProps {
    service: Service;
    additionalInfo?: string;
}

export const ServiceInfo = ({ service, additionalInfo }: ServiceInfoProps) => (
    <div className="selected-service-info">
        <div className="service-name">{service.name}</div>
        <div className="service-details">
            {service.description} • {service.price}€
            {additionalInfo && ` • ${additionalInfo}`}
        </div>
    </div>
);