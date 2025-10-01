import axios from "axios"; // Import axios
import { useEffect, useState } from "react";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // 1. Add state for selected report month and downloading status
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const [reportMonth, setReportMonth] = useState(currentMonth); // Default to current month
    const [isDownloading, setIsDownloading] = useState(false); // New state for download button

    // The URL should be configured here.
    const url = "http://localhost:8080";

    useEffect(() => {
        // ... (rest of fetchUserData remains the same)
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("You are not logged in.");
                    setLoading(false);
                    return;
                }

                const mockUser = {
                    name: "John Doe",
                    email: "john.doe@example.com",
                };

                setTimeout(() => {
                    setUser(mockUser);
                    setLoading(false);
                }, 500);

            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user data.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // 2. Add PDF Download handler
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
    
    // ... (rest of the component structure remains the same until the PDF section)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-gray-100">
            <div className="max-w-3xl mx-auto bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-700">
                {/* Header and User Info sections remain unchanged */}
                
                {/* PDF Download Section - Implemented */}
                <div className="mt-8 pt-6 border-t border-gray-700 text-center">
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