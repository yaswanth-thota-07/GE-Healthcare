/**
 * Auth Context
 * SehatSure - Policy-Integrated Care Planning
 * Provides active guest user context without requiring authentication
 */

import { createContext, useContext, useState } from "react";

const defaultGuestUser = {
  id: "658bc1234567890abcdef123",
  name: "Guest User",
  email: "guest@hospitality.local",
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultGuestUser);
  const [loading] = useState(false);

  const login = (token, userData) => {
    setUser(userData || defaultGuestUser);
  };

  const logout = () => {
    setUser(defaultGuestUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
