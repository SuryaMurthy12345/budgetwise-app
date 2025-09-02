import axios from "axios";
import { useEffect, useState } from "react";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

<<<<<<< HEAD
    const url = "https://budgetwise-app-4h23.onrender.com";
=======

    const url = "https://budgetwise-app-4h23.onrender.com"

>>>>>>> 4145fbbf057ecdd1347b41b17c6a9a877dd0fe52

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("You are not logged in.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${url}/api/profile/get-profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-400">
                <p className="text-xl animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-red-500">
                <p className="text-xl">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-gray-100">
            <div className="max-w-3xl mx-auto bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-purple-400">
                        Profile Overview
                    </h1>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                        Edit Profile
                    </button>
                </div>

                {/* User Info */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-purple-700/30 text-purple-400 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                        {profile.user.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-semibold">{profile.user.name}</h2>
                    <p className="text-gray-400">{profile.user.email}</p>
                </div>

                {/* Financial Details */}
                <div>
                    <h3 className="text-xl font-semibold text-center text-gray-300 mb-6">
                        Financial Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-purple-800/40 to-purple-900/30 rounded-lg p-4 shadow hover:scale-105 transition transform text-center">
                            <p className="text-gray-400 text-sm">Monthly Income</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                ₹{profile.income}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-800/40 to-green-900/30 rounded-lg p-4 shadow hover:scale-105 transition transform text-center">
                            <p className="text-gray-400 text-sm">Savings Goal</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                ₹{profile.savingsGoal}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-800/40 to-blue-900/30 rounded-lg p-4 shadow hover:scale-105 transition transform text-center">
                            <p className="text-gray-400 text-sm">Target Expense</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                ₹{profile.targetExpense}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-sm mt-8 italic">
                    Manage your budget like a pro ✨
                </p>
            </div>
        </div>
    );
};

export default Profile;
