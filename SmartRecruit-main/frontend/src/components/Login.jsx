import { useState } from "react";
import { User, Lock } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Button from "./Button";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { email, password };
    try {
      const response = await axios.post(`${BACKEND_URL}/login`, formData);
      if (response.status === 200) {
        console.log("Successfull login : ", response);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("userId", response.data.user._id);
        localStorage.setItem("name", response.data.user.name);
        console.log(
          "Successfull data : ",
          response.data.user.email + response.data.user.name
        );
        setEmail("");
        setPassword("");
        navigate("/recruiter");
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Error: Unable to log in!");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-rose-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,200,100,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,150,150,0.25),transparent_35%)]" />

      <div className="w-full max-w-md mx-4 overflow-hidden rounded-lg shadow-2xl bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-8 py-6 text-center">
          <h1 className="text-2xl font-bold mb-2">SmartHire-X</h1>
          <p className="text-white/90 text-sm">
            Welcome to the automated interview system
          </p>
        </div>

        {/* Login Form Container */}
        <div className="p-8 -mt-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white"
              >
                Sign In
              </Button>
            </form>

            {/* Footer Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New to SmartHire-X?
                <Link to="/signup">
                  <button className="ml-1 text-blue-600 hover:text-blue-800 font-medium focus:outline-none">
                    Sign Up
                  </button>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
