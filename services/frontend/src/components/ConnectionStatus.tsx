import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      <span className="text-sm text-gray-600">
        {isConnected ? 'Bağlantı Aktif' : 'Bağlantı Koptu - Yeniden bağlanıyor...'}
      </span>
    </div>
  );
};