import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: (email: string, password: string) => {
    // Simple mock authentication
    if (email === 'admin@example.com' && password === 'admin123') {
      set({
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        isAuthenticated: true,
      });
      return true;
    }
    
    if (email === 'user@example.com' && password === 'user123') {
      set({
        user: {
          id: '2',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
        },
        isAuthenticated: true,
      });
      return true;
    }
    
    return false;
  },
  
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },
  
  register: (name: string, email: string, password: string) => {
    // Simple mock registration
    if (email && password && name) {
      set({
        user: {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role: 'user',
        },
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  },
}));

export default useAuthStore;