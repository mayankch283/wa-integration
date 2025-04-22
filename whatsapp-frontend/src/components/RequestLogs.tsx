import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface RequestLog {
    id: string;
    timestamp: string;
    method: string;
    path: string;
    status_code: number;
    duration_ms: number;
    body?: string;
}

const RequestLogs: React.FC = () => {
    const [logs, setLogs] = useState<RequestLog[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get('/monitoring/requests');
                setLogs(response.data.requests);
            } catch (error) {
                console.error('Error fetching request logs:', error);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div>
            <h2>Recent Request Logs</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Timestamp</th>
                        <th>Method</th>
                        <th>Path</th>
                        <th>Status Code</th>
                        <th>Duration (ms)</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{log.id}</td>
                            <td>{log.timestamp}</td>
                            <td>{log.method}</td>
                            <td>{log.path}</td>
                            <td>{log.status_code}</td>
                            <td>{log.duration_ms}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RequestLogs;