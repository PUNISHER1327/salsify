import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AIChat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: `Hi ${user?.name || 'there'}! I'm your Business Assistant. Ask me about your revenue, clients, or pending invoices.` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/ai/chat', { message: userMsg });
            setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error answering that." }]);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 mb-4 flex flex-col h-[500px] border border-gray-100 animate-fade-in-up overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-accent p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-full">
                                <FaRobot />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Business Assistant</h3>
                                <p className="text-xs text-white/80">Powered by Local AI</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none shadow-sm'
                                        : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none shadow-sm'
                                    }`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask about revenue, clients..."
                                className="flex-1 input-field py-2 text-sm rounded-full"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
                            >
                                <FaPaperPlane className="text-sm ml-[-2px] mt-1" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-tr from-primary to-accent text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center text-2xl animate-bounce-subtle"
                >
                    <FaRobot />
                </button>
            )}
        </div>
    );
};

export default AIChat;
