import axios from "axios";
import { LayoutDashboard, List, LogOut, User, Wallet } from "lucide-react";
import { useEffect } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";

import Budget from "./Budget/Budget";
import Dashboard from "./dashboard/Dashboard";
import Profile from "./profile/Profile";
import Transaction from "./Transactions/Transaction";

const Screen = () => {
    const navigate = useNavigate();

    const url = "https://murthyapi.xyz"

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth/login", { replace: true });
        }
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await axios.post(
                    `${url}/api/auth/signout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
        } catch (err) {
            console.error("Error during signout:", err);
        } finally {
            localStorage.removeItem("token"); // clear local token
            navigate("/auth/login", { replace: true });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#FAF9F6]">
            {/* Main content switches here */}
            <div className="flex-1 overflow-y-auto p-4">
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transaction" element={<Transaction />} />
                    <Route path="budget" element={<Budget />} />
                    <Route path="profile" element={<Profile />} />
                </Routes>
            </div>

            {/* Bottom Navigation */}
            <nav className="h-16 border-t bg-white flex justify-around items-center shadow-md">
                <NavLink
                    to="/screen/dashboard"
                    className={({ isActive }) =>
                        `flex flex-col items-center text-sm ${isActive ? "text-yellow-500" : "text-gray-500"
                        }`
                    }
                >
                    <LayoutDashboard size={22} />
                    Dashboard
                </NavLink>

                <NavLink
                    to="/screen/transaction"
                    className={({ isActive }) =>
                        `flex flex-col items-center text-sm ${isActive ? "text-yellow-500" : "text-gray-500"
                        }`
                    }
                >
                    <List size={22} />
                    Transactions
                </NavLink>

                <NavLink
                    to="/screen/budget"
                    className={({ isActive }) =>
                        `flex flex-col items-center text-sm ${isActive ? "text-yellow-500" : "text-gray-500"
                        }`
                    }
                >
                    <Wallet size={22} />
                    Budget
                </NavLink>

                <NavLink
                    to="/screen/profile"
                    className={({ isActive }) =>
                        `flex flex-col items-center text-sm ${isActive ? "text-yellow-500" : "text-gray-500"
                        }`
                    }
                >
                    <User size={22} />
                    Profile
                </NavLink>

                {/* 🚀 Sign Out button */}
                <button
                    onClick={handleSignOut}
                    className="flex flex-col items-center text-sm text-gray-500 hover:text-red-500"
                >
                    <LogOut size={22} />
                    Sign Out
                </button>
            </nav>
        </div>
    );
};

export default Screen;
