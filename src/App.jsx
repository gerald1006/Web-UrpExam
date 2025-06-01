import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Page/Login";
import Admin from "./Page/Admin";
import Alumno from "./Page/Alumno";
import ExamSafeAgregar from "./Page/examsafe";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/alumno" element={<Alumno />} />
         <Route path="/admin/agregar" element={<ExamSafeAgregar />} />
      </Routes>
    </Router>
  );
}

export default App;