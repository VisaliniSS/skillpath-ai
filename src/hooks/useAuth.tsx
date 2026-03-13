import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type UserRole = "admin" | "student" | "instructor";

type AuthError = {
  message: string;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: UserRole[];
  isAdmin: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (data) setRoles(data.map((r) => r.role));
  };

  useEffect(() => {
    // For development: skip Supabase auth state listener
    // We'll manage auth state manually in signIn/signUp/signOut
    setLoading(false);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ error: AuthError | null }> => {
    // For development: accept any email/password combination
    if (email && password) {
      // Create a mock user object
      const mockUser: User = {
        id: "mock-user-id-" + Date.now(),
        email: email,
        user_metadata: { full_name: fullName || email.split("@")[0] },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      setUser(mockUser);
      setSession({ user: mockUser } as Session);
      setRoles(["student"]); // Default role
      return { error: null };
    }
    return { error: { message: "Email and password are required" } };
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }> => {
    // For development: accept any email/password combination
    if (email && password) {
      // Create a mock user object
      const mockUser: User = {
        id: "mock-user-id",
        email: email,
        user_metadata: { full_name: email.split("@")[0] },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      setUser(mockUser);
      setSession({ user: mockUser } as Session);
      setRoles(["student"]); // Default role
      return { error: null };
    }
    return { error: { message: "Email and password are required" } };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        isAdmin: roles.includes("admin"),
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Utility function to check if user is a mock user (for development)
export function isMockUser(user: User | null): boolean {
  return user?.id?.startsWith("mock-user-id") ?? false;
}
