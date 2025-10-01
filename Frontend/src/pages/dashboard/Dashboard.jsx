import axios from "axios";
import { Bot } from "lucide-react"; // Import Bot for the button icon
import { useEffect, useRef, useState } from "react";
import AiChatbot from "./AiChatbot";
import CategorySpendingChart from "./CategorySpendingChart";
import IncomeVsExpensesChart from "./IncomeVsExpensesChart";
import MonthlySpendingChart from "./MonthlySpendingChart";

const API_URL = "http://localhost:8080";

const Dashboard = () => {
    const [monthlyTrends, setMonthlyTrends] = useState([]);
    const [monthlyData, setMonthlyData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const monthInputRef = useRef(null);
    const [isChatUnlocked, setIsChatUnlocked] = useState(false); // NEW STATE: Chat Gate

    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    useEffect(() => {
        setSelectedMonth(currentMonth);
    }, []);

    useEffect(() => {
        if (selectedMonth) {
            fetchDashboardData();
        }
    }, [selectedMonth]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You are not logged in.");
                setLoading(false);
                return;
            }

            const [year, month] = selectedMonth.split("-");

            // Fetch spending trends for the chart
            const trendsResponse = await axios.get(`${API_URL}/api/transaction/spending-trends`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedTrends = trendsResponse.data.map(item => ({
                label: `${monthNames[item.month - 1]} ${item.year}`,
                amount: item.totalExpense,
            }));
            setMonthlyTrends(formattedTrends);

            // Fetch monthly data for the selected month
            const monthlyResponse = await axios.get(`${API_URL}/api/transaction/monthly?year=${year}&month=${month}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMonthlyData(monthlyResponse.data);

        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const getCategorySpending = () => {
        if (!monthlyData.transactions) return [];

        const categorySpending = monthlyData.transactions
            .filter(txn => txn.account === "expense")
            .reduce((acc, txn) => {
                acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
                return acc;
            }, {});

        return Object.entries(categorySpending).map(([category, amount]) => ({
            category,
            amount,
        }));
    };

    if (loading) return <p className="text-center mt-10 text-lg">Loading dashboard...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

    const categorySpendingList = getCategorySpending();

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen text-gray-100">
            <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-sky-400 to-blue-300">
                Dashboard
            </h1>

            {/* 1. Monthly Spending Chart */}
            <div className="p-6 rounded-xl shadow-lg backdrop-blur-lg bg-gray-800/60 border border-gray-700 mb-8">
                <h2 className="text-2xl font-bold mb-4">Monthly Spending</h2>
                <MonthlySpendingChart data={monthlyTrends} />
            </div>

            {/* 2. Month Selector */}
            <div className="mb-10 text-center flex flex-col md:flex-row justify-center items-center gap-4">
                <div
                    onClick={() => monthInputRef.current.showPicker()}
                    className="relative inline-flex items-center justify-between p-3 rounded-lg shadow-lg border border-gray-700 bg-gray-800 text-gray-100 cursor-pointer hover:bg-gray-700 transition"
                >
                    <span className="text-lg font-medium pr-4">{selectedMonth}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Z" />
                    </svg>
                    <input
                        type="month"
                        ref={monthInputRef}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        max={currentMonth}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 3. Category-wise Spending */}
                <div className="p-6 rounded-xl shadow-lg backdrop-blur-lg bg-gray-800/60 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4">Category Spending</h2>
                    <CategorySpendingChart data={categorySpendingList} />
                </div>

                {/* 4. Income vs. Expenses */}
                <div className="p-6 rounded-xl shadow-lg backdrop-blur-lg bg-gray-800/60 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4">Income vs. Expenses</h2>
                    <IncomeVsExpensesChart monthlyData={monthlyData} />
                </div>
            </div>

            {/* 5. AI Chatbot Integration */}
            <div className="mt-8 h-[450px]">
                {/* NEW CODE: Chat Unlock Button / Placeholder */}
                {!isChatUnlocked && (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 text-center">
                        <Bot size={48} className="text-purple-400 mb-4" />
                        <h2 className="text-xl font-semibold mb-6">Activate AI Assistant</h2>
                        <p className="text-gray-400 mb-6">
                            Click below to start chatting with BudgetWise AI for financial suggestions and budget allocation.
                        </p>
                        <button
                            onClick={() => setIsChatUnlocked(true)}
                            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 font-semibold shadow-md transition transform hover:scale-105"
                        >
                            Start Chat
                        </button>
                    </div>
                )}

                {/* EXISTING CODE: Chatbot Display, only shown when unlocked */}
                {isChatUnlocked && (
                    <AiChatbot
                        monthlyData={monthlyData}
                        selectedMonth={selectedMonth}
                        isChatUnlocked={isChatUnlocked} // Pass state down to enable input
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;