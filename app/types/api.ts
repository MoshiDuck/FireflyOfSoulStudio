// Info : app/types/api.ts
export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    features?: string[];
    type: 'session' | 'product';
    stripeProductId?: string;
    stripePriceId?: string;
    stripeDepositPriceId?: string;
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

export interface ApiSuccessResponse<T = any> {
    success: true;
    id?: number;
    message: string;
    data?: T;
}

export interface ApiErrorResponse {
    success: false;  // ← AJOUTÉ
    error: string;
    details?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

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
    amountPaid?: number;
    paymentType?: 'deposit' | 'full';
    date?: string | null;
    time?: string | null;
    type: 'session' | 'product';
}

// Props communes
export interface BookingProcessProps {
    service?: Service;
    cart?: CartItemComponent[];
    onBack: () => void;
    onComplete: () => void;
    apiEndpoint: string;
    type: 'session' | 'product';
}

export interface CartItemComponent {
    service: Service;
    quantity: number;
    selectedCapacity?: {
        size: string;
        price: number;
    };
}

export interface StripePaymentProps {
    amount: number;
    serviceName: string;
    bookingData: BookingData;
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
    onCancel: () => void;
    selectedDate?: string;
    selectedTime?: string;
    type: 'session' | 'product';
    paymentType: 'deposit' | 'full';
    stripePriceId?: string;
    stripeDepositPriceId?: string;
    totalServicePrice: number;
}

export interface BookingData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    message?: string;
}

export interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}
export interface PaymentAmounts {
    depositAmount: number;
    remainingAmount: number;
    totalAmount: number;
}