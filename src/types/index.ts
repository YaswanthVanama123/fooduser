export interface Category {
  _id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CustomizationOption {
  label: string;
  priceModifier: number;
}

export interface Customization {
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  customizationOptions?: Customization[];
  preparationTime?: number;
}

export interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
  isActive: boolean;
  isOccupied: boolean;
  location?: string;
}

export interface OrderCustomization {
  name: string;
  options: string[];
  priceModifier: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: OrderCustomization[];
  subtotal: number;
  specialInstructions?: string;
}

export interface CartItem extends OrderItem {
  image?: string;
}

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface Order {
  _id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
