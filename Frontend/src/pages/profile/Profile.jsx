import axios from "axios";
import { Mail } from "lucide-react"; // Import Mail icon
import { useEffect, useState } from "react";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const [reportMonth, setReportMonth] = useState(currentMonth);
    const [isDownloading, setIsDownloading] = useState(false);

    const url = "http://localhost:8080";

    // --- NEW HELPER FUNCTION: Avatar Logic ---
    const getInitials = (name) => {
        if (!name) return "U";
        // Takes the first letter of the first and last name
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    const getHashColor = (name) => {
        // Simple hash function to generate a deterministic color from the name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            // Use mid-range values for better visibility on dark background
            color += ('00' + (100 + (value % 156)).toString(16)).substr(-2);
        }
        return color;
    };
    // ------------------------------------------

   // In suryamurthy12345/budgetwise-app/budgetwise-app-4fea87922b2c2e43aff6943676c323d8e4a86c1c/Frontend/src/pages/profile/Profile.jsx

// ... (inside the Profile component)

useEffect(() => {
    const fetchUserData = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You are not logged in.");
                setLoading(false);
                return;
            }

            // Replace mock data with a real API call to the new endpoint
            const response = await axios.get(`${url}/api/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data); // Set the user state with data from the API

        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to load user data.");
        } finally {
            setLoading(false);
        }
    };

    fetchUserData();
}, []); // The empty dependency array ensures this runs only once

// ... (the rest of the component remains the same) []);

    const handleDownloadPdf = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in.");
            return;
        }

        setIsDownloading(true);
        try {
            const [year, month] = reportMonth.split("-").map(Number);

            const response = await axios.get(
                `${url}/api/transaction/report/pdf?year=${year}&month=${month}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob', // Important for handling binary data (PDF)
                }
            );

            // Create a blob URL and link to trigger download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `BudgetWise_Report_${reportMonth}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            alert("PDF download successful!");
        } catch (err) {
            console.error("PDF Download Error:", err);
            alert("Failed to download PDF report. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <p className="text-center mt-10 text-lg">Loading profile...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

    const userName = user?.name || "BudgetWise User";
    const userEmail = user?.email || "user@example.com";
    const initials = getInitials(userName);
    const avatarColor = getHashColor(userName);


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-gray-100">
            <div className="max-w-3xl mx-auto bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-700">

                {/* --- NEW PROFILE SECTION (Avatar & Details) --- */}
                <div className="flex flex-col items-center pb-8 border-b border-gray-700">

                    {/* Avatar */}
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl ring-4 ring-gray-600"
                        style={{ backgroundColor: avatarColor, color: '#FFFFFF' }}
                    >
                        {initials}
                    </div>

                    {/* User Details */}
                    <h2 className="text-3xl font-bold mb-2">{userName}</h2>
                    <div className="flex items-center text-gray-400 space-x-2">
                        <Mail size={16} />
                        <p className="text-lg">{userEmail}</p>
                    </div>
                </div>
                {/* --- END NEW PROFILE SECTION --- */}

                {/* PDF Download Section */}
                <div className="mt-8 pt-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                        Monthly Financial Report (PDF)
                    </h3>
                    <p className="text-gray-400 mb-4">
                        Select a month and download a comprehensive PDF report of your financial statistics and budget allocation.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <input
                            type="month"
                            value={reportMonth}
                            onChange={(e) => setReportMonth(e.target.value)}
                            max={currentMonth}
                            className="bg-gray-700 text-gray-100 p-2 rounded-lg border border-gray-600 focus:outline-none"
                        />
                        <button
                            onClick={handleDownloadPdf}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                            disabled={isDownloading}
                        >
                            {isDownloading ? "Generating..." : "Download PDF"}
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