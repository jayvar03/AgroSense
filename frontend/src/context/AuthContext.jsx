import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agrosense_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('agrosense_token'));
  const [loading, setLoading] = useState(true);

  // Sync / refresh profile if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/profile');
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('agrosense_user', JSON.stringify(data.user));
        }
      } catch {
        localStorage.removeItem('agrosense_token');
        localStorage.removeItem('agrosense_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = (newToken, newUser) => {
    localStorage.setItem('agrosense_token', newToken);
    localStorage.setItem('agrosense_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('agrosense_token');
      localStorage.removeItem('agrosense_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('agrosense_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        logout,
        updateUser,
      }}
    >
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
