'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  token: string | null;
  login: (token: string, expiresIn: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = Cookies.get('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (newToken: string, expiresIn: string) => {
    setToken(newToken);
    
    // Set cookie expiration based on rememberMe
    const expires = expiresIn === '30d' ? 30 : 1/24; // 30 days or 1 hour
    Cookies.set('token', newToken, { 
      expires: expires, 
      secure: true,
      sameSite: 'strict'
    });
  };

  const logout = () => {
    setToken(null);
    Cookies.remove('token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        login, 
        logout, 
        isAuthenticated: !!token 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);