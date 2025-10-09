import axios from "axios";
import { Bot, Send, Trash2, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8080";
const LOCAL_STORAGE_KEY = "aiChatHistory";

// Helper function to call the set-budgets API
const applySuggestedBudget = async (month, year, budgetMap, token) => {
    try {
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

const AiChatbot = ({ monthlyData, selectedMonth, isChatUnlocked }) => {
    const [messages, setMessages] = useState(() => {
        const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        const initialMessages = savedHistory ? JSON.parse(savedHistory) : [];
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

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleClearChat = () => {
        if (window.confirm("Are you sure you want to clear the entire chat history?")) {
            setMessages([]);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    };

    const handleApplyBudget = async (budgetMap, messageIndex) => {
        const token = localStorage.getItem("token");
        const [year, month] = selectedMonth.split('-');

        const result = await applySuggestedBudget(month, year, budgetMap, token);

        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const targetMessage = { ...newMessages[messageIndex] };
            
            if (result.success) {
                targetMessage.text = `${targetMessage.text}\n\n✅ Budget Applied Successfully!`;
                targetMessage.applied = true; // Mark as applied
            } else {
                targetMessage.text = `${targetMessage.text}\n\n❌ Error: ${result.error}`;
                targetMessage.applied = 'error'; // Mark with error
            }
            
            newMessages[messageIndex] = targetMessage;
            return newMessages;
        });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || !isChatUnlocked) return;

        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not logged in.");

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

            const response = await axios.post(`${API_URL}/api/ai/chat`,
                { prompt: currentInput, context: contextPayload },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            let aiAdvice = response.data?.advice || "Sorry, I couldn't get a clear response.";
            let suggestedBudget = null;
            
            // **FIXED LOGIC**: Check if the response contains the budget suggestion format and parse correctly
            if (aiAdvice.includes("💡 Here is a suggested budget allocation:")) {
                suggestedBudget = {};
                const lines = aiAdvice.split('\n');
                lines.forEach(line => {
                    if (line.includes(': ₹')) {
                        const [category, amount] = line.split(': ₹');
                        const cleanedCategory = category.replace('-', '').trim().toLowerCase();
                        let key = '';
            
                        if (cleanedCategory.startsWith('food')) {
                            key = 'fooddining';
                        } else if (cleanedCategory.startsWith('transportation')) {
                            key = 'transportation';
                        } else if (cleanedCategory.startsWith('entertainment')) {
                            key = 'entertainment';
                        } else if (cleanedCategory.startsWith('shopping')) {
                            key = 'shopping';
                        } else if (cleanedCategory.startsWith('utilities')) {
                            key = 'utilities';
                        }
                        
                        if (key) {
                            suggestedBudget[key] = parseFloat(amount);
                        }
                    }
                });
                 // Ensure all keys are present
                ['fooddining', 'transportation', 'entertainment', 'shopping', 'utilities'].forEach(k => {
                    if (!suggestedBudget.hasOwnProperty(k)) {
                        suggestedBudget[k] = 0.0;
                    }
                });
            }

            const aiMessage = { sender: 'ai', text: aiAdvice, suggestedBudget };
            setMessages((prev) => [...prev, aiMessage]);

        } catch (err) {
            console.error("AI Chat Error:", err);
            const errorMessage = err.response?.data?.error || "AI Service Unavailable.";
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
                <button
                    onClick={handleClearChat}
                    className="text-gray-400 hover:text-red-400 transition"
                    title="Clear Chat History"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-md ${msg.sender === 'user' ? 'bg-purple-600 text-white' : msg.isError ? 'bg-red-800 text-white border border-red-600' : 'bg-gray-700 text-gray-100'}`}>
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                            {msg.suggestedBudget && !msg.applied && (
                                <button
                                    onClick={() => handleApplyBudget(msg.suggestedBudget, index)}
                                    className="mt-3 flex items-center justify-center w-full px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition"
                                >
                                    <Zap size={16} className="mr-2" />
                                    Apply this Budget
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-lg bg-gray-700 text-gray-100 italic animate-pulse">Thinking...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your financial question..."
                        className="flex-1 px-4 py-2 rounded-full bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        disabled={loading || !isChatUnlocked}
                    />
                    <button
                        type="submit"
                        className="p-3 rounded-full bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50"
                        disabled={loading || input.trim().length === 0 || !isChatUnlocked}
                    >
                        <Send size={20} className="text-white" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AiChatbot;

