import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import Layout from "../../components/Layout";

const ProfileForm = () => {
    const [form, setForm] = useState({
        income: "",
        savingsGoal: "",
        targetExpense: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const url = "https://murthyapi.xyz";

    // Redirect to login if not logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate("/auth/login");
    }, [navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" }); // Clear error for this field
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({}); // Clear previous errors

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/auth/login");
                return;
            }

            await axios.post(`${url}/api/profile/add-profile`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Profile created successfully");
            navigate("/screen/profile");
        } catch (err) {
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === "string") {
                    setErrors({ general: data });
                } else if (data.error) {
                    setErrors({ general: data.error });
                } else if (typeof data === "object") {
                    setErrors(data); // field-specific errors
                } else {
                    setErrors({ general: "Something went wrong. Please try again." });
                }
            } else {
                setErrors({ general: "Something went wrong. Please try again." });
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

            {errors.general && (
                <p className="text-red-500 text-center mb-4">{errors.general}</p>
            )}

            <form className="space-y-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
                <InputField
                    label="Monthly Income"
                    placeholder="Enter your income"
                    name="income"
                    type="number"
                    value={form.income}
                    onChange={handleChange}
                />
                {errors.income && (
                    <p className="text-red-500 text-sm">{errors.income}</p>
                )}

                <InputField
                    label="Savings Goal"
                    placeholder="Enter your savings goal"
                    name="savingsGoal"
                    type="number"
                    value={form.savingsGoal}
                    onChange={handleChange}
                />
                {errors.savingsGoal && (
                    <p className="text-red-500 text-sm">{errors.savingsGoal}</p>
                )}

                <InputField
                    label="Target Expense"
                    placeholder="Enter your target expense"
                    name="targetExpense"
                    type="number"
                    value={form.targetExpense}
                    onChange={handleChange}
                />
                {errors.targetExpense && (
                    <p className="text-red-500 text-sm">{errors.targetExpense}</p>
                )}

                <Button text={loading ? "Saving..." : "Save Profile"} />
            </form>
        </Layout>
    );
};

export default ProfileForm;
