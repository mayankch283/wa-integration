import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MessageForm from './components/MessageForm';
import MessageStatus from './components/MessageStatus';
import RequestLogs from './components/RequestLogs';

const App: React.FC = () => {
    return (
        <Router>
            <div className="app">
                <nav>
                    <h1>WhatsApp Integration</h1>
                    <ul>
                        <li><a href="/">Send Message</a></li>
                        <li><a href="/logs">View Logs</a></li>
                    </ul>
                </nav>
                <main>
                    <Routes>
                        <Route path="/" element={<MessageForm />} />
                        <Route path="/status/:messageId" element={<MessageStatus />} />
                        <Route path="/logs" element={<RequestLogs />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;