import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"; // Install Heroicons
import axios from "axios";
import { useEffect, useState } from "react";
import TransactionForm from "./TransactionForm";

const API_URL = "https://murthyapi.xyz";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(currentMonth);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const profileRes = await axios.get(`${API_URL}/api/profile/get-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(profileRes.data);

      const transactionRes = await axios.get(`${API_URL}/api/transaction/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const txns = transactionRes.data?.data || transactionRes.data || [];
      setTransactions(Array.isArray(txns) ? txns : []);
    } catch (err) {
      console.error("Transaction Fetch Error:", err.response?.data || err.message);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return alert("No id to delete");
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Not logged in");
      const res = await axios.delete(`${API_URL}/api/transaction/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data?.message || "Transaction deleted!");
      fetchData();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Error deleting transaction");
    }
  };

  const filteredByMonth = transactions.filter((txn) => {
    if (!selectedMonth) return true;
    if (!txn?.date) return false;
    const txnDate = new Date(txn.date);
    const txnMonth = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, "0")}`;
    return txnMonth === selectedMonth;
  });

  const groupedByDate = filteredByMonth.reduce((acc, txn) => {
    const dateKey = new Date(txn.date).toLocaleDateString("en-GB");
    if (!acc[dateKey]) acc[dateKey] = { income: [], expense: [] };
    const type = (txn.account || "").toLowerCase();
    if (type === "income") acc[dateKey].income.push(txn);
    else if (type === "expense") acc[dateKey].expense.push(txn);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("/").map(Number);
    const [dayB, monthB, yearB] = b.split("/").map(Number);
    return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
  });

  const totalIncome = filteredByMonth.reduce((sum, txn) => {
    return (txn.account || "").toLowerCase() === "income" ? sum + Number(txn.amount) : sum;
  }, 0);

  const totalExpenses = filteredByMonth.reduce((sum, txn) => {
    return (txn.account || "").toLowerCase() === "expense" ? sum + Number(txn.amount) : sum;
  }, 0);

  const monthlySalary = Number(profile?.income) || 0;
  const remaining = monthlySalary + totalIncome - totalExpenses;

  if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300">
        Transaction Dashboard
      </h1>

      {/* Filter */}
      <div className="mb-10 text-center">
        <input
          type="month"
          className="bg-gray-800 text-gray-100 p-3 rounded-lg shadow-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <button
          onClick={() => setSelectedMonth("")}
          className="ml-4 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition shadow-md"
        >
          Reset
        </button>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { title: "Monthly Income", value: monthlySalary, color: "from-blue-500/20 to-blue-700/20" },
          { title: "Total Credits", value: totalIncome, color: "from-green-500/20 to-green-700/20" },
          { title: "Total Expenses", value: totalExpenses, color: "from-red-500/20 to-red-700/20" },
          { title: "Remaining", value: remaining, color: "from-yellow-500/20 to-yellow-700/20" },
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
                      key={txn._id || txn.id}
                      className="flex justify-between items-center bg-red-500/10 p-4 mb-3 rounded-lg hover:bg-red-500/20 transition"
                    >
                      <span>{txn.description || txn.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 font-semibold">₹{txn.amount}</span>
                        <button onClick={() => { setEditingTxn(txn); setShowForm(true); }} className="text-indigo-400 hover:text-indigo-500">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(txn._id || txn.id)} className="text-red-400 hover:text-red-500">
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
                <h4 className="text-green-400 mb-4 text-lg font-medium">Incoming</h4>
                {groupedByDate[date].income.length > 0 ? (
                  groupedByDate[date].income.map((txn) => (
                    <div
                      key={txn._id || txn.id}
                      className="flex justify-between items-center bg-green-500/10 p-4 mb-3 rounded-lg hover:bg-green-500/20 transition"
                    >
                      <span>{txn.description || txn.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-semibold">₹{txn.amount}</span>
                        <button onClick={() => { setEditingTxn(txn); setShowForm(true); }} className="text-indigo-400 hover:text-indigo-500">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(txn._id || txn.id)} className="text-red-400 hover:text-red-500">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No Incoming transactions</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {sortedDates.length === 0 && <p className="text-center text-gray-500">No transactions found.</p>}
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
              onSuccess={() => { setShowForm(false); fetchData(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;
