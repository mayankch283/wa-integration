// src/types/index.ts

export interface Message {
    id: string;
    phoneNumber: string;
    body: string;
    status: string;
    timestamp: string;
}

export interface RequestLog {
    id: string;
    timestamp: string;
    method: string;
    path: string;
    query: string;
    clientIp: string;
    statusCode: number;
    durationMs: number;
    body?: string | null;
    error?: string | null;
}