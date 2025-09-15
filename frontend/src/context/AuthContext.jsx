import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from "jwt-decode";


const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    try { return jwtDecode(t); } catch { return null; }
  });

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser(jwtDecode(token));
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return (
    <AuthCtx.Provider value={{ user, token: localStorage.getItem('token'), login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};
