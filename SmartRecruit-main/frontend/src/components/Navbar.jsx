import { Link } from "react-router-dom";
import Button from "./Button";
import React, { useEffect, useState } from "react";

const Navbar = () => {
  const [isEmail, setisEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setisEmail(email);
    }
  }, [isEmail]);

  return (
    <nav className="w-full bg-gradient-to-r from-yellow-50 via-orange-50 to-rose-50 border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-10 py-2 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Jobs button */}
          <Link to={"/"}>
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-amber-600">
                  SmartHire-X
                </span>
              </div>
            </div>
          </Link>

          {/* Right side buttons */}
          {isEmail ? (
            <div className="flex items-center space-x-4">
              <Link to={"/jobs"}>
                <Button
                  type="button"
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white"
                >
                  Jobs
                </Button>
              </Link>
              <Link to={"/dashboard"}>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white"
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to={"/login"}>
                <button className="font-medium">Login</button>
              </Link>
              <Link to={"/signup"}>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;