import { useState } from 'react';
import WhatsAppTemplateForm from './WhatsappTemplateForm';
import MessagesList from './MessagesList';

export default function WhatsAppDashboard() {
  const [activeTab, setActiveTab] = useState('send');
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-center text-blue-600">WhatsApp Business API Dashboard</h1>
      </header>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'send' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('send')}
          >
            Send Template
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'messages' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('messages')}
          >
            Recent Messages
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        {activeTab === 'send' ? (
          <WhatsAppTemplateForm />
        ) : (
          <MessagesList />
        )}
      </div>
    </div>
  );
}