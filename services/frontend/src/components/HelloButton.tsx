import React, { useState } from 'react';
import { messageApi } from '../services/api';

interface HelloButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const HelloButton: React.FC<HelloButtonProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await messageApi.sendMessage();
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
      console.error('Mesaj gönderilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        px-6 py-3 rounded-lg font-semibold text-white
        transition-all duration-200 transform
        ${loading 
          ? 'bg-blue-300 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
        }
        shadow-lg hover:shadow-xl
      `}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Gönderiliyor...
        </span>
      ) : (
        'SAY HELLO!'
      )}
    </button>
  );
};