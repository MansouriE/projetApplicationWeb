import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Profile from "./components/profile/Profile";
import UpdateProfile from "./components/updateProfile/UpdateProfile";

function App() {
  return (
    <Router>
      <Navbar />
      
      <div className="mt-24 text-center">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1 className="text-4xl font-bold text-blue-600 mb-4">
                  Bienvenue sur la page d'accueil
                </h1>
                <p className="text-lg text-gray-700">
                  Ceci est une app React avec une barre de navigation en haut.
                </p>
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<UpdateProfile />} />
        </Routes>
      </div>
      
    </Router>
  );
}

export default App;