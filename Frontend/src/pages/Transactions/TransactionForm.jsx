import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://budgetwise-app-4h23.onrender.com";

const TransactionForm = ({ txn = null, onClose = null, onSuccess = null }) => {
  const navigate = useNavigate();
  const isEdit = !!txn;

  const [form, setForm] = useState({
    description: txn?.description || "",
    amount: txn?.amount != null ? String(txn.amount) : "",
    date: txn?.date ? txn.date.split("T")[0] : "",
    category: txn?.category || "",
    account: txn?.account || "expense", // default to expense
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Not logged in");

      // Ensure numeric amount
      const payload = {
        ...form,
        amount: Number(form.amount) || 0,
      };

      if (isEdit) {
        const id = txn._id || txn.id;
        if (!id) throw new Error("Missing transaction id for update");
        await axios.put(`${API_URL}/api/transaction/update/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Transaction updated!");
      } else {
        await axios.post(`${API_URL}/api/transaction/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Transaction added!");
      }

      if (typeof onSuccess === "function") {
        onSuccess();
      } else {
        // fallback: navigate back to transactions page if no onSuccess provided
        navigate("/transactions");
      }
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || "Error saving transaction");
    }
  };

  const handleCancel = () => {
    if (typeof onClose === "function") onClose();
    else navigate("/transactions");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input
        type="text"
        placeholder="Description"
        className="border p-2 rounded"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        className="border p-2 rounded"
        step="0.01"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />
      <input
        type="date"
        className="border p-2 rounded"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Category"
        className="border p-2 rounded"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <select
        className="border p-2 rounded"
        value={form.account}
        onChange={(e) => setForm({ ...form, account: e.target.value })}
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <div className="flex gap-3 justify-end mt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          {isEdit ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
