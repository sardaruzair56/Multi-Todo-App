import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app, auth } from "../firebase";
import image from "../assets/auth bg.jpeg";
import { ToastContainer, toast } from "react-toastify";
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
      navigate("/add");
    } catch (error) {
      toast.error("Invalid Data Entered Failed to Create Account!");
    }
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <ToastContainer />
      <div className="flex justify-center items-center w-full h-full bg-black bg-opacity-70">
        <div className="flex flex-col items-center bg-gray-200 bg-opacity-70 w-[30%] h-[35rem] justify-center rounded-lg p-6 shadow-lg">
        <p className="w-[80%] flex items-center justify-center font-extrabold text-2xl mb-8 text-red-900">
            WELCOME!
          </p>
          <p className="w-[80%] flex items-center justify-center font-extrabold text-2xl mb-8 text-gray-900">
            Create Your Account
          </p>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your First Name"
            className="w-[80%] mb-4 p-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 transition duration-300"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your Last Name"
            className="w-[80%] mb-4 p-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 transition duration-300"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            className="w-[80%] mb-4 p-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 transition duration-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
            className="w-[80%] mb-4 p-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 transition duration-300"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your Password"
            className="w-[80%] mb-4 p-3 rounded-md bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 transition duration-300"
          />
          <button
            onClick={handleSignUp}
            disabled={loading}
            className={`w-[80%] p-3 rounded-md text-white font-bold 
            ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-gray-900 hover:bg-gray-800"
            } 
            transition duration-300`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
