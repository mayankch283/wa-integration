const API_URL = process.env.REACT_APP_API_URL;

export interface WhatsAppTemplateParameter {
  type: string;
  text: string;
}

export interface WhatsAppTemplateComponent {
  type: string;
  parameters: WhatsAppTemplateParameter[];
}

export interface WhatsAppTemplateRequest {
  to: string;
  template_name: string;
  language_code: string;
  components: WhatsAppTemplateComponent[];
}

export interface TemplateComponent {
  type: string;
  text?: string;
  format?: string;
  example?: {
    body_text?: string[][];
    header_text?: string[][];
    body_text_named_params?: Array<{
      param_name: string;
      example: string;
    }>;
  };
}

export interface Template {
  id: string;
  name: string;
  language: string;
  components: TemplateComponent[];
  status: string;
  category: string;
  parameter_format?: string;
}

export interface TemplateCreateRequest {
  allow_category_change: boolean;
  name: string;
  language: string;
  category: string;
  components: {
    type: string;
    format?: string;
    text?: string;
    example?: {
      header_text?: string[];
      body_text?: string[][];
    };
    buttons?: {
      type: string;
      text: string;
    }[];
  }[];
}

export const sendWhatsAppTemplate = async (params: WhatsAppTemplateRequest) => {
  const response = await fetch(`${API_URL}/send-whatsapp-template`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to send WhatsApp template');
  }

  return response.json();
};

export const fetchMessages = async () => {
  const response = await fetch(`${API_URL}/messages`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
};

export const fetchTemplates = async () => {
  console.log('Fetching templates from API:', `${API_URL}/templates`);
  const response = await fetch(`${API_URL}/templates`);
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return response.json();
};

export const createTemplate = async (template: TemplateCreateRequest) => {
  const response = await fetch(`${API_URL}/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });

  if (!response.ok) {
    throw new Error('Failed to create template');
  }

  return response.json();
};