import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBacNTcfHHxP1_mgAjnjbxovwYQFK8S2ZM",
  authDomain: "multi-todo-app-e115d.firebaseapp.com",
  projectId: "multi-todo-app-e115d",
  storageBucket: "multi-todo-app-e115d.firebasestorage.app",
  messagingSenderId: "914539971881",
  appId: "1:914539971881:web:1388f89810333d8a272338",
  measurementId: "G-SJEQP6HDZC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Authentication
const db = getFirestore(app); // Firestore Database

// Export the initialized services for use in other parts of the app
export { auth, db, app };
