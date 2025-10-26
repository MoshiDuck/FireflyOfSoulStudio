export const STEP_CONFIG = {
    session: [
        { number: 1, label: 'Date', title: 'Choisissez une date pour votre séance', backLabel: '← Retour aux séances' },
        { number: 2, label: 'Heure', title: 'Choisissez un horaire', backLabel: '← Retour' },
        { number: 3, label: 'Informations', title: 'Vos informations', backLabel: '← Retour' }
    ],
    product: [
        { number: 1, label: 'Votre Commande', title: 'Votre commande', backLabel: '← Retour aux produits' },
        { number: 2, label: 'Informations', title: 'Vos informations', backLabel: '← Retour' }
    ]
} as const;