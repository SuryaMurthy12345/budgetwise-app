import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Layout from "../components/Layout";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();


  const url = "https://murthyapi.xyz";


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear field-specific error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      const response = await axios.post(`${url}/api/auth/signup`, form, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Signup successful:", response.data);

      // Redirect to login page
      navigate("/auth/login");
    } catch (err) {
      console.error("Signup error:", err);

      if (err.response && err.response.data) {
        const data = err.response.data;

        // Handle field-specific validation errors
        if ((err.response.status === 400 || err.response.status === 409) && typeof data === "object") {
          if (data.Error) {
            setErrors({ general: data.Error }); // Normalize backend "Error" to "general"
          } else {
            setErrors(data); // Field-specific errors (e.g., name, email, password)
          }
        } else if (typeof data === "string") {
          setErrors({ general: data });
        } else {
          setErrors({ general: "Something went wrong. Please try again." });
        }
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
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

      {/* General error */}
      {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Name Field */}
        <InputField
          label="Enter your Name"
          placeholder="John Doe"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

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

        <Button text={loading ? "Registering..." : "Register"} />
      </form>

      <p className="text-sm mt-6 text-center">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-orange-600 font-medium">
          Login
        </Link>
      </p>
    </Layout>
  );
};

export default Register;
