import WhatsAppTemplateForm from './components/WhatsappTemplateForm';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">WhatsApp Template Sender</h1>
          <p className="text-gray-600">Send WhatsApp template messages via the Facebook Graph API</p>
        </header>
        
        <main>
          <WhatsAppTemplateForm />
        </main>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>WhatsApp Sender API Frontend</p>
        </footer>
      </div>
    </div>
  );
}

export default App;