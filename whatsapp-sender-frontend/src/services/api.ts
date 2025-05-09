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

export const sendWhatsAppTemplate = async (params: WhatsAppTemplateRequest) => {
  const response = await fetch('https://wa-soee.onrender.com/send-whatsapp-template', {
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
  const response = await fetch('https://wa-soee.onrender.com/messages');
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
};

export const fetchTemplates = async () => {
  const response = await fetch('https://wa-soee.onrender.com/templates');
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return response.json();
};