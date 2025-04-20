import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Page/Login";
import Admin from "./Page/Admin";
import Alumno from "./Page/Alumno";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/alumno" element={<Alumno />} />
      </Routes>
    </Router>
  );
}

export default App;