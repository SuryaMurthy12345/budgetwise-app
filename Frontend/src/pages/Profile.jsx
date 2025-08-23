import axios from "axios";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                    "http://localhost:8080/api/profile/get-profile",
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
            <Layout>
                <div className="text-center text-gray-600 text-xl mt-10">Loading...</div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="text-center text-red-500 text-lg mt-10">{error}</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 mt-10 border border-gray-200">
                {/* Name & Email */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">{profile.user.name}</h1>
                    <p className="text-gray-500">{profile.user.email}</p>
                </div>

                {/* Financial Details */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                        Financial Details
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Monthly Income</span>
                            <span className="font-medium text-gray-800">₹{profile.income}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Savings Goal</span>
                            <span className="font-medium text-gray-800">₹{profile.savingsGoal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Target Expense</span>
                            <span className="font-medium text-gray-800">₹{profile.targetExpense}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
