import React, { useState, useEffect } from 'react';
import { ApiResponse } from '../types';
import { sendWhatsAppTemplate, fetchTemplates, Template, WhatsAppTemplateComponent, WhatsAppTemplateParameter } from '../services/api';

// Define a type for grouped templates
interface GroupedTemplate {
  name: string;
  languages: {
    [key: string]: Template;
  };
  category: string;
}

const WhatsAppTemplateForm: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(true);
  const [templateParameters, setTemplateParameters] = useState<{ [key: string]: { type: string, text: string, index: string, example?: string, param_name?: string } }>({});
  const [availableLanguagesForTemplate, setAvailableLanguagesForTemplate] = useState<{code: string, name: string}[]>([]);

  // Language mapping
  const languageMappings: { [key: string]: string } = {
    'en': 'English',
    'en_US': 'English (US)',
    'es_ES': 'Spanish (Spain)',
    'pt_BR': 'Portuguese (Brazil)',
    'hi': 'Hindi',
    'hi_IN': 'Hindi (India)',
    'ar': 'Arabic',
    'id_ID': 'Indonesian',
    'de': 'German',
    'fr': 'French',
    'it': 'Italian'
  };

  // Fetch templates from API on component mount
  useEffect(() => {
    const getTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const data = await fetchTemplates();
        console.log('Fetched templates:', data);
        setTemplates(data.templates);
        
        // Group templates by name
        const groupedByName: { [key: string]: GroupedTemplate } = {};
        
        data.templates.forEach((template: Template) => {
          if (!groupedByName[template.name]) {
            groupedByName[template.name] = {
              name: template.name,
              languages: {},
              category: template.category
            };
          }
          groupedByName[template.name].languages[template.language] = template;
        });
        
        const groupedArray = Object.values(groupedByName);
        setGroupedTemplates(groupedArray);
        
        // Set default template if available
        if (groupedArray.length > 0) {
          const firstTemplate = groupedArray[0];
          setSelectedTemplateName(firstTemplate.name);
          
          // Set available languages for this template
          const availableLanguages = Object.keys(firstTemplate.languages).map(code => ({
            code,
            name: languageMappings[code] || code
          }));
          setAvailableLanguagesForTemplate(availableLanguages);
          
          // Set default language
          if (availableLanguages.length > 0) {
            setSelectedLanguageCode(availableLanguages[0].code);
            updateParametersForTemplate(firstTemplate.name, availableLanguages[0].code, firstTemplate.languages);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    getTemplates();
  }, []);

  // Update parameters based on selected template and language
  const updateParametersForTemplate = (templateName: string, languageCode: string, templateLanguages?: {[key: string]: Template}) => {
    // Clear previous parameters
    setTemplateParameters({});
    
    const languages = templateLanguages || 
                      groupedTemplates.find(t => t.name === templateName)?.languages;
    
    if (!languages || !languages[languageCode]) return;
    
    const template = languages[languageCode];
    
    template.components.forEach(component => {
      if ((component.type === 'BODY' || component.type === 'HEADER') && component.text) {
        // Handle both named parameters {{name}} and indexed parameters {{1}}
        const namedParamRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
        const indexedParamRegex = /\{\{(\d+)\}\}/g;
        let match;
        
        // Check for named parameters first
        while ((match = namedParamRegex.exec(component.text)) !== null) {
          const paramName = match[1];
          // Skip if it's a number (will be caught by the indexed regex)
          if (!isNaN(Number(paramName))) continue;
          
          // Find example if available
          let example = '';
          if (component.example?.body_text_named_params) {
            const exampleParam = component.example.body_text_named_params.find(
              p => p.param_name === paramName
            );
            if (exampleParam) {
              example = exampleParam.example;
            }
          } else if (component.example?.body_text && component.type === 'BODY') {
            example = component.example.body_text[0]?.[0] || '';
          } else if (component.example?.header_text && component.type === 'HEADER') {
            example = component.example.header_text[0]?.[0] || '';
          }
          
          setTemplateParameters(prev => ({
            ...prev,
            [`param_${component.type.toLowerCase()}_${paramName}`]: {
              type: component.type,
              text: '',
              index: paramName,
              param_name: paramName,
              example: example
            }
          }));
        }
        
        // Then check for indexed parameters
        while ((match = indexedParamRegex.exec(component.text)) !== null) {
          const paramNum = match[1];
          
          // Find example if available
          let example = '';
          if (component.example?.body_text) {
            // Example might be in a nested array format
            example = component.example.body_text[0]?.[Number(paramNum) - 1] || '';
          }
          
          setTemplateParameters(prev => ({
            ...prev,
            [`param_${component.type.toLowerCase()}_${paramNum}`]: {
              type: component.type,
              text: '',
              index: paramNum,
              example: example
            }
          }));
        }
      }
    });
  };

  // Handle template change
  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplateName(templateName);
    setTemplateParameters({});
    
    const selectedTemplate = groupedTemplates.find(t => t.name === templateName);
    if (selectedTemplate) {
      // Update available languages for this template
      const languages = Object.keys(selectedTemplate.languages).map(code => ({
        code,
        name: languageMappings[code] || code
      }));
      
      setAvailableLanguagesForTemplate(languages);
      
      // Set first available language as default
      if (languages.length > 0) {
        setSelectedLanguageCode(languages[0].code);
        updateParametersForTemplate(templateName, languages[0].code);
      } else {
        setSelectedLanguageCode('');
      }
    }
  };

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguageCode(languageCode);
    updateParametersForTemplate(selectedTemplateName, languageCode);
  };

  // Validate phone number (digits only)
  const isValidPhoneNumber = (num: string): boolean => /^\d+$/.test(num);

  const handleSubmit = async (): Promise<void> => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (digits only)');
      return;
    }

    if (!selectedLanguageCode) {
      setError('Please select a language');
      return;
    }
    
    const selectedTemplate = groupedTemplates.find(t => t.name === selectedTemplateName);
    if (!selectedTemplate || !selectedTemplate.languages[selectedLanguageCode]) {
      setError('Selected template or language is not available');
      return;
    }

    // Transform parameters into components structure
    const components: WhatsAppTemplateComponent[] = [];
    const bodyParams: WhatsAppTemplateParameter[] = [];
    const headerParams: WhatsAppTemplateParameter[] = [];

    Object.entries(templateParameters).forEach(([key, value]) => {
      const param: WhatsAppTemplateParameter = {
        type: "text",
        text: value.text
      };

      if (value.type === "HEADER") {
        headerParams.push(param);
      } else if (value.type === "BODY") {
        bodyParams.push(param);
      }
    });

    if (headerParams.length > 0) {
      components.push({
        type: "HEADER",
        parameters: headerParams
      });
    }

    if (bodyParams.length > 0) {
      components.push({
        type: "BODY",
        parameters: bodyParams
      });
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await sendWhatsAppTemplate({
        to: phoneNumber,
        template_name: selectedTemplateName,
        language_code: selectedLanguageCode,
        components: components
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
      <h2 className="text-xl font-bold mb-4">Send WhatsApp Template</h2>
      
      {isLoadingTemplates ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
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
            {groupedTemplates.length === 0 ? (
              <p className="text-red-500">No templates available</p>
            ) : (
              <select
                value={selectedTemplateName}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none"
              >
                {groupedTemplates.map(template => (
                  <option key={template.name} value={template.name}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedTemplateName && (
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Language</label>
              <select
                value={selectedLanguageCode}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none"
              >
                <option value="">Select a language</option>
                {availableLanguagesForTemplate.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose the language for your template message
              </p>
            </div>
          )}

          {/* Template Parameters */}
          {selectedTemplateName && selectedLanguageCode && Object.entries(templateParameters).length > 0 && (
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Template Parameters</label>
              <div className="space-y-3 border p-3 rounded">
                {Object.entries(templateParameters).map(([key, param]) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm text-gray-600">
                      {param.type} Parameter {param.param_name ? `{{${param.param_name}}}` : `{{${param.index}}}`}
                    </label>
                    <input
                      type="text"
                      value={param.text}
                      onChange={(e) => setTemplateParameters({
                        ...templateParameters,
                        [key]: {
                          ...param,
                          text: e.target.value
                        }
                      })}
                      placeholder={param.example ? `Example: ${param.example}` : `Enter value for parameter`}
                      className="p-2 border rounded focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none mt-1"
                    />
                    {param.example && (
                      <p className="text-xs text-gray-500 mt-1">Example: {param.example}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display template details */}
          {selectedTemplateName && selectedLanguageCode && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Template Details</h3>
              {groupedTemplates
                .filter(t => t.name === selectedTemplateName)
                .map(template => {
                  const templateData = template.languages[selectedLanguageCode];
                  if (!templateData) return null;
                  
                  return (
                    <div key={templateData.id} className="space-y-2 text-sm">
                      <p><span className="font-medium">ID:</span> {templateData.id}</p>
                      <p><span className="font-medium">Category:</span> {templateData.category}</p>
                      <p><span className="font-medium">Status:</span> {templateData.status}</p>
                      <div>
                        <p className="font-medium">Components:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {templateData.components.map((component, index) => (
                            <li key={index}>
                              <span className="font-medium">{component.type}:</span>{' '}
                              {component.text && (
                                <span className="whitespace-pre-wrap">
                                  {component.text.substring(0, 100)}
                                  {component.text.length > 100 ? '...' : ''}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || groupedTemplates.length === 0 || !selectedLanguageCode}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-full disabled:bg-blue-300 transition duration-200"
          >
            {isLoading ? 'Sending...' : 'Send WhatsApp Message'}
          </button>
        </div>
      )}

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