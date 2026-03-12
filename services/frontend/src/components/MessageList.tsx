import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Henüz mesaj yok. Butona tıklayarak ilk mesajı gönder!
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
      {messages.map((msg, index) => (
        <div
          key={msg.id}
          className={`
            p-3 rounded-lg shadow-sm border
            ${index === 0 
              ? 'bg-green-50 border-green-200 animate-pulse' 
              : 'bg-white border-gray-200'
            }
          `}
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-800 font-medium">{msg.content}</span>
            <span className="text-xs text-gray-500 font-mono">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};