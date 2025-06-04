import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthData, User } from '../types/user';
import { authService } from '../services/auth';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (data: AuthData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedUser = await authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: AuthData) => {
    setUser(data.user);
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = await authService.updateProfile(userData);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
