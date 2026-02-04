import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logout as logoutService, getMe } from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra auth status khi app load
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          // Lấy user từ localStorage trước
          const storedUser = getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          }
          
          // Optional: Verify with server
          // const response = await getMe();
          // if (response.success) {
          //   setUser(response.data);
          //   localStorage.setItem('user', JSON.stringify(response.data));
          // }
        } catch (error) {
          console.error('Auth init error:', error);
          // If error, clear auth data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login - được gọi sau khi login API thành công
  const login = (userData) => {
    setUser(userData);
  };

  // Logout
  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  // Update user info
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    userRole: user?.role,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
