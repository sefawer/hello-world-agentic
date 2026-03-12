import { useEffect, useState } from 'react';
import { HelloButton } from './components/HelloButton';
import { MessageList } from './components/MessageList';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useWebSocket } from './hooks/useWebSocket';
import { messageApi } from './services/api';
import type { Message } from './types';

function App() {
  const { messages: wsMessages, isConnected } = useWebSocket();
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // İlk yüklemede son mesajları getir
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        const messages = await messageApi.getMessages(10);
        setInitialMessages(messages);
        setError(null);
      } catch (err) {
        setError('Mesajlar yüklenirken hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();
  }, []);

  // WebSocket'ten gelen yeni mesajları initial mesajlarla birleştir
  const allMessages = [...wsMessages, ...initialMessages].reduce((unique, message) => {
    // Aynı mesajı iki kere eklememek için
    if (!unique.some(m => m.id === message.id)) {
      unique.push(message);
    }
    return unique;
  }, [] as Message[]);

  // Tarihe göre sırala (en yeni en üstte)
  const sortedMessages = [...allMessages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSuccess = () => {
    console.log('Mesaj başarıyla gönderildi');
  };

  const handleError = (err: Error) => {
    setError('Mesaj gönderilemedi: ' + err.message);
    setTimeout(() => setError(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Hello World Agentic Panel
            </h1>
            <ConnectionStatus isConnected={isConnected} />
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Buton */}
          <div className="flex justify-center py-4">
            <HelloButton onSuccess={handleSuccess} onError={handleError} />
          </div>

          {/* Mesajlar */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">Mesajlar</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <MessageList messages={sortedMessages} />
            )}
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-400 text-center pt-4 border-t">
            Agentic Hello World v1.0 - Real-time WebSocket
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;