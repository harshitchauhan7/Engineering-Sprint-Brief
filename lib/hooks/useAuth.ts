// lib/hooks/useAuth.ts
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    setUser(null);
  };

  return { user, loading, logout };
}
