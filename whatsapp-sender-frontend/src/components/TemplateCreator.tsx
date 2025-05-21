import { createTemplate } from "../services/api";
import { useState } from "react";
import { Template } from "../services/api";

interface ComponentField {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text: string;
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  example?: {
    header_text?: string[][];
    body_text?: string[][];
  };
}

const TemplateCreator: React.FC = () => {
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [language, setLanguage] = useState('en');
  const [components, setComponents] = useState<ComponentField[]>([
    { type: 'BODY', text: '', format: 'TEXT' }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Meta's official template categories
  const categories = [
    'MARKETING',
    'AUTHENTICATION',
    'UTILITY',
  ];

  // Common languages supported by WhatsApp
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'pt_BR', name: 'Portuguese (Brazil)' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'id', name: 'Indonesian' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' }
  ];

  const addComponent = (type: ComponentField['type']) => {
    setComponents([...components, { type, text: '', format: 'TEXT' }]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponent = (index: number, field: string, value: string) => {
    const updatedComponents = [...components];
    updatedComponents[index] = {
      ...updatedComponents[index],
      [field]: value
    };
    setComponents(updatedComponents);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Template name validation
      if (!templateName.match(/^[a-zA-Z0-9_]+$/)) {
        throw new Error('Template name can only contain letters, numbers, and underscores');
      }

      // Validate components
      if (!components.some(comp => comp.type === 'BODY')) {
        throw new Error('Template must have at least one BODY component');
      }

      const templateData: Template = {
        name: templateName.toLowerCase(),
        language,
        category,
        components: components.map(comp => ({
          type: comp.type,
          text: comp.text,
          format: comp.format,
        })),
        status: 'PENDING',
        id: ''
      };

      await createTemplate(templateData);
      setSuccess('Template created successfully! It will be reviewed by WhatsApp before becoming active.');
      
      // Reset form
      setTemplateName('');
      setComponents([{ type: 'BODY', text: '', format: 'TEXT' }]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create WhatsApp Message Template</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            placeholder="hello_world"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Use lowercase letters, numbers, and underscores only
          </p>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Components */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Components
          </label>
          
          {components.map((component, index) => (
            <div key={index} className="mt-4 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{component.type}</h3>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeComponent(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <textarea
                  value={component.text}
                  onChange={(e) => updateComponent(index, 'text', e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                  placeholder={`Enter ${component.type.toLowerCase()} text`}
                  rows={3}
                />
              </div>
            </div>
          ))}

          {components.length < 4 && (
            <div className="mt-4 space-x-2">
              {!components.some(c => c.type === 'HEADER') && (
                <button
                  type="button"
                  onClick={() => addComponent('HEADER')}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                >
                  Add Header
                </button>
              )}
              
              {!components.some(c => c.type === 'FOOTER') && (
                <button
                  type="button"
                  onClick={() => addComponent('FOOTER')}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                >
                  Add Footer
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Create Template
        </button>
      </form>
    </div>
  );
};

export default TemplateCreator;