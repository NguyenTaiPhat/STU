import { type AppState, type StateListener } from '../types/portal.types';
import { createDefaultState } from '../data/stuMockData';

const STORAGE_KEY = 'stu_amis_portal_state_v11';
const CURRENT_VERSION = 11;

type Subscribers = Set<StateListener>;

let state: AppState = createDefaultState();
const subscribers: Subscribers = new Set();

function notifyAll(): void {
  subscribers.forEach(fn => fn(state));
}

function persistToStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) { /* quota exceeded */ }
}

export const stateStore = {
  getState(): AppState {
    return state;
  },

  setState(partial: Partial<AppState>): void {
    state = { ...state, ...partial };
    persistToStorage();
    notifyAll();
  },

  subscribe(listener: StateListener): () => void {
    subscribers.add(listener);
    return () => { subscribers.delete(listener); };
  },

  loadFromStorage(): void {
    try {
      // Clear legacy storage keys
      for (let i = 1; i <= 10; i++) {
        localStorage.removeItem(`stu_amis_portal_state_v${i}`);
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state = createDefaultState();
        return;
      }
      const parsed = JSON.parse(raw) as Partial<AppState>;
      if (parsed.__version !== CURRENT_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        state = createDefaultState();
        return;
      }
      state = { ...createDefaultState(), ...parsed };
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
      state = createDefaultState();
    }
  },

  reset(): void {
    state = createDefaultState();
    persistToStorage();
    notifyAll();
  },

  resetToDefault(): void {
    this.reset();
  }
};
