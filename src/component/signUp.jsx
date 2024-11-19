import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app, auth } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import image from "../assets/logo.png";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore(app);

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { error, loading } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!email.endsWith("@gmail.com")) {
      toast.error("Invalid Email");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        email: user.email,
      });

      toast.success("Account created successfully!");
      navigate("/logIn");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already exists. Please try a different one.");
      } else {
        toast.error("Failed to create account. Please check your inputs!");
      }
    }
  };
  const redirectToLogout = () => {
    navigate("/logIn");
  };

  return (
    <div className="w-full h-screen bg-cover bg-center bg-white">
      <ToastContainer />
      <div className="flex justify-center items-center w-full h-full px-4">
        <div className="flex flex-col items-center w-full max-w-sm md:max-w-md lg:max-w-lg bg-purple-50 bg-opacity-100 shadow-md border-2 shadow-purple-500 p-4 md:p-6 rounded-lg">
          <button
            className="self-start text-purple-900 text-xl hover:text-purple-800 mb-4"
            onClick={redirectToLogout}
          >
            <FaArrowAltCircleLeft />
          </button>
          <div
            className="bg-cover bg-center mb-4 w-[4rem] h-[4rem] md:w-[5rem] md:h-[5rem] rounded-2xl"
            style={{ backgroundImage: `url(${image})` }}
          />
          <p className="w-full text-center font-extrabold text-lg md:text-xl lg:text-2xl mb-2 text-red-900">
            WELCOME!
          </p>
          <p className="w-full text-center font-extrabold text-sm md:text-lg lg:text-xl mb-4 text-purple-950">
            Create Your Account
          </p>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your First Name"
            className="w-full mb-4 p-2 rounded-md bg-gray-200 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your Last Name"
            className="w-full mb-4 p-2 rounded-md bg-gray-200 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            className="w-full mb-4 p-2 rounded-md bg-gray-200 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
            className="w-full mb-4 p-2 rounded-md bg-gray-200 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition duration-300"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your Password"
            className="w-full mb-4 p-2 rounded-md bg-gray-200 text-purple-950 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-300 transition duration-300"
          />
          <button
            onClick={handleSignUp}
            disabled={loading}
            className={`w-full p-2 rounded-md text-white font-bold 
          ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-purple-800 hover:bg-purple-900"
          } 
          transition duration-300`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
