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
      className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <ToastContainer />
      <div className="flex justify-center items-center w-full h-full bg-black bg-opacity-70">
        <div className="flex flex-col items-center bg-gray-200 bg-opacity-70 w-[30%] h-[28rem] justify-center rounded-lg p-6 shadow-lg">
          <p className="w-[85%] flex items-center justify-center font-extrabold text-2xl mb-4 text-red-900">
            WELCOME !
          </p>
          <p className="w-[80%] flex items-center justify-center font-extrabold text-2xl mb-8 text-gray-900">
            LogIN
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-[80%] mb-4 p-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 transition duration-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-[80%] mb-4 p-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 transition duration-300"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-[80%] p-3 rounded-md text-white font-bold 
            ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-gray-900 hover:bg-gray-800"
            } 
            transition duration-300`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
            onClick={handleSignup}
            className="flex flex-row gap-2 ml-[15rem] w-[80%] p-3 rounded-md text-gray-900 font-bold"
          >
            Create Account
            <FaArrowRightLong className="mt-1" />
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
