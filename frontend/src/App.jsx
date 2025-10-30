import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Profile from "./components/profile/Profile";
import UpdateProfile from "./components/updateProfile/UpdateProfile";
import PageHome from "./components/home/PageHome";
import PageBid from "./components/bids/PageBid";
import CreateArticle from "./components/addArticle/AddArticle";
import Settings from "./components/settings/Settings";
import UpdateArticle from "./components/updateArticle/UpdateArticle";
import Offres from "./components/offre/Offre";

function App() {
  return (
    <Router>
      <Navbar />

      <div className="mt-24 text-center">
        <Routes>
          <Route path="/" element={<PageHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<UpdateProfile />} />
          <Route path="/createArticle" element={<CreateArticle />} />
          <Route path="/bid/:id" element={<PageBid />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/articles/:id/edit" element={<UpdateArticle />} />
          <Route path="/offres" element={<Offres />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
