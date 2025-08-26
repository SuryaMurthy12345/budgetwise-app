import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Layout from "../../components/Layout"; // adjust path

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 🔹 mock login state
  const navigate = useNavigate();

  // Fetch transactions from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/transactions") // replace with your backend URL
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error(err));
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
      });
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // Handle Edit → redirect with state
  const handleEdit = (transaction) => {
    navigate("/transactions/AddTransaction", { state: { transaction } }); // 🔹 fixed path
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#4B2E05]">Transactions</h2>

        {/* 🔹 Add Transaction button if logged in */}
        {isLoggedIn && (
          <button
            onClick={() => navigate("/transactions/AddTransaction")}
            className="px-4 py-2 rounded-lg bg-[#4B2E05] text-white font-medium hover:bg-[#3A2203] transition"
          >
            + Add Transaction
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="text-gray-600">No transactions yet.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center p-4 rounded-lg border border-gray-300"
            >
              {/* Transaction Info */}
              <div>
                <p className="font-semibold text-[#4B2E05]">{t.title}</p>
                <p className="text-sm text-gray-600">
                  {t.date} · ${t.amount}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(t)}
                  className="text-orange-600 hover:text-orange-800"
                >
                  <FiEdit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Transactions;