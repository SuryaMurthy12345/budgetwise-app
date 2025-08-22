import React, { useEffect, useState } from "react";
import axios from "axios";

const Hello = () => {
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/user-details", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) {
    return <div className="text-center text-lg font-medium">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="text-center mt-10 text-xl font-semibold">
      <p>Hello, {user.name}</p>
      <p>Your email: {user.email}</p>
      <p>Your role: {user.role}</p>
      <p className="mt-4 text-green-600 italic">(This is just beginning)</p>
    </div>
  );
};

export default Hello;
