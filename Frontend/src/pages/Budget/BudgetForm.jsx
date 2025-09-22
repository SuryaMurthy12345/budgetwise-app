import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

const CATEGORIES = ["Food & dining", "Transportation", "Entertainment", "Shopping", "Utilities"];

const BudgetForm = ({ year, month, onClose, onSave, initialBudgets, startingBalance }) => {
    // Store the budgets as strings to allow user to edit the input freely
    const [budgets, setBudgets] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Pre-fill the form with initial budgets, converted to strings
        const initialBudgetsAsString = {};
        for (const category of CATEGORIES) {
            initialBudgetsAsString[category] = initialBudgets[category]?.toString() || "";
        }
        setBudgets(initialBudgetsAsString);
    }, [initialBudgets]);

    const handleBudgetChange = (category, value) => {
        // Keep the value as a string in state
        setBudgets((prevBudgets) => ({
            ...prevBudgets,
            [category]: value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError("");

        // Convert to numbers for validation
        const numericBudgets = Object.fromEntries(
            Object.entries(budgets).map(([key, value]) => [key, Number(value) || 0])
        );
        const totalBudget = Object.values(numericBudgets).reduce((sum, value) => sum + value, 0);

        if (totalBudget > startingBalance) {
            setError(`Total budget (₹${totalBudget}) cannot exceed your starting balance (₹${startingBalance}).`);
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found.");

            const payload = Object.fromEntries(
                Object.entries(numericBudgets).map(([key, value]) => [
                    key.replace(" ", "").replace("&", "").toLowerCase(),
                    value,
                ])
            );

            await axios.post(
                `${API_URL}/api/transaction/set-budgets?year=${year}&month=${month}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to set budgets:", err.response?.data || err.message);
            setError("Failed to save budgets.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-xl text-gray-100">
            <h2 className="text-xl font-bold mb-4">Set Monthly Budgets for {month}/{year}</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="space-y-4">
                {CATEGORIES.map((category) => (
                    <div key={category} className="flex justify-between items-center">
                        <label className="text-sm">{category}:</label>
                        <input
                            type="number"
                            value={budgets[category]}
                            onChange={(e) => handleBudgetChange(category, e.target.value)}
                            className="w-24 px-2 py-1 rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            step="0.01"
                            min="0"
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-end mt-6 space-x-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Budgets"}
                </button>
            </div>
        </div>
    );
};

export default BudgetForm;