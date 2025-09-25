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
      <div style={{ marginTop: "100px", textAlign: "center" }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>Bienvenue sur la page d’accueil</h1>
                <p>
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
