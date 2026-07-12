import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type User, getCurrentUser, logout as authLogout, loginOrRegister } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string) => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const login = useCallback((phone: string) => {
    const u = loginOrRegister(phone);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
