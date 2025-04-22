import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface MessageRequest {
    phone_number: string;
    message: string;
    language_code?: string;
}

export const sendMessage = async (phoneNumber: string, message: string, languageCode: string = 'en_US') => {
    try {
        const response = await axios.post(`${API_BASE_URL}/send-whatsapp-message`, {
            phone_number: phoneNumber,
            message: message,
            language_code: languageCode
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.detail || 'Failed to send message');
        }
        throw new Error('Failed to send message');
    }
};

export const getMessageStatus = async (messageId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/message-status/${messageId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.detail || 'Failed to retrieve message status');
        }
        throw new Error('Failed to retrieve message status');
    }
};

export const getAllMessageStatuses = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/all-message-statuses`);
        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve all message statuses');
    }
};