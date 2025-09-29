import axios from "axios";
import { useState } from "react";

const API_URL = "http://localhost:8080";

const SavingGoalForm = ({ goal, onClose, onSuccess }) => {
    const isEdit = !!goal;
    const [form, setForm] = useState({
        name: goal?.name || "",
        targetAmount: goal?.targetAmount || "",
        currentAmount: goal?.currentAmount || 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found.");

            const payload = {
                ...form,
                targetAmount: Number(form.targetAmount),
                currentAmount: Number(form.currentAmount),
            };

            if (isEdit) {
                await axios.put(`${API_URL}/api/saving-goals/${goal.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${API_URL}/api/saving-goals`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            onSuccess();
        } catch (err) {
            console.error("Failed to save goal:", err);
            setError(err.response?.data?.error || "Failed to save goal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm text-gray-100">
            <h2 className="text-2xl font-bold mb-4">{isEdit ? "Edit Saving Goal" : "Add New Saving Goal"}</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Goal Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Target Amount</label>
                    <input
                        type="number"
                        value={form.targetAmount}
                        onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        step="0.01"
                        min="0"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Current Amount</label>
                    <input
                        type="number"
                        value={form.currentAmount}
                        onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        step="0.01"
                        min="0"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Goal"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SavingGoalForm;