import { useEffect, useState } from "react";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // The URL should be configured here.
    const url = "http://localhost:8080";

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("You are not logged in.");
                    setLoading(false);
                    return;
                }

                // In a real application, you would have a backend endpoint like this to get
                // user details (name, email) without financial data.
                // For now, we'll use a mock object since the Profile model was removed.
                const mockUser = {
                    name: "John Doe",
                    email: "john.doe@example.com",
                };

                // Simulate an API call
                setTimeout(() => {
                    setUser(mockUser);
                    setLoading(false);
                }, 500);

                // Example of a real API call if a user endpoint is created on the backend:
                // const response = await axios.get(`${url}/api/user/get-user-details`, {
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });
                // setUser(response.data);

            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user data.");
                setLoading(false);
            }
        };

        fetchUserData();
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
                        {user.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-semibold">{user.name}</h2>
                    <p className="text-gray-400">{user.email}</p>
                </div>

                {/* PDF Download Section - Placeholder */}
                <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                        Monthly Statistics
                    </h3>
                    <p className="text-gray-400 mb-4">
                        You will be able to select a month and download a PDF of your transaction statistics here. This feature will be implemented in the future.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <input
                            type="month"
                            value="2023-11"
                            disabled // Disable the input for now
                            className="bg-gray-700 text-gray-100 p-2 rounded-lg border border-gray-600 focus:outline-none"
                        />
                        <button
                            onClick={() => alert("PDF download is coming soon!")}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            Download PDF
                        </button>
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
