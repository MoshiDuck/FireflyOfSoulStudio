// Info : app/types/api.ts
export interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
    duration: string;
    type: 'session' | 'product';
    features?: string[];
    capacities?: Capacity[];
}

export interface Capacity {
    size: string;
    price: number;
    description: string;
}

// Types pour les réservations
export interface TimeSlot {
    time: string;
    available: boolean;
}

export interface BookedSlot {
    reservation_time: string;
}

// Types pour les réponses API
export interface ApiSuccessResponse {
    success: boolean;
    id: number;
    message: string;
}

export interface ApiErrorResponse {
    error: string;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

// Types pour le panier
export interface CartItem {
    productId: string;
    productName: string;
    productType: 'session' | 'product';
    quantity: number;
    price: number;
    selectedCapacity?: Capacity;
}

export interface BookingRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    cart: CartItem[];
    total: number;
    amountPaid?: number; // Nouveau champ
    paymentType?: 'deposit' | 'full'; // Nouveau champ
    date?: string | null;
    time?: string | null;
    type: 'session' | 'product';
}

// Props communes
export interface BookingProcessProps {
    service: Service;
    onBack: () => void;
    onComplete: () => void;
    apiEndpoint: string;
    type: 'session' | 'product';
}

export interface CartItemComponent {
    service: Service;
    quantity: number;
    selectedCapacity?: Capacity;
}

// Props pour StripePayment
export interface StripePaymentProps {
    amount: number;
    serviceName: string;
    bookingData: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        message?: string;
    };
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
    onCancel: () => void;
    selectedDate?: string;
    selectedTime?: string;
    type: 'session' | 'product';
    paymentType: 'deposit' | 'full'; // Nouveau champ
    stripeComment: string;
}

// Types pour les montants de paiement
export interface PaymentAmounts {
    depositAmount: number;
    remainingAmount: number;
    totalAmount: number;
}