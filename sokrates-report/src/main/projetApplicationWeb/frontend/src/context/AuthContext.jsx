import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  isAdmin: false,
  userId: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = useCallback((token, userId, isAdmin) => {
    setToken(token);
    setUserId(userId);
    setIsAdmin(isAdmin);

    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setIsAdmin(false);

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedIsAdmin = localStorage.getItem("isAdmin") === "true";

    if (storedToken && storedUserId) {
      login(storedToken, storedUserId, storedIsAdmin);
    }
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        isAdmin,
        token,
        userId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
