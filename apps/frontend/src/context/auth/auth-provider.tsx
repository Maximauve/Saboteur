import { UserWithoutPassword as User } from "@saboteur/api/src/domain/model/user";
import { createContext, type PropsWithChildren, useEffect, useState } from "react";

import { useRefreshUserQuery } from "@/services/user";

export type AppUser = Partial<User> & { loading?: boolean };

export interface AuthContextType {
  refreshUser: () => void;
  user: AppUser | null;
}

export const authContext = createContext<AuthContextType>({
  user: null,
  refreshUser: () => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>({ loading: true });
  const { isError, isLoading, data, error, refetch } = useRefreshUserQuery();

  const refreshUser = () => {
    refetch();
  };

  useEffect(() => {
    if (isLoading) {
      setUser({ loading: true });
      return;
    }

    if (isError) {
      setUser(null);
      console.error("Error while fetching user", error);
      return;
    }

    if (data) {
      setUser({ username: data.username, role: data.role });
    } 

  }, [isError, isLoading, data, error]);

  return (
    <authContext.Provider value={{ user, refreshUser }}>
      {children}
    </authContext.Provider>
  );
}
