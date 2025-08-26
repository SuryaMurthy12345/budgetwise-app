import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout"

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8080/api/dashboard/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSummary(response.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-500 text-xl">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <Layout>
      <h1 className="text-4xl font-extrabold text-center mb-6">Dashboard</h1>
      <p className="text-sm mb-8 text-gray-800 text-center">
        Welcome back! Here’s your financial overview ✨
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl p-6 shadow text-center">
          <p className="text-gray-600 text-sm">Total Income</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            ₹{summary?.totalIncome || 0}
          </p>
        </div>
        <div className="bg-gradient-to-r from-red-100 to-red-50 rounded-xl p-6 shadow text-center">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            ₹{summary?.totalExpenses || 0}
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-6 shadow text-center">
          <p className="text-gray-600 text-sm">Savings</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            ₹{summary?.savings || 0}
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-6 shadow text-center">
          <p className="text-gray-600 text-sm">Active Budgets</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {summary?.budgetsCount || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Quick Actions
      </h2>
      <div className="flex flex-col space-y-3">
        <Link
          to="/addTransaction"
          className="w-full text-center py-3 rounded-full bg-[#4B2E05] text-white font-bold shadow-lg hover:bg-[#3A2203] transition duration-200"
        >
          ➕ Add Transaction
        </Link>
        <Link
          to="/budget"
          className="w-full text-center py-3 rounded-full bg-orange-500 text-white font-bold shadow-lg hover:bg-orange-600 transition duration-200"
        >
          📊 Set Budget
        </Link>
        <Link
          to="/profile"
          className="w-full text-center py-3 rounded-full bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-600 transition duration-200"
        >
          👤 View Profile
        </Link>
      </div>
    </Layout>
  );
};

export default Dashboard;