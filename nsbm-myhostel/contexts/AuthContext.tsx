"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  // login can be called either as (email, password) or as (userObject, token)
  login: (emailOrUser: string | any, passwordOrToken?: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrUser: string | any, passwordOrToken?: string) => {
    // If called with (email, password) - perform network login
    if (typeof emailOrUser === "string") {
      const email = emailOrUser;
      const password = passwordOrToken || "";

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const { user: userData, idToken } = await res.json();
      setUser(userData);
      try {
        localStorage.setItem("user", JSON.stringify(userData));
        if (idToken) localStorage.setItem("idToken", idToken);
      } catch (e) {
        /* ignore storage errors */
      }
      return;
    }

    // If called with (userObject, token) - set session directly
    const userObj = emailOrUser;
    setUser(userObj);
    try {
      localStorage.setItem("user", JSON.stringify(userObj));
      if (passwordOrToken) localStorage.setItem("idToken", passwordOrToken);
    } catch (e) {
      /* ignore storage errors */
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    });

    if (!res.ok) {
      throw new Error("Signup failed");
    }

    // Auto-login after signup
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
