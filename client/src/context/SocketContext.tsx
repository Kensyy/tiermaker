import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createSocket, type AppSocket } from "../lib/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<AppSocket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<AppSocket | null>(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }
    const instance = createSocket();
    setSocket(instance);
    return () => {
      instance.disconnect();
    };
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket(): AppSocket | null {
  return useContext(SocketContext);
}
