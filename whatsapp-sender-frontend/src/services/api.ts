interface WhatsAppTemplateRequest {
  to: string;
  template_name: string;
  language_code: string;
}

export const sendWhatsAppTemplate = async (params: WhatsAppTemplateRequest) => {
  const response = await fetch('http://127.0.0.1:8000/send-whatsapp-template', {
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