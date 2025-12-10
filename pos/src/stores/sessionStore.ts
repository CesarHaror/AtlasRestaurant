import { create } from 'zustand';
import type { CashRegisterSession } from '../types';

export interface SessionHistoryItem {
  id: string;
  timestamp: Date;
  amount: number;
  itemsCount: number;
  paymentMethods: string[];
}

export interface SessionWithCart extends CashRegisterSession {
  items?: number;
  localCreatedAt?: Date;
  customName?: string; // Fase 4: Nombre personalizado (Mesa 1, Para llevar, etc.)
  history?: SessionHistoryItem[]; // Fase 5: Historial de transacciones
}

interface SessionState {
  // Múltiples sesiones
  sessions: SessionWithCart[];
  activeSessionId: string | null;
  archivedSessions: SessionWithCart[]; // Fase 5: Sesiones completadas
  
  // Getter para sesión activa
  getActiveSession: () => SessionWithCart | null;
  
  // Operaciones con sesiones
  addSession: (session: CashRegisterSession) => void;
  switchSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  
  // Mantener backward compatibility
  setSession: (session: CashRegisterSession | null) => void;
  isOpen: () => boolean;
  
  // Actualizar sesión específica
  updateSession: (sessionId: string, updates: Partial<SessionWithCart>) => void;
  
  // Fase 4: Renombrar sesión
  renameSession: (sessionId: string, customName: string) => void;
  
  // Fase 5: Historial y archivo
  addToHistory: (sessionId: string, historyItem: SessionHistoryItem) => void;
  archiveSession: (sessionId: string) => void;
  getArchivedSessions: () => SessionWithCart[];
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  archivedSessions: [],

  getActiveSession: () => {
    const state = get();
    if (!state.activeSessionId) return null;
    return state.sessions.find(s => s.id === state.activeSessionId) || null;
  },

  addSession: (session) => {
    const newSession: SessionWithCart = {
      ...session,
      items: 0,
      localCreatedAt: new Date(),
      customName: undefined,
      history: [],
    };
    
    set((state) => ({
      sessions: [...state.sessions, newSession],
      activeSessionId: newSession.id,
    }));
  },

  switchSession: (sessionId) => {
    const state = get();
    const session = state.sessions.find(s => s.id === sessionId);
    if (session) {
      set({ activeSessionId: sessionId });
    }
  },

  removeSession: (sessionId) => {
    set((state) => {
      const remaining = state.sessions.filter(s => s.id !== sessionId);
      const newActiveId = state.activeSessionId === sessionId 
        ? remaining[0]?.id || null 
        : state.activeSessionId;
      
      return {
        sessions: remaining,
        activeSessionId: newActiveId,
      };
    });
  },

  updateSession: (sessionId, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    }));
  },

  // Fase 4: Renombrar sesión
  renameSession: (sessionId, customName) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, customName } : s
      ),
    }));
  },

  // Fase 5: Agregar al historial
  addToHistory: (sessionId, historyItem) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId 
          ? { 
              ...s, 
              history: [...(s.history || []), historyItem]
            }
          : s
      ),
    }));
  },

  // Fase 5: Archivar sesión
  archiveSession: (sessionId) => {
    set((state) => {
      const sessionToArchive = state.sessions.find(s => s.id === sessionId);
      if (!sessionToArchive) return state;

      const remaining = state.sessions.filter(s => s.id !== sessionId);
      const newActiveId = state.activeSessionId === sessionId 
        ? remaining[0]?.id || null 
        : state.activeSessionId;

      return {
        sessions: remaining,
        activeSessionId: newActiveId,
        archivedSessions: [...state.archivedSessions, sessionToArchive],
      };
    });
  },

  // Fase 5: Obtener sesiones archivadas
  getArchivedSessions: () => {
    return get().archivedSessions;
  },

  setSession: (session) => {
    if (session) {
      get().addSession(session);
    } else {
      set({ sessions: [], activeSessionId: null });
    }
  },

  isOpen: () => {
    const activeSession = get().getActiveSession();
    return activeSession?.status === 'OPEN';
  },
}));
