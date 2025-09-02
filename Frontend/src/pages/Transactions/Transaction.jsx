<<<<<<< HEAD
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"; // Install Heroicons
=======
>>>>>>> 4145fbbf057ecdd1347b41b17c6a9a877dd0fe52
import axios from "axios";
import { useEffect, useState } from "react";
import TransactionForm from "./TransactionForm";

<<<<<<< HEAD
const API_URL = "https://murthyapi.xyz";
=======
const API_URL = "https://budgetwise-app-4h23.onrender.com";
>>>>>>> 4145fbbf057ecdd1347b41b17c6a9a877dd0fe52

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

=======

  const [selectedMonth, setSelectedMonth] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

>>>>>>> 4145fbbf057ecdd1347b41b17c6a9a877dd0fe52
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

<<<<<<< HEAD
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
=======
  const displayedTxns = filteredByMonth.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalIncome = displayedTxns.reduce((sum, txn) => {
    const acc = (txn.account || "").toString().toLowerCase();
    const amt = Number(txn.amount) || 0;
    return acc === "income" ? sum + amt : sum;
  }, 0);

  const totalExpenses = displayedTxns.reduce((sum, txn) => {
    const acc = (txn.account || "").toString().toLowerCase();
    const amt = Number(txn.amount) || 0;
    return acc === "expense" ? sum + amt : sum;
>>>>>>> 4145fbbf057ecdd1347b41b17c6a9a877dd0fe52
  }, 0);

  const monthlySalary = Number(profile?.income) || 0;
  const remaining = monthlySalary + totalIncome - totalExpenses;

<<<<<<< HEAD
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
=======
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Transactions</h1>

      {/* Month Filter with label */}
      <div className="mb-6 text-center">
        <label className="block mb-2 text-gray-700 font-medium text-lg">
          Select Month
        </label>
        <div className="flex justify-center gap-3">
          <input
            type="month"
            className="border p-2 rounded"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button
            onClick={() => setSelectedMonth("")}
            className="border px-3 py-2 rounded hover:bg-gray-100 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 p-4 rounded text-center">
          <p className="text-sm">Monthly Income</p>
          <p className="text-2xl font-bold">₹{monthlySalary}</p>
        </div>
        <div className="bg-green-100 p-4 rounded text-center">
          <p className="text-sm">Total Credits</p>
          <p className="text-2xl font-bold">₹{totalIncome}</p>
        </div>
        <div className="bg-red-100 p-4 rounded text-center">
          <p className="text-sm">Total Expenses</p>
          <p className="text-2xl font-bold">₹{totalExpenses}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded text-center">
          <p className="text-sm">Remaining</p>
          <p className="text-2xl font-bold">₹{remaining}</p>
        </div>
      </div>

      {/* Section Title */}
      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        {selectedMonth
          ? `Transactions for ${new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}`
          : "Recent Transactions"}
      </h2>

      {/* Add Transaction Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setEditingTxn(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-sm transition text-sm font-medium"
        >
          Add Transaction
        </button>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Account</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedTxns.map((txn) => (
              <tr key={txn._id || txn.id} className="border-t hover:bg-gray-50 transition duration-200">
                <td className="px-4 py-2">{txn.date ? new Date(txn.date).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-2">{txn.description}</td>
                <td className="px-4 py-2">{txn.category || "-"}</td>
                <td className="px-4 py-2 capitalize">{txn.account || "-"}</td>
                <td className="px-4 py-2 text-right">₹{Number(txn.amount) || 0}</td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => { setEditingTxn(txn); setShowForm(true); }}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded-md text-sm shadow-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(txn._id || txn.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm shadow-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {displayedTxns.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No transactions found for the selected month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingTxn ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>

>>>>>>> 4145fbbf057ecdd1347b41b17c6a9a877dd0fe52
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
