import React, { useState } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/api/auth/signup", form, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Signup successful:", response.data);

      // ✅ Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-4xl font-extrabold text-center">Register</h1>
      <p className="text-sm mt-2 mb-6 text-gray-800 text-center">
        Create your account
      </p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Enter your Name"
          placeholder="John Doe"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
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
        <Button text={loading ? "Registering..." : "Register"} />
      </form>

      <p className="text-sm mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-orange-600 font-medium">
          Login
        </Link>
      </p>
    </Layout>
  );
};

export default Register;
