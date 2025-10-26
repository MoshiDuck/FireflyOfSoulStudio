// Types pour les services
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