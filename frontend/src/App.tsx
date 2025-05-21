import React, { useState } from 'react';
import WhatsAppDashboard from './components/WhatsappDashboard';
import SmsDashboard from './components/SmsDashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms'>('whatsapp');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Messaging Dashboard</h1>
          <p className="text-gray-600">Send messages via WhatsApp and SMS</p>
        </header>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-center space-x-8">
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'whatsapp'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sms'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                SMS
              </button>
            </nav>
          </div>
        </div>
        
        <main className="max-w-3xl mx-auto">
          {activeTab === 'whatsapp' ? <WhatsAppDashboard /> : <SmsDashboard />}
        </main>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Messaging Dashboard</p>
        </footer>
      </div>
    </div>
  );
}

export default App;