import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const Budget = () => {
  const [form, setForm] = useState({
    category: "",
    limit: "",
    period: "monthly", // monthly | yearly
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

      await axios.post("http://localhost:8080/api/budget/add", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Budget added successfully");
      navigate("/profile"); // ✅ redirect back after setting budget
    } catch (err) {
      console.error("Error adding budget:", err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-4xl font-extrabold text-center">Set Your Budget</h1>
      <p className="text-sm mt-2 mb-6 text-gray-800 text-center">
        Plan your spending by setting a budget
      </p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Category"
          placeholder="E.g. Food, Travel, Entertainment"
          name="category"
          value={form.category}
          onChange={handleChange}
        />
        <InputField
          label="Budget Limit"
          type="number"
          placeholder="Enter budget amount"
          name="limit"
          value={form.limit}
          onChange={handleChange}
        />

        {/* Period Selector */}
        <div className="flex flex-col w-full mb-4">
          <label className="text-sm text-gray-700 mb-1">Period</label>
          <select
            name="period"
            value={form.period}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-full border border-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <Button text={loading ? "Saving..." : "Set Budget"} />
      </form>
    </Layout>
  );
};

export default Budget;