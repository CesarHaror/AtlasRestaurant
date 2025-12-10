import { create } from 'zustand';
import type { CartItem } from '../types';

export interface CartBySession {
  [sessionId: string]: {
    items: CartItem[];
    discountAmount: number;
    taxRate: number;
  };
}

interface CartState {
  // Carrito por sesión
  cartsBySession: CartBySession;
  activeSessionId: string | null;
  
  // Legacy: items del carrito activo
  items: CartItem[];
  discountAmount: number;
  taxRate: number;

  // Operaciones de sesión
  switchToSession: (sessionId: string) => void;
  initSessionCart: (sessionId: string) => void;
  clearSessionCart: (sessionId: string) => void;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (amount: number) => void;
  setTaxRate: (rate: number) => void;
  clear: () => void;

  subtotal: () => number;
  taxAmount: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartsBySession: {},
  activeSessionId: null,
  items: [],
  discountAmount: 0,
  taxRate: 0.16, // 16% por defecto

  switchToSession: (sessionId) => {
    const state = get();
    if (!state.cartsBySession[sessionId]) {
      state.initSessionCart(sessionId);
    }
    
    const sessionCart = state.cartsBySession[sessionId];
    set({
      activeSessionId: sessionId,
      items: sessionCart.items,
      discountAmount: sessionCart.discountAmount,
      taxRate: sessionCart.taxRate,
    });
  },

  initSessionCart: (sessionId) => {
    set((state) => ({
      cartsBySession: {
        ...state.cartsBySession,
        [sessionId]: {
          items: [],
          discountAmount: 0,
          taxRate: 0.16,
        },
      },
    }));
  },

  clearSessionCart: (sessionId) => {
    set((state) => ({
      cartsBySession: {
        ...state.cartsBySession,
        [sessionId]: {
          items: [],
          discountAmount: 0,
          taxRate: 0.16,
        },
      },
    }));
  },

  addItem: (item) =>
    set((state) => {
      const sessionId = state.activeSessionId;
      if (!sessionId) return state;

      const sessionCart = state.cartsBySession[sessionId];
      const existing = sessionCart.items.find((i) => i.productId === item.productId);
      
      const newItems = existing
        ? sessionCart.items.map((i) =>
            i.productId === item.productId
              ? {
                  ...i,
                  quantity: i.quantity + item.quantity,
                  subtotal: (i.quantity + item.quantity) * i.price,
                }
              : i
          )
        : [...sessionCart.items, item];

      return {
        items: newItems,
        cartsBySession: {
          ...state.cartsBySession,
          [sessionId]: {
            ...sessionCart,
            items: newItems,
          },
        },
      };
    }),

  removeItem: (productId) =>
    set((state) => {
      const sessionId = state.activeSessionId;
      if (!sessionId) return state;

      const sessionCart = state.cartsBySession[sessionId];
      const newItems = sessionCart.items.filter((i) => i.productId !== productId);

      return {
        items: newItems,
        cartsBySession: {
          ...state.cartsBySession,
          [sessionId]: {
            ...sessionCart,
            items: newItems,
          },
        },
      };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const sessionId = state.activeSessionId;
      if (!sessionId) return state;

      const sessionCart = state.cartsBySession[sessionId];
      const newItems = sessionCart.items
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity, subtotal: quantity * i.price }
            : i
        )
        .filter((i) => i.quantity > 0);

      return {
        items: newItems,
        cartsBySession: {
          ...state.cartsBySession,
          [sessionId]: {
            ...sessionCart,
            items: newItems,
          },
        },
      };
    }),

  setDiscount: (amount) =>
    set((state) => {
      const sessionId = state.activeSessionId;
      if (!sessionId) return state;

      return {
        discountAmount: amount,
        cartsBySession: {
          ...state.cartsBySession,
          [sessionId]: {
            ...state.cartsBySession[sessionId],
            discountAmount: amount,
          },
        },
      };
    }),

  setTaxRate: (rate) =>
    set((state) => {
      const sessionId = state.activeSessionId;
      if (!sessionId) return state;

      return {
        taxRate: rate,
        cartsBySession: {
          ...state.cartsBySession,
          [sessionId]: {
            ...state.cartsBySession[sessionId],
            taxRate: rate,
          },
        },
      };
    }),

  clear: () =>
    set((state) => {
      const sessionId = state.activeSessionId;
      if (!sessionId) return state;

      return {
        items: [],
        discountAmount: 0,
        cartsBySession: {
          ...state.cartsBySession,
          [sessionId]: {
            items: [],
            discountAmount: 0,
            taxRate: state.cartsBySession[sessionId]?.taxRate || 0.16,
          },
        },
      };
    }),

  subtotal: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  taxAmount: () => {
    const state = get();
    const taxable = state.subtotal() - state.discountAmount;
    return Math.max(0, taxable * state.taxRate);
  },

  total: () => {
    const state = get();
    return state.subtotal() - state.discountAmount + state.taxAmount();
  },
}));
