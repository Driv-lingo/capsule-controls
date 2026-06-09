import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
};

type AuthResult = {
  error: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function readJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await readJsonSafe(response);

      if (response.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return { error: "Email and password are required" };
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        setUser(null);
        return { error: data.error || "Login failed" };
      }

      if (!data.user) {
        setUser(null);
        return { error: "Login succeeded, but no user was returned" };
      }

      setUser(data.user);
      return { error: null };
    } catch {
      setUser(null);
      return { error: "Unable to reach login server" };
    }
  }

  async function signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResult> {
    const cleanEmail = normalizeEmail(email);
    const cleanName = fullName?.trim() || null;

    if (!cleanEmail || !password) {
      return { error: "Email and password are required" };
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters" };
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name: cleanName,
        }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        setUser(null);
        return { error: data.error || "Signup failed" };
      }

      if (!data.user) {
        setUser(null);
        return { error: "Signup succeeded, but no user was returned" };
      }

      setUser(data.user);
      return { error: null };
    } catch {
      setUser(null);
      return { error: "Unable to reach signup server" };
    }
  }

  async function signOut() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }

  async function resetPassword(_email: string): Promise<AuthResult> {
    return {
      error: "Password reset is not configured yet.",
    };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
