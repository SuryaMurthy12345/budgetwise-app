import axios from "axios";
import { useEffect, useState } from "react";
import { FaMoneyBillWave, FaPlus, FaShieldAlt } from "react-icons/fa";
import SavingsGoalForm from "./SavingGoalForm";

const API_URL = "http://localhost:8080";

const getIcon = (goalName) => {
    if (goalName.toLowerCase().includes("vacation")) {
        return <FaMoneyBillWave className="text-blue-400" size={24} />;
    } else if (goalName.toLowerCase().includes("emergency")) {
        return <FaShieldAlt className="text-yellow-400" size={24} />;
    } else {
        return <FaMoneyBillWave className="text-gray-400" size={24} />;
    }
};

const SavingGoals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You are not logged in.");
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_URL}/api/saving-goals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(response.data);
        } catch (err) {
            console.error("Error fetching saving goals:", err);
            setError("Failed to load saving goals.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not logged in");
            await axios.delete(`${API_URL}/api/saving-goals/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchGoals();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting goal.");
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading saving goals...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Savings Goals</h2>
                <button
                    onClick={() => {
                        setEditingGoal(null);
                        setShowForm(true);
                    }}
                    className="p-2 rounded-full bg-purple-600 hover:bg-purple-500 transition"
                >
                    <FaPlus size={16} />
                </button>
            </div>

            <div className="space-y-4">
                {goals.length === 0 && <p className="text-gray-400">No saving goals found. Add one to get started!</p>}
                {goals.map((goal) => (
                    <div
                        key={goal.id}
                        className="p-4 rounded-lg bg-gray-800/60 border border-gray-700 flex justify-between items-center"
                    >
                        <div className="flex items-center space-x-4">
                            {getIcon(goal.name)}
                            <div>
                                <p className="font-semibold">{goal.name}</p>
                                <p className="text-sm text-gray-400">
                                    ₹{goal.currentAmount} / ₹{goal.targetAmount}
                                </p>
                                <p className="text-sm text-gray-400">
                                    ₹{goal.targetAmount - goal.currentAmount} remaining
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => {
                                    setEditingGoal(goal);
                                    setShowForm(true);
                                }}
                                className="text-indigo-400 hover:text-indigo-300"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(goal.id)}
                                className="text-red-400 hover:text-red-300"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <SavingsGoalForm
                        goal={editingGoal}
                        onClose={() => setShowForm(false)}
                        onSuccess={() => {
                            setShowForm(false);
                            fetchGoals();
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default SavingGoals;