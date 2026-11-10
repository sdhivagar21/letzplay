import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from "jwt-decode";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// A token that is unreadable or past its expiry counts as signed out.
const readToken = () => {
  const t = localStorage.getItem('token');
  if (!t) return null;
  try {
    const u = jwtDecode(t);
    if (u.exp && u.exp * 1000 < Date.now()) { localStorage.removeItem('token'); return null; }
    return u;
  } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readToken);

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
