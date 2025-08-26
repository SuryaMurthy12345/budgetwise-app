import React, { useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const AddTransaction = () => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense", 
    date: "", 
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

      await axios.post("http://localhost:8080/api/transactions/add", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Transaction added successfully");
      navigate("/profile"); 
    } catch (err) {
      console.error("Error adding transaction:", err);
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
      <h1 className="text-4xl font-extrabold text-center">Add Transaction</h1>
      <p className="text-sm mt-2 mb-6 text-gray-800 text-center">
        Record your income or expense
      </p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Title"
          placeholder="E.g. Grocery, Salary"
          name="title"
          value={form.title}
          onChange={handleChange}
        />
        <InputField
          label="Amount"
          type="number"
          placeholder="Enter amount"
          name="amount"
          value={form.amount}
          onChange={handleChange}
        />
        <InputField
          label="Category"
          placeholder="E.g. Food, Travel, Bills"
          name="category"
          value={form.category}
          onChange={handleChange}
        />

        <InputField
          label="Date"
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />

        {/* Type Selector */}
        <div className="flex flex-col w-full mb-4">
          <label className="text-sm text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-full border border-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <Button text={loading ? "Saving..." : "Add Transaction"} />
      </form>
    </Layout>
  );
};

export default AddTransaction;