import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Layout from "../components/Layout";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const url = "https://murthyapi.xyz"

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${url}/api/auth/login`, form, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Login successful:", response.data);

      // ✅ Save token to localStorage
      localStorage.setItem("token", response.data);
      const token = response.data;
      // ✅ Redirect to /profile
      const profileResponse = await axios.get(`${url}/api/profile/check-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (profileResponse.data.Profile === true) {
        navigate("/screen/profile");
      }
      else {
        navigate("/profileform")
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-4xl font-extrabold text-center">Login</h1>
      <p className="text-sm mt-2 mb-6 text-gray-800 text-center">
        Welcome back! Please log in.
      </p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Enter your Email"
          placeholder="hello@reallygreatsite.com"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <InputField
          label="Enter Password"
          type="password"
          placeholder="********"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        <Button text={loading ? "Logging in..." : "Login"} />
      </form>

      <p className="text-sm mt-6 text-center">
        Don’t have an account?{" "}
        <Link to="/auth/register" className="text-orange-600 font-medium">
          Register
        </Link>
      </p>
    </Layout>
  );
};

export default Login;
