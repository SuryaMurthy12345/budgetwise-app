import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Layout from "../components/Layout";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const url = "https://budgetwise-app-4h23.onrender.com";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear specific field error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Reset previous errors

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

      // ✅ Check profile and redirect accordingly
      const profileResponse = await axios.get(`${url}/api/profile/check-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.data.Profile === true) {
        navigate("/screen/profile");
      } else {
        navigate("/profileform");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response && err.response.status === 400 && typeof err.response.data === "object") {
        // Field-level validation errors
        setErrors(err.response.data);
      } else if (err.response && typeof err.response.data === "string") {
        // General error message from backend
        setErrors({ general: err.response.data });
      } else {
        setErrors({ general: "Invalid credentials. Please try again." });
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

      {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email Field */}
        <InputField
          label="Enter your Email"
          placeholder="hello@reallygreatsite.com"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        {/* Password Field */}
        <InputField
          label="Enter Password"
          type="password"
          placeholder="********"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

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
