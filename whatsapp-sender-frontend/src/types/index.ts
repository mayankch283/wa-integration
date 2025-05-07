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
  type: 'text' | 'sticker' | 'image';
  text?: {
    body: string;
  };
  sticker?: {
    mime_type: string;
    sha256: string;
    id: string;
    animated: boolean;
  };
  image?: {
    mime_type: string;
    sha256: string;
    id: string;
    caption?: string;
  };
  contact_info: {
    profile: {
      name: string;
    };
    wa_id: string;
  };
}