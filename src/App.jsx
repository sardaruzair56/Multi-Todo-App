import React from "react";
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Add from "./component/Add.jsx";
import Login from "./component/logIn.jsx";
import SignUp from "./component/signUp.jsx";

const App = () => {
  // Get the user from Redux state
  const user = useSelector((state) => state.lists.user);

  // PrivateRoute component to check if user is logged in
  const PrivateRoute = ({ element }) => {
    return user ? element : <Navigate to="/logIn" />; // If user is logged in, show element, else redirect to login
  };

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/logIn" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/add" element={<PrivateRoute element={<Add />} />} />
          <Route path="*" element={<Navigate to="/logIn" />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
