import { useEffect, useState } from 'react';
import socketService from '../services/socketService';

/**
 * Custom hook to manage Socket.IO connection
 * @param {string} userId - Current user ID
 * @returns {Object} - Socket instance and connection status
 */
export const useSocket = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (userId) {
      const socketInstance = socketService.connect(userId);
      setSocket(socketInstance);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);

      socketService.on('connect', handleConnect);
      socketService.on('disconnect', handleDisconnect);

      return () => {
        socketService.off('connect');
        socketService.off('disconnect');
      };
    }
  }, [userId]);

  return { socket, isConnected };
};