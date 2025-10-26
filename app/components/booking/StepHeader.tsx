import React from 'react';

interface StepHeaderProps {
    onBack: () => void;
    title: string;
    backLabel?: string;
}

export const StepHeader = ({ onBack, title, backLabel = "← Retour" }: StepHeaderProps) => (
    <div className="booking-step-header">
        <button onClick={onBack} className="back-button">
            {backLabel}
        </button>
        <h3 className="booking-step-title">{title}</h3>
        <div className="spacer"></div>
    </div>
);