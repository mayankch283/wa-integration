import { createTemplate, TemplateCreateRequest } from "../services/api";
import { useState } from "react";

interface ComponentField {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  text: string;
  format?: "TEXT";
  example?: {
    header_text?: string[][];
    body_text?: string[][];
  };
  buttons?: Button[];
}

interface Button {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "COPY_CODE";
  text: string;
  url?: string;
  phone_number?: string;
  url_type?: "STATIC" | "DYNAMIC";
}

interface Variable {
  key: string;
  value: string;
}

const TemplateCreator: React.FC = () => {
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("UTILITY");
  const [language, setLanguage] = useState("en");
  const [components, setComponents] = useState<ComponentField[]>([
    { type: "BODY", text: "", format: "TEXT" },
  ]);
  const [variables, setVariables] = useState<Variable[]>([
    { key: "1", value: "" }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Meta's official template categories
  const categories = ["MARKETING", "AUTHENTICATION", "UTILITY"];

  // Common languages supported by WhatsApp
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "pt_BR", name: "Portuguese (Brazil)" },
    { code: "hi", name: "Hindi" },
    { code: "ar", name: "Arabic" },
    { code: "id", name: "Indonesian" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
  ];

  // Button types
  const buttonTypes = [
    { value: "QUICK_REPLY", label: "Quick Reply" },
    { value: "URL", label: "Visit Website" },
    { value: "PHONE_NUMBER", label: "Call Phone Number" },
    { value: "COPY_CODE", label: "Copy Code" },
  ];

  // URL types
  const urlTypes = [
    { value: "STATIC", label: "Static" },
    { value: "DYNAMIC", label: "Dynamic" },
  ];

  const addComponent = (type: ComponentField["type"]) => {
    const newComponent: ComponentField = { type, text: "", format: "TEXT" };
    
    // Initialize buttons array for BUTTONS component
    if (type === "BUTTONS") {
      newComponent.buttons = [{ type: "QUICK_REPLY", text: "" }];
    }
    
    setComponents([...components, newComponent]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponent = (index: number, field: string, value: any) => {
    const updatedComponents = [...components];
    updatedComponents[index] = {
      ...updatedComponents[index],
      [field]: value,
    };
    setComponents(updatedComponents);
  };

  const addButton = (componentIndex: number) => {
    const updatedComponents = [...components];
    const component = updatedComponents[componentIndex];
    
    if (!component.buttons) {
      component.buttons = [];
    }
    
    component.buttons.push({ type: "QUICK_REPLY", text: "" });
    setComponents(updatedComponents);
  };

  const removeButton = (componentIndex: number, buttonIndex: number) => {
    const updatedComponents = [...components];
    const component = updatedComponents[componentIndex];
    
    if (component.buttons) {
      component.buttons = component.buttons.filter((_, i) => i !== buttonIndex);
    }
    
    setComponents(updatedComponents);
  };

  const updateButton = (componentIndex: number, buttonIndex: number, field: string, value: string) => {
    const updatedComponents = [...components];
    const component = updatedComponents[componentIndex];
    
    if (component.buttons) {
      component.buttons[buttonIndex] = {
        ...component.buttons[buttonIndex],
        [field]: value,
      };
    }
    
    setComponents(updatedComponents);
  };

  const addVariable = () => {
    const newKey = (variables.length + 1).toString();
    setVariables([...variables, { key: newKey, value: "" }]);
  };

  const insertVariable = (componentIndex: number, variableKey: string) => {
    const updatedComponents = [...components];
    const component = updatedComponents[componentIndex];
    
    // Insert variable placeholder at cursor position or at the end
    const variablePlaceholder = `{{${variableKey}}}`;
    component.text = component.text + variablePlaceholder;
    
    setComponents(updatedComponents);
  };

  const updateVariable = (index: number, field: string, value: string) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value,
    };
    setVariables(updatedVariables);
  };

  const prepareTemplateData = (): TemplateCreateRequest => {
    const preparedComponents = components.map(component => {
      const preparedComponent: any = {
        type: component.type,
        text: component.text
      };

      if (component.type !== "BUTTONS") {
        preparedComponent.format = "TEXT";
      }

      // Add examples for variables
      if (component.text.includes("{{")) {
        const example: any = {};
        
        if (component.type === "HEADER") {
          example.header_text = [variables[0].value];
        } else if (component.type === "BODY") {
          example.body_text = [
            variables.map(v => v.value)
          ];
        }
        
        preparedComponent.example = example;
      }

      if (component.type === "BUTTONS" && component.buttons) {
        preparedComponent.buttons = component.buttons;
      }

      return preparedComponent;
    });

    return {
      name: templateName.toLowerCase(),
      language,
      category,
      components: preparedComponents,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const templateData = prepareTemplateData();
      await createTemplate(templateData);
      setSuccess(
        "Template created successfully! It will be reviewed by WhatsApp before becoming active."
      );

      // Reset form
      setTemplateName("");
      setComponents([{ type: "BODY", text: "", format: "TEXT" }]);
      setVariables([{ key: "1", value: "" }]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create template"
      );
    }
  };

  const countCharacters = (text: string) => {
    return text ? text.length : 0;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        Create WhatsApp Message Template
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name and Language
          </label>
          <div className="flex space-x-4">
            <div className="flex-grow">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                placeholder="template_name"
                required
              />
            </div>
            <div className="w-1/3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-medium mb-2">Content</h3>
          <p className="text-sm text-gray-600 mb-4">
            Fill in the header, body and footer sections of your template.
          </p>

          {/* Variables */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variables
              <span className="ml-1 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </label>
            <select
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 mb-2"
              defaultValue="Number"
              disabled
            >
              <option value="Number">Number</option>
            </select>
          </div>

          {/* Components */}
          {components.map((component, index) => (
            <div key={index} className="mt-4 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">
                  {component.type}
                  {component.type !== "BODY" && " • Optional"}
                </h3>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeComponent(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {component.type !== "BUTTONS" ? (
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={component.text}
                      onChange={(e) =>
                        updateComponent(index, "text", e.target.value)
                      }
                      className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                      placeholder={`Enter ${component.type.toLowerCase()} text`}
                      rows={3}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                      {countCharacters(component.text)}/{component.type === "HEADER" ? "60" : component.type === "FOOTER" ? "60" : "1024"}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => insertVariable(index, "1")}
                      className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-sm"
                    >
                      + Add variable
                    </button>

                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Create buttons that let customers respond to your message or take action. You can add up to ten buttons. If you add more than three buttons, they will appear in a list.
                  </p>
                  
                  {component.buttons?.map((button, buttonIndex) => (
                    <div key={buttonIndex} className="p-3 border rounded bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Button {buttonIndex + 1}</h4>
                        {buttonIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => removeButton(index, buttonIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Type</label>
                            <select
                              value={button.type}
                              onChange={(e) => updateButton(index, buttonIndex, "type", e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                            >
                              {buttonTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Button text</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={button.text}
                                onChange={(e) => updateButton(index, buttonIndex, "text", e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                                placeholder="Enter button text"
                              />
                              <div className="absolute right-2 top-2 text-xs text-gray-500">
                                {countCharacters(button.text)}/25
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {button.type === "URL" && (
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">URL type</label>
                              <select
                                value={button.url_type || "STATIC"}
                                onChange={(e) => updateButton(index, buttonIndex, "url_type", e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              >
                                {urlTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-600 mb-1">Website URL</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={button.url || ""}
                                  onChange={(e) => updateButton(index, buttonIndex, "url", e.target.value)}
                                  className="w-full p-2 border rounded text-sm"
                                  placeholder="https://example.com"
                                />
                                <div className="absolute right-2 top-2 text-xs text-gray-500">
                                  {countCharacters(button.url || "")}/2000
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {button.type === "PHONE_NUMBER" && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Phone number</label>
                            <input
                              type="text"
                              value={button.phone_number || ""}
                              onChange={(e) => updateButton(index, buttonIndex, "phone_number", e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              placeholder="+1234567890"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!component.buttons || component.buttons.length < 10) && (
                    <button
                      type="button"
                      onClick={() => addButton(index)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add button</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Component Buttons */}
          <div className="mt-4 space-x-2">
            {!components.some((c) => c.type === "HEADER") && (
              <button
                type="button"
                onClick={() => addComponent("HEADER")}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Add Header
              </button>
            )}
            
            {!components.some((c) => c.type === "FOOTER") && (
              <button
                type="button"
                onClick={() => addComponent("FOOTER")}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Add Footer
              </button>
            )}
            
            {!components.some((c) => c.type === "BUTTONS") && (
              <button
                type="button"
                onClick={() => addComponent("BUTTONS")}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Add Buttons
              </button>
            )}
          </div>
        </div>

        {/* Sample Template Variables */}
        <div className="border rounded p-4">
          <h3 className="text-md font-medium mb-2">Samples for body content</h3>
          <p className="text-sm text-gray-600 mb-4">
            To help us review your message template, please add an example for each variable in your body text. 
            Do not use real customer information. Cloud API hosted by Meta reviews templates and variable 
            parameters to protect the security and integrity of our services.
          </p>
          
          {variables.map((variable, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2">
              <div className="w-12 font-medium">
                {`{{${variable.key}}}`}
              </div>
              <input
                type="text"
                value={variable.value}
                onChange={(e) => updateVariable(idx, "value", e.target.value)}
                className="flex-grow p-2 border rounded"
                placeholder="Example value"
              />
            </div>
          ))}
          
          <button
            type="button"
            onClick={addVariable}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add another variable
          </button>
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