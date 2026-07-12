/* @refresh reset */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from './api'; import { useNavigate } from 'react-router-dom';

export type Role = 'fleet_manager' | 'driver' | 'safety_officer' | 'financial_analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: 'active' | 'inactive' | 'suspended' | 'pending_invite';
  isFirstLogin: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      navigate('/login?expired=true');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const initAuth = async () => {
      const token = localStorage.getItem('transitops_token');
      if (token) {
        try {
          const res = await apiFetch<{ data: { user: User } }>('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to restore session', err);
          localStorage.removeItem('transitops_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const login = (token: string, user: User) => {
    localStorage.setItem('transitops_token', token);
    localStorage.setItem('transitops_user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setUser(null);
    apiFetch('/auth/logout', { method: 'POST' }).catch(console.error);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
