import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage, Message } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8001';

export const useWebSocket = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws`);
      
      ws.onopen = () => {
        console.log('WebSocket bağlandı');
        setIsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket bağlantısı koptu, yeniden bağlanılıyor...');
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          if (data.type === 'new_message') {
            setMessages(prev => [data.data, ...prev].slice(0, 50));
          } else if (data.type === 'heartbeat') {
            console.log('Heartbeat alındı', data.data.timestamp);
          }
        } catch (error) {
          console.error('WebSocket mesaj hatası:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket hatası:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket bağlantı hatası:', error);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { messages, isConnected };
};