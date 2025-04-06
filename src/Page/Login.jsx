import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
// import { auth } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        clave
      );
      const user = userCredential.user;

      // Consultar el rol desde Firestore
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.rol === "admin") {
          navigate("/admin");
        } else if (data.rol === "alumno") {
          navigate("/alumno");
        } else {
          alert("Rol no reconocido.");
        }
      } else {
        alert("No se encontró el documento del usuario.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Error al iniciar sesión.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleLogin}>
        <h2>Intranet - U R P</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Clave"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
        <button type="submit">Ingresar</button>
        <div>
          <a href="#">Recuperar Clave 1</a>
          <br />
          <a href="#">Recuperar Clave 2</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
