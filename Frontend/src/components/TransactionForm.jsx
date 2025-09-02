import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://budgetwise-app-4h23.onrender.com/api/transaction";

export default function TransactionForm({ onTransactionSaved, editingTransaction }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("EXPENSE");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount);
      setCategory(editingTransaction.category);
      setAccount(editingTransaction.account);
      setDate(editingTransaction.date);
    } else {
      resetForm();
    }
  }, [editingTransaction]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setAccount("EXPENSE");
    setDate("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { description, amount, category, account, date };

    try {
      if (editingTransaction) {
        await axios.put(`${API_BASE}/update/${editingTransaction.id}`, data);
      } else {
        await axios.post(`${API_BASE}/add`, data);
      }
      resetForm();
      onTransactionSaved();
    } catch (err) {
      console.error("Failed to save transaction", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Category (Food, Rent, etc.)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <select
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      </div>
      <div className="mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingTransaction ? "Update" : "Add"} Transaction
        </button>
      </div>
    </form>
  );
}
