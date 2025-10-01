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
    const url = "http://localhost:8080";

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
            localStorage.removeItem("token");
            navigate("/auth/login", { replace: true });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-200">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transaction" element={<Transaction />} />
                    <Route path="budget" element={<Budget />} />
                    <Route path="profile" element={<Profile />} />
                </Routes>
            </div>

            {/* Bottom Navigation */}
            <nav className="h-16 border-t border-gray-700 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 
                flex justify-around items-center shadow-md backdrop-blur-md">

                <NavLink
                    to="/screen/dashboard"
                    className={({ isActive }) =>
                        `flex flex-col items-center text-xs transition-all duration-300 ${isActive ? "text-purple-400 scale-110" : "text-gray-400 hover:text-purple-300"
                        }`
                    }
                >
                    <LayoutDashboard size={22} />
                    Dashboard
                </NavLink>

                <NavLink
                    to="/screen/transaction"
                    className={({ isActive }) =>
                        `flex flex-col items-center text-xs transition-all duration-300 ${isActive ? "text-purple-400 scale-110" : "text-gray-400 hover:text-purple-300"
                        }`
                    }
                >
                    <List size={22} />
                    Transactions
                </NavLink>

                <NavLink
                    to="/screen/budget"
                    className={({ isActive }) =>
                        `flex flex-col items-center text-xs transition-all duration-300 ${isActive ? "text-purple-400 scale-110" : "text-gray-400 hover:text-purple-300"
                        }`
                    }
                >
                    <Wallet size={22} />
                    Budget
                </NavLink>

                <NavLink
                    to="/screen/profile"
                    className={({ isActive }) =>
                        `flex flex-col items-center text-xs transition-all duration-300 ${isActive ? "text-purple-400 scale-110" : "text-gray-400 hover:text-purple-300"
                        }`
                    }
                >
                    <User size={22} />
                    Profile
                </NavLink>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="flex flex-col items-center text-xs text-gray-400 hover:text-red-500 transition-all duration-300"
                >
                    <LogOut size={22} />
                    Sign Out
                </button>
            </nav>
        </div>
    );
};

export default Screen;