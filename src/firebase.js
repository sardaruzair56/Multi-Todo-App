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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app); 
const db = getFirestore(app); 

export { auth, db, app };
