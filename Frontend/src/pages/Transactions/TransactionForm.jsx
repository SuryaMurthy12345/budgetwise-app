import axios from "axios";
import { useState } from "react";

const API_URL = "https://budgetwise-app-4h23.onrender.com";

const TransactionForm = ({ txn = null, onClose = null, onSuccess = null }) => {
  const isEdit = !!txn;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    description: txn?.description || "",
    amount: txn?.amount != null ? String(txn.amount) : "",
    date: txn?.date ? txn.date.split("T")[0] : today, // Default to today's date
    category: txn?.category || "",
    account: txn?.account || "expense",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const payload = {
        ...form,
        amount: Number(form.amount) || 0,
      };

      if (isEdit) {
        const id = txn._id || txn.id;
        if (!id) {
          throw new Error("Missing transaction ID for update.");
        }
        await axios.put(`${API_URL}/api/transaction/update/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/transaction/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (typeof onSuccess === "function") {
        onSuccess();
      }

    } catch (err) {
      const serverError = err.response?.data || err.message;
      setErrorMessage(serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          type="text"
          placeholder="Description"
          className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          type="date"
          className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          max={today}
        />
        <input
          type="text"
          placeholder="Category"
          className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <select
          className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update" : "Add")}
          </button>
        </div>
      </form>

      {/* Error Message Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-red-400 mb-4">Error</h3>
            <p className="text-gray-300 mb-6">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage("")}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionForm;
