// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage/sessionStorage
  const [currentUser, setCurrentUser] = useState(() => {
    // Check localStorage first, then sessionStorage
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const login = (userData) => {
    setCurrentUser(userData);
    // Note: The actual storage is handled in the Login component
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };
  
  // Value to be provided to consumers
  const value = {
    currentUser,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};