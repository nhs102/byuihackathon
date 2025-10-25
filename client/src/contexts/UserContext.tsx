import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  token?: string; // 토큰 추가
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Log user changes to console for debugging
  useEffect(() => {
    if (user) {
      console.log('✅ User logged in:', user);
    } else {
      console.log('❌ User logged out or session reset');
    }
  }, [user]);

  const logout = () => {
    setUser(null);
  };

  const setToken = (token: string) => {
    if (user) {
      setUser({ ...user, token });
    }
  };

  // Expose user to window for console debugging
  useEffect(() => {
    (window as any).currentUser = user;
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, logout, setToken }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

