import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface MessageStatus {
    phone_number: string;
    status: string;
    details: Record<string, any>;
}

const MessageStatus: React.FC = () => {
    const { messageId } = useParams<{ messageId: string }>();
    const [status, setStatus] = useState<MessageStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!messageId) return;

        const fetchMessageStatus = async () => {
            try {
                const response = await axios.get(`/message-status/${messageId}`);
                setStatus(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error fetching message status');
            }
        };

        fetchMessageStatus();
    }, [messageId]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!status) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h3>Message Status</h3>
            <p>Phone Number: {status.phone_number}</p>
            <p>Status: {status.status}</p>
            <pre>{JSON.stringify(status.details, null, 2)}</pre>
        </div>
    );
};

export default MessageStatus;