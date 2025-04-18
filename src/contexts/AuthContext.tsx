
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, setAuthToken, removeAuthToken, User } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  checkRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        removeAuthToken();
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      if (response.success && response.data) {
        const { token, user } = response.data;
        setAuthToken(token);
        setUser(user);
        
        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }
        
        toast.success("Logged in successfully!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authAPI.signup(userData);
      if (response.success && response.data) {
        const { token, user } = response.data;
        setAuthToken(token);
        setUser(user);
        toast.success("Account created successfully!");
        
        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("Signup failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  // Check if user has required role(s)
  const checkRole = (requiredRoles: string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
