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

const getStoredUser = (): User | null => {
  try {
    const saved = localStorage.getItem('akira_auth_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const defaultInitialUser: User = {
  id: 'usr-admin-1',
  name: 'Ashutosh Kumar',
  email: 'ashukumarfbg8271@gmail.com',
  role: 'admin',
};

const initialUser = getStoredUser() || defaultInitialUser;

const useAuthStore = create<AuthStore>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  
  login: (email: string, password: string) => {
    let authenticatedUser: User | null = null;

    if (
      email.includes('admin') || 
      email === 'ashukumarfbg8271@gmail.com' || 
      email === 'admin@akirafresh.in' || 
      email === 'admin@example.com'
    ) {
      authenticatedUser = {
        id: '1',
        name: email === 'ashukumarfbg8271@gmail.com' ? 'Ashutosh Kumar' : 'Akira Admin',
        email: email,
        role: 'admin',
      };
    } else if (email && password) {
      authenticatedUser = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: 'user',
      };
    }
    
    if (authenticatedUser) {
      localStorage.setItem('akira_auth_user', JSON.stringify(authenticatedUser));
      set({
        user: authenticatedUser,
        isAuthenticated: true,
      });
      return true;
    }
    
    return false;
  },
  
  logout: () => {
    localStorage.removeItem('akira_auth_user');
    set({
      user: null,
      isAuthenticated: false,
    });
  },
  
  register: (name: string, email: string, password: string) => {
    if (!name || !email || !password) return false;
    
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: email.includes('admin') ? 'admin' : 'user',
    };
    
    localStorage.setItem('akira_auth_user', JSON.stringify(newUser));
    set({
      user: newUser,
      isAuthenticated: true,
    });
    return true;
  },
}));

export default useAuthStore;
