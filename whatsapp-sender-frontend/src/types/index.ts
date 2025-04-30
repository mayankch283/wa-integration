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