import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaCar, FaFilm, FaHome, FaShoppingCart, FaUtensils } from "react-icons/fa";
import BudgetForm from "./BudgetForm";

const API_URL = "http://localhost:8080";

const CATEGORY_TO_KEY_MAP = {
  "Food & dining": "budgetFood",
  "Transportation": "budgetTransportation",
  "Entertainment": "budgetEntertainment",
  "Shopping": "budgetShopping",
  "Utilities": "budgetUtilities",
};

const Budget = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const monthInputRef = useRef(null);
  const [formBudgets, setFormBudgets] = useState({});

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchMonthlyStats();
    }
  }, [selectedMonth]);

  const fetchMonthlyStats = async () => {
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

      const response = await axios.get(
        `${API_URL}/api/transaction/monthly?year=${year}&month=${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStats(response.data);
    } catch (err) {
      console.error("Budget Fetch Error:", err.response?.data || err.message);
      setError("Failed to load budget data.");
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBudgetForm = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const [year, month] = selectedMonth.split("-");
      const response = await axios.get(
        `${API_URL}/api/transaction/monthly?year=${year}&month=${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const fetchedBudgets = {
        "Food & dining": response.data.budgetFood,
        "Transportation": response.data.budgetTransportation,
        "Entertainment": response.data.budgetEntertainment,
        "Shopping": response.data.budgetShopping,
        "Utilities": response.data.budgetUtilities,
      };

      setFormBudgets(fetchedBudgets);
      setStats(response.data);
      setShowBudgetForm(true);

    } catch (err) {
      console.error("Failed to fetch budgets:", err);
      setError("Failed to load budgets for the form.");
    } finally {
      setLoading(false);
    }
  };

  const calculateRemaining = (category) => {
    const expenses = stats?.transactions?.filter(txn => txn.category === category && txn.account === "expense")
      .reduce((total, txn) => total + txn.amount, 0) || 0;

    const budgetKey = CATEGORY_TO_KEY_MAP[category];
    const budget = stats?.[budgetKey] || 0;

    return budget - expenses;
  };

  const getIcon = (category) => {
    switch (category) {
      case "Food & dining":
        return <FaUtensils size={24} />;
      case "Transportation":
        return <FaCar size={24} />;
      case "Entertainment":
        return <FaFilm size={24} />;
      case "Shopping":
        return <FaShoppingCart size={24} />;
      case "Utilities":
        return <FaHome size={24} />;
      default:
        return null;
    }
  };

  if (loading) return <p className="text-center mt-10 text-lg">Loading budget...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const categories = ["Food & dining", "Transportation", "Entertainment", "Shopping", "Utilities"];

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-400 to-indigo-300">
        Monthly Budgets
      </h1>

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
        <button
          onClick={handleOpenBudgetForm}
          className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 font-semibold shadow-md transition transform hover:scale-105"
        >
          ✍️ Set Budgets
        </button>
      </div>

      {/* Changed to a vertical grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => {
          const budget = stats?.[CATEGORY_TO_KEY_MAP[category]] || 0;
          const remaining = calculateRemaining(category);
          const isOverbudget = remaining < 0;

          return (
            <div
              key={category}
              className="p-6 rounded-xl shadow-lg backdrop-blur-lg bg-gray-800/60 border border-gray-700 hover:scale-105 transition"
            >
              <div className="flex items-center gap-4 mb-4 text-purple-400">
                {getIcon(category)}
                <p className="text-lg font-semibold">{category}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Budget</p>
                <h3 className="text-xl font-bold mt-1">₹{budget.toFixed(2)}</h3>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm opacity-80">Remaining</p>
                <p className={`text-2xl font-bold ${isOverbudget ? 'text-red-400' : 'text-green-400'}`}>
                  ₹{remaining.toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showBudgetForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md">
            <BudgetForm
              year={selectedMonth.split("-")[0]}
              month={selectedMonth.split("-")[1]}
              initialBudgets={formBudgets}
              startingBalance={stats.startingBalance}
              onClose={() => setShowBudgetForm(false)}
              onSave={fetchMonthlyStats}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;