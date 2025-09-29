import axios from "axios";
import { Bot, Send, Trash2 } from "lucide-react"; // Import Trash2 icon
import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8080";
const LOCAL_STORAGE_KEY = "aiChatHistory";

const AiChatbot = ({ monthlyData, selectedMonth }) => {
    // Initialize state by trying to load history from localStorage
    const [messages, setMessages] = useState(() => {
        const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        return savedHistory ? JSON.parse(savedHistory) : [];
    });

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Effect to save messages to localStorage and auto-scroll when messages update
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    // Function to scroll to the bottom of the chat window
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // NEW FUNCTION: Clears the messages and localStorage
    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear the entire chat history?")) {
            setMessages([]); // Clear local state
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear persisted data
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not logged in.");

            // CONSTRUCT THE CONTEXT PAYLOAD
            const contextPayload = {
                selectedMonth: selectedMonth,
                startingBalance: monthlyData.startingBalance || 0,
                totalCredits: monthlyData.totalCredits || 0,
                totalExpenses: monthlyData.totalExpenses || 0,
                remainingBalance: monthlyData.remainingBalance || 0,
                budgetFood: monthlyData.budgetFood || 0,
                budgetTransportation: monthlyData.budgetTransportation || 0,
                budgetEntertainment: monthlyData.budgetEntertainment || 0,
                budgetShopping: monthlyData.budgetShopping || 0,
                budgetUtilities: monthlyData.budgetUtilities || 0,
            };

            const response = await axios.post(`${API_URL}/api/ai/chat`,
                {
                    prompt: currentInput,
                    context: contextPayload
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiAdvice = response.data?.advice || "Sorry, I couldn't get a clear response from the advisor.";
            const aiMessage = { sender: 'ai', text: aiAdvice };

            setMessages((prev) => [...prev, aiMessage]);

        } catch (err) {
            console.error("AI Chat Error:", err);
            const errorMessage = err.response?.data?.error || "AI Service Unavailable. Check the Ollama server connection.";
            const errorBotMessage = { sender: 'ai', text: errorMessage, isError: true };

            setMessages((prev) => [...prev, errorBotMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between space-x-3 bg-gray-700 rounded-t-xl">
                <div className="flex items-center space-x-3">
                    <Bot size={20} className="text-purple-400" />
                    <h3 className="text-lg font-semibold text-gray-100">BudgetWise AI Assistant</h3>
                </div>
                {/* Clear Chat Button */}
                <button
                    onClick={handleClearChat}
                    className="text-gray-400 hover:text-red-400 transition"
                    title="Clear Chat History"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Message Display Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && !loading ? (
                    <div className="text-center text-gray-400 mt-10">
                        Ask me a financial question! Try: "What is my current remaining balance?" or "Suggest my budget."
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-md ${msg.sender === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : msg.isError
                                        ? 'bg-red-800 text-white border border-red-600'
                                        : 'bg-gray-700 text-gray-100'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}

                {/* Thinking Indicator */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-lg bg-gray-700 text-gray-100 italic animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}

                {/* Ref element for auto-scrolling */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your financial question..."
                        className="flex-1 px-4 py-2 rounded-full bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="p-3 rounded-full bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50"
                        disabled={loading || input.trim().length === 0}
                    >
                        <Send size={20} className="text-white" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AiChatbot;