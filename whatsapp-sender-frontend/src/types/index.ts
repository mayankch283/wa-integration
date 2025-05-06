export interface Template {
  id: string;
  name: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  text: {
    body: string;
  };
  type: string;
  contact_info: {
    profile: {
      name: string;
    };
    wa_id: string;
  };
}