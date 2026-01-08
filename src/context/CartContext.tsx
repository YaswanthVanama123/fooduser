import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  tableId: string | null;
  tableNumber: string | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setTable: (tableId: string, tableNumber: string) => void;
  getCartTotal: () => { subtotal: number; tax: number; total: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedTableId = localStorage.getItem('tableId');
    const savedTableNumber = localStorage.getItem('tableNumber');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedTableId) setTableId(savedTableId);
    if (savedTableNumber) setTableNumber(savedTableNumber);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.menuItemId === item.menuItemId &&
        JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        updated[existingIndex].subtotal = updated[existingIndex].price * updated[existingIndex].quantity;
        return updated;
      }

      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItemId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.menuItemId === itemId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const setTable = (id: string, number: string) => {
    setTableId(id);
    setTableNumber(number);
    localStorage.setItem('tableId', id);
    localStorage.setItem('tableNumber', number);
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        tableId,
        tableNumber,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setTable,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
