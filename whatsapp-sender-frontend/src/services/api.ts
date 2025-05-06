interface WhatsAppTemplateRequest {
  to: string;
  template_name: string;
  language_code: string;
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