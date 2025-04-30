import React, { useState } from 'react';
import { Template, Language, ApiResponse } from '../types';
import { sendWhatsAppTemplate } from '../services/api';

const WhatsAppTemplateForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('hello_world');
  const [languageCode, setLanguageCode] = useState<string>('en_US');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Available templates - expand this list as needed
  const templates: Template[] = [
    { id: 'hello_world', name: 'Hello World' },
    { id: 'account_update', name: 'Account Update' },
    { id: 'payment_update', name: 'Payment Update' }
  ];

  // Available languages - expand this list as needed
  const languages: Language[] = [
    { code: 'en_US', name: 'English (US)' },
    { code: 'es_ES', name: 'Spanish (Spain)' },
    { code: 'pt_BR', name: 'Portuguese (Brazil)' },
    { code: 'hi_IN', name: 'Hindi (India)' }
  ];

  // Validate phone number (digits only)
  const isValidPhoneNumber = (num: string): boolean => /^\d+$/.test(num);

  const handleSubmit = async (): Promise<void> => {
    // Validate phone number before submitting
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (digits only)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await sendWhatsAppTemplate({
        to: phoneNumber,
        template_name: selectedTemplate,
        language_code: languageCode
      });
      
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone number (digits only)"
            className="p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none"
          />
          <p className="text-sm text-gray-500 mt-1">Enter digits only (no spaces or special characters)</p>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none"
          >
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Language</label>
          <select
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            className="p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none"
          >
            {languages.map(language => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-full disabled:bg-blue-300 transition duration-200"
        >
          {isLoading ? 'Sending...' : 'Send WhatsApp Message'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-bold">Success!</p>
          <pre className="whitespace-pre-wrap overflow-auto text-sm">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplateForm;