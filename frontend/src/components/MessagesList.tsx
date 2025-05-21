import React, { useEffect, useState } from 'react';
import { fetchMessages } from '../services/api';

interface MessageResponse {
  id: number;
  message_id: string;
  from_number: string;
  timestamp: string;
  message_type: string;
  message_content: string;
  contact_info: string;
  created_at: string;
}

const MessagesList: React.FC = () => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
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
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderMessageContent = (message: MessageResponse) => {
    const messageData = JSON.parse(message.message_content);
    const contactInfo = JSON.parse(message.contact_info);

    switch (messageData.type) {
      case 'text':
        return <p className="text-gray-700">{messageData.text?.body}</p>;
      case 'sticker':
        return (
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm text-gray-600">
              Sticker sent (ID: {messageData.sticker?.id})
            </p>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-sm text-gray-600">
                Image received (ID: {messageData.image?.id})
              </p>
              {messageData.image?.caption && (
                <p className="text-gray-700 mt-1">
                  Caption: {messageData.image.caption}
                </p>
              )}
            </div>
          </div>
        );
        
      default:
        return <p className="text-gray-500">Unsupported message type: {messageData.type}</p>;
    }
  };

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
          messages.map((message) => {
            const contactInfo = JSON.parse(message.contact_info);
            return (
              <div
                key={message.id}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {contactInfo.profile.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {renderMessageContent(message)}
                <p className="text-sm text-gray-500 mt-2">From: {message.from_number}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessagesList;