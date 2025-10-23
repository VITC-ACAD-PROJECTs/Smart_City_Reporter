
'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On mount, load user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const login = useGoogleLogin({
    scope: 'openid profile email',
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('/api/auth/google/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        if (res.ok) {
          const data = await res.json();
          const userData = { ...data.user, token: tokenResponse.access_token };
          setUser(userData);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData)); // Persist user
          }
          console.log('Logged in user:', data.user);
        } else {
          const errorData = await res.json();
          console.error('Token verification failed:', errorData);
          alert('Token verification failed: ' + (errorData.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Network or server error');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      alert('Login Failed: ' + (error.error_description || 'Unknown error'));
    },
  });

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user'); // Clear persisted user
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
