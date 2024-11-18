import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../Redux/taskSlices";
import { setUser } from "../Redux/taskSlices";
import image from "../assets/auth bg.jpeg";
import { FaArrowRightLong } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, error, loading } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (user) {
      navigate("/add");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        toast.error("Please Enter Email and Password.");
        return;
      }

      const result = await dispatch(loginUser({ email, password }));

      if (result.error) {
        toast.error("Invalid Email and Password");
        return;
      }

      const { uid } = result.payload;
      localStorage.setItem("uid", uid);
      dispatch(setUser({ uid }));

      toast.success("Login successful!");
      navigate("/add");
    } catch (err) {
      toast.error("Invalid Credentials");
    }
  };

  const handleSignup = () => {
    navigate("/signUp");
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-gradient-to-r from-gray-950 via-purple-900 to-gray-950"
      // style={{ backgroundImage: `url(${image})` }}
    >
      <ToastContainer />
      <div className="flex justify-center items-center w-full h-full bg-black bg-opacity-70 px-4">
        <div className="flex flex-col items-center bg-gradient-to-r from-gray-500 via-purple-300 to-gray-500 bg-opacity-80 w-full max-w-md md:max-w-lg lg:max-w-xl p-6 rounded-lg shadow-lg">
          <p className="w-full text-center font-extrabold text-xl md:text-2xl lg:text-3xl mb-4 text-red-900">
            WELCOME!
          </p>
          <p className="w-full text-center font-extrabold text-lg md:text-xl lg:text-2xl mb-8 text-purple-950">
            Login
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full max-w-sm mb-4 p-3 rounded-md bg-gray-200 font-semibold text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition duration-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full max-w-sm mb-4 p-3 rounded-md bg-gray-200 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-500 transition duration-300"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full max-w-sm p-3 rounded-md text-white font-bold 
          ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-gradient-to-r from-gray-900 via-purple-500 to-gray-900 hover:bg-gradient-to-r hover:from-gray-700 hover:via-purple-400 hover:to-gray-700"
          } 
          transition duration-300`}
          >
            {loading ? "Logging in..." : "LogIn"}
          </button>
          <button
            onClick={handleSignup}
            className="flex items-center gap-2 ml-56 w-full max-w-sm mt-4 p-3 rounded-md text-purple-950 font-bold justify-center hover:text-purple-900 transition"
          >
            Create Account
            <FaArrowRightLong />
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
