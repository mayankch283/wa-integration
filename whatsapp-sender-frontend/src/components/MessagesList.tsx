import React, { useEffect, useState } from 'react';
import { WhatsAppMessage } from '../types';
import { fetchMessages } from '../services/api';

const MessagesList: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetchMessages();
        setMessages(response.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      }
    };

    loadMessages();
//polling every 30 seconds
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold p-4 border-b bg-white sticky top-0">Recent Messages</h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">
                    {message.contact_info.profile.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(parseInt(message.timestamp) * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700">{message.text.body}</p>
              <p className="text-sm text-gray-500 mt-2">From: {message.from}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesList;