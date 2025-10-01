import axios from "axios";
import { Bot, Send, Trash2 } from "lucide-react"; // REMOVED Zap from imports
import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8080";
const LOCAL_STORAGE_KEY = "aiChatHistory";

// Helper function to call the set-budgets API - REMAINS FOR INTERNAL LOGIC
const applySuggestedBudget = async (month, year, budgetMap, token) => {
    try {
        // API expects month and year as query params, and budget map in body
        await axios.post(
            `${API_URL}/api/transaction/set-budgets?year=${year}&month=${month}`,
            budgetMap,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { success: true };
    } catch (err) {
        console.error("Failed to apply budgets:", err.response?.data || err.message);
        return { success: false, error: err.response?.data?.error || "Failed to apply budgets." };
    }
};

const AiChatbot = ({ monthlyData, selectedMonth, isChatUnlocked }) => { // ACCEPT isChatUnlocked PROP
    // 1. IMPLEMENT WELCOME MESSAGE LOGIC
    const [messages, setMessages] = useState(() => {
        const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        const initialMessages = savedHistory ? JSON.parse(savedHistory) : [];
        
        // Add a default welcome message only if the chat history is empty
        if (initialMessages.length === 0) {
            initialMessages.push({
                sender: 'ai', 
                text: "Hello! Good morning, I'm BudgetWise AI. I can analyze your current finances and suggest budget allocations based on your starting balance and saving goals. How can I help you today?",
                isWelcome: true
            });
        }

        return initialMessages;
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

    // Clears the messages and localStorage
    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear the entire chat history?")) {
            setMessages([]); // Clear local state
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear persisted data
        }
    };

    // handleApplyBudget logic is removed as requested
    /*
    const handleApplyBudget = async (budgetMap, messageIndex) => { ... }
    */

    const handleSend = async (e) => {
        e.preventDefault();
        // Use isChatUnlocked here to prevent sending if logic is somehow bypassed
        if (!input.trim() || loading || !isChatUnlocked) return; 

        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not logged in.");

            // CONSTRUCT THE CONTEXT PAYLOAD (same logic as before)
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

            // --- Calculate actual spending per category for AI context ---
            const actualCategorySpending = (monthlyData.transactions || [])
                .filter(txn => txn.account === 'expense')
                .reduce((acc, txn) => {
                    let key;
                    switch(txn.category) {
                        case 'Food & dining': key = 'actualSpendingFood'; break;
                        case 'Transportation': key = 'actualSpendingTransportation'; break;
                        case 'Entertainment': key = 'actualSpendingEntertainment'; break;
                        case 'Shopping': key = 'actualSpendingShopping'; break;
                        case 'Utilities': key = 'actualSpendingUtilities'; break;
                        default: return acc;
                    }
                    acc[key] = (acc[key] || 0) + txn.amount;
                    return acc;
                }, {});

            Object.assign(contextPayload, actualCategorySpending);
            // -------------------------------------------------------------------


            const response = await axios.post(`${API_URL}/api/ai/chat`,
                {
                    prompt: currentInput,
                    context: contextPayload
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            let aiAdvice = response.data?.advice || "Sorry, I couldn't get a clear response from the advisor.";
            let suggestedBudget = null;

            // Attempt to parse AI response as JSON for budget suggestion
            try {
                const parsedJson = JSON.parse(aiAdvice);
                if (Object.keys(parsedJson).some(key => key.startsWith('budget'))) {
                    suggestedBudget = parsedJson;
                    // Format the text for display in the chat bubble
                    aiAdvice = "💡 Budget Suggestion:\n" + 
                                Object.entries(suggestedBudget)
                                    .map(([key, value]) => `${key.replace('budget', '').replace(/([A-Z])/g, ' $1').trim()}: ₹${Number(value).toFixed(2)}`)
                                    .join("\n");
                }
            } catch (e) {
                console.log("AI response is not a budget JSON. Treating as text advice.");
            }

            const aiMessage = { 
                sender: 'ai', 
                text: aiAdvice, 
                suggestedBudget: suggestedBudget // Keep for potential future use or display logic if needed
            };

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
                    // Fallback in case initial message is somehow missed or cleared
                    <div className="text-center text-gray-400 mt-10">
                        Ask me a financial question! Try: "What is my current remaining balance?" or "Suggest my budget allocation for this month, leaving ₹2000 for savings."
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
                                <div className="whitespace-pre-wrap">{msg.text}</div> 
                                
                                {/* REMOVED: Apply Budget Button logic is gone */}
                                
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
                        disabled={loading || !isChatUnlocked} // DISABLED BY GATE
                    />
                    <button
                        type="submit"
                        className="p-3 rounded-full bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50"
                        disabled={loading || input.trim().length === 0 || !isChatUnlocked} // DISABLED BY GATE
                    >
                        <Send size={20} className="text-white" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AiChatbot;