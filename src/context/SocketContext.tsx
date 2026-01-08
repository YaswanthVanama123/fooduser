import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectToRestaurant: (restaurantId: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectToRestaurant = (restaurantId: string) => {
    // Connect to restaurant-specific namespace
    const sock = socketService.connect(restaurantId);
    setSocket(sock);

    // Update connection status
    sock.on('connect', () => {
      setIsConnected(true);
    });

    sock.on('disconnect', () => {
      setIsConnected(false);
    });
  };

  const disconnect = () => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  };

  useEffect(() => {
    // Auto-connect if restaurantId is in localStorage
    const restaurantId = localStorage.getItem('restaurantId');
    if (restaurantId) {
      connectToRestaurant(restaurantId);
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectToRestaurant, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
