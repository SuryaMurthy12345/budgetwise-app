import axios from "axios";
import { useEffect, useState } from "react";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const url = "https://murthyapi.xyz"

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("You are not logged in.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `${url}/api/profile/get-profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

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
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-gray-500 text-xl">Loading...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Profile Overview
                    </h1>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                        Edit Profile
                    </button>
                </div>

                {/* User Info */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                        {profile.user.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {profile.user.name}
                    </h2>
                    <p className="text-gray-500">{profile.user.email}</p>
                </div>

                {/* Financial Details */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                        Financial Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-4 shadow hover:shadow-lg transition text-center">
                            <p className="text-gray-600 text-sm">Monthly Income</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                ₹{profile.income}
                            </p>
                        </div>
                        <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-lg p-4 shadow hover:shadow-lg transition text-center">
                            <p className="text-gray-600 text-sm">Savings Goal</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                ₹{profile.savingsGoal}
                            </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg p-4 shadow hover:shadow-lg transition text-center">
                            <p className="text-gray-600 text-sm">Target Expense</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
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