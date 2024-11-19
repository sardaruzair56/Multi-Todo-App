import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../Redux/taskSlices";
import { setUser } from "../Redux/taskSlices";
import { FaArrowRightLong } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import image from "../assets/logo.png";
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
    <div className="w-full h-screen bg-cover bg-center bg-white">
      <ToastContainer />
      <div className="flex justify-center items-center w-full h-full px-4">
        <div className="flex flex-col items-center bg-purple-50 w-full max-w-sm md:max-w-md lg:max-w-lg p-6 rounded-lg shadow-md border-2 shadow-purple-500">
          <div
            className="w-[5rem] h-[5rem] rounded-2xl bg-cover bg-center mb-4 md:mb-6"
            style={{ backgroundImage: `url(${image})` }}
          />
          <p className="w-full text-center font-extrabold text-lg md:text-xl lg:text-2xl mb-2 md:mb-4 text-red-900">
            WELCOME!
          </p>
          <p className="w-full text-center font-extrabold text-sm md:text-lg lg:text-xl mb-6 text-purple-950">
            Login
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full mb-4 p-3 rounded-md border-purple-950 bg-gray-200 font-semibold text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full mb-4 p-3 rounded-md bg-gray-200 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full p-3 rounded-md text-white font-bold 
          ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-purple-800 hover:bg-purple-900"
          } 
          transition duration-300`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
          <button
            onClick={handleSignup}
            className="flex gap-2 w-full mt-2 p-3 rounded-md text-purple-800 font-bold items-end justify-end hover:text-purple-900 transition"
          >
            <span className="text-sm md:text-base lg:text-lg">
              Create Account
            </span>
            <p className="text-sm md:text-base lg:text-lg">
              <FaArrowRightLong />
            </p>
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
