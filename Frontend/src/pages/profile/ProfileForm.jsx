import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Layout from "../components/Layout";

const ProfileForm = () => {
    const [form, setForm] = useState({
        income: "",
        savingsGoal: "",
        targetExpense: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You are not logged in.");
                setLoading(false);
                return;
            }

            // ✅ API call
            await axios.post("http://localhost:8080/api/profile/add-profile", form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Profile created successfully");
            navigate("/profile"); // ✅ Redirect after success
        } catch (err) {
            console.error("Profile creation error:", err);

            // ✅ Show backend validation errors
            if (err.response && err.response.data) {
                if (typeof err.response.data === "string") {
                    setError(err.response.data); // e.g. "Profile already exists..."
                } else if (err.response.data.error) {
                    setError(err.response.data.error); // e.g. {"error": "..."}
                } else {
                    setError("Something went wrong. Please try again.");
                }
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <h1 className="text-4xl font-extrabold text-center">Create Your Profile</h1>
            <p className="text-sm mt-2 mb-6 text-gray-800 text-center">
                Please enter your financial details
            </p>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <form className="space-y-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
                <InputField
                    label="Monthly Income"
                    placeholder="Enter your income"
                    name="income"
                    type="number"
                    value={form.income}
                    onChange={handleChange}
                />
                <InputField
                    label="Savings Goal"
                    placeholder="Enter your savings goal"
                    name="savingsGoal"
                    type="number"
                    value={form.savingsGoal}
                    onChange={handleChange}
                />
                <InputField
                    label="Target Expense"
                    placeholder="Enter your target expense"
                    name="targetExpense"
                    type="number"
                    value={form.targetExpense}
                    onChange={handleChange}
                />
                <Button text={loading ? "Saving..." : "Save Profile"} />
            </form>
        </Layout>
    );
};

export default ProfileForm;
