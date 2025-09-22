import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import TransactionForm from "./TransactionForm";

const API_URL = "http://localhost:8080";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    startingBalance: 0,
    totalCredits: 0,
    totalExpenses: 0,
    remainingBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const monthInputRef = useRef(null);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchData(selectedMonth);
    }
  }, [selectedMonth]);

  const fetchData = async (month) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const [year, monthVal] = month.split("-");

      const transactionRes = await axios.get(
        `${API_URL}/api/transaction/monthly?year=${year}&month=${monthVal}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = transactionRes.data;
      const txns = data?.transactions || [];

      setTransactions(Array.isArray(txns) ? txns : []);
      setSummary({
        startingBalance: data.startingBalance,
        totalCredits: data.totalCredits,
        totalExpenses: data.totalExpenses,
        remainingBalance: data.remainingBalance,
      });
      setError("");

    } catch (err) {
      console.error("Transaction Fetch Error:", err.response?.data || err.message);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return alert("No ID to delete");
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");
      const res = await axios.delete(`${API_URL}/api/transaction/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data?.message || "Transaction deleted!");
      fetchData(selectedMonth);
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Error deleting transaction");
    }
  };

  const handleSetStartingBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in.");
      return;
    }
    const [year, month] = selectedMonth.split("-");
    try {
      await axios.post(
        `${API_URL}/api/transaction/set-starting-balance`,
        null, // Send empty body for POST with params
        {
          params: {
            year: Number(year),
            month: Number(month),
            balance: Number(summary.startingBalance)
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchData(selectedMonth); // Refresh the data to show updated stats
    } catch (err) {
      console.error("Failed to set starting balance:", err);
      alert("Failed to set starting balance.");
    }
  };

  const groupedByDate = transactions.reduce((acc, txn) => {
    const dateKey = new Date(txn.date).toLocaleDateString("en-GB");
    if (!acc[dateKey]) acc[dateKey] = { income: [], expense: [] };
    const type = (txn.account || "").toLowerCase();
    if (type === "income" || type === "borrow") acc[dateKey].income.push(txn);
    else if (type === "expense") acc[dateKey].expense.push(txn);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("/").map(Number);
    const [dayB, monthB, yearB] = b.split("/").map(Number);
    return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
  });

  if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300">
        Transaction Dashboard
      </h1>

      {/* Filter and Starting Balance Input */}
      <div className="mb-10 text-center flex flex-col md:flex-row justify-center items-center gap-4">
        <div
          onClick={() => monthInputRef.current.showPicker()}
          className="relative inline-flex items-center justify-between p-3 rounded-lg shadow-lg border border-gray-700 bg-gray-800 text-gray-100 cursor-pointer hover:bg-gray-700 transition"
        >
          <span className="text-lg font-medium pr-4">{selectedMonth}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-400">
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

        <div className="flex flex-col md:flex-row items-center gap-4">
          <label className="text-sm font-medium">Starting Balance:</label>
          <input
            type="number"
            value={summary.startingBalance}
            onChange={(e) => setSummary({ ...summary, startingBalance: e.target.value })}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
          />
          <button
            onClick={handleSetStartingBalance}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition shadow-md"
          >
            Set Balance
          </button>
        </div>

        <button
          onClick={() => setSelectedMonth(currentMonth)}
          className="px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition shadow-md"
        >
          Reset
        </button>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { title: "Starting Balance", value: summary.startingBalance, color: "from-blue-500/20 to-blue-700/20" },
          { title: "Total Credits", value: summary.totalCredits, color: "from-green-500/20 to-green-700/20" },
          { title: "Total Expenses", value: summary.totalExpenses, color: "from-red-500/20 to-red-700/20" },
          { title: "Remaining", value: summary.remainingBalance, color: "from-yellow-500/20 to-yellow-700/20" },
        ].map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl shadow-lg backdrop-blur-lg bg-gradient-to-br ${card.color} hover:scale-105 transition`}
          >
            <p className="text-sm opacity-80">{card.title}</p>
            <p className="text-3xl font-bold mt-2">₹{card.value}</p>
          </div>
        ))}
      </div>

      {/* Add Transaction Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={() => { setEditingTxn(null); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg font-semibold shadow-md transition transform hover:scale-105"
        >
          ➕ Add Transaction
        </button>
      </div>

      {/* Transactions with Scrollbar */}
      <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedDates.length === 0 && <p className="text-center text-gray-500">No transactions found.</p>}
        {sortedDates.map((date) => (
          <div key={date} className="backdrop-blur-lg bg-gray-800/50 p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">{date}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Expenses */}
              <div>
                <h4 className="text-red-400 mb-4 text-lg font-medium">Expenses</h4>
                {groupedByDate[date].expense.length > 0 ? (
                  groupedByDate[date].expense.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex justify-between items-center bg-red-500/10 p-4 mb-3 rounded-lg hover:bg-red-500/20 transition"
                    >
                      <span>{txn.description || txn.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 font-semibold">₹{txn.amount}</span>
                        <button onClick={() => { setEditingTxn(txn); setShowForm(true); }} className="text-indigo-400 hover:text-indigo-500">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(txn.id)} className="text-red-400 hover:text-red-500">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No expenses</p>
                )}
              </div>
              {/* Income */}
              <div>
                <h4 className="text-green-400 mb-4 text-lg font-medium">Income</h4>
                {groupedByDate[date].income.length > 0 ? (
                  groupedByDate[date].income.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex justify-between items-center bg-green-500/10 p-4 mb-3 rounded-lg hover:bg-green-500/20 transition"
                    >
                      <span>{txn.description || txn.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-semibold">₹{txn.amount}</span>
                        <button onClick={() => { setEditingTxn(txn); setShowForm(true); }} className="text-indigo-400 hover:text-indigo-500">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(txn.id)} className="text-red-400 hover:text-red-500">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No income</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-xl">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">{editingTxn ? "Edit Transaction" : "Add Transaction"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <TransactionForm
              txn={editingTxn}
              onClose={() => setShowForm(false)}
              onSuccess={() => { setShowForm(false); fetchData(selectedMonth); }}
              selectedMonth={selectedMonth}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;