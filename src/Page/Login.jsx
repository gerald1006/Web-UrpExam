import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const navigate = useNavigate();

  

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Iniciar sesión con Supabase
      const { data: session, error } = await supabase.auth.signInWithPassword({
        email,
        password: clave,
      });

      if (error) {
        console.error("Error al iniciar sesión:", error.message);
        alert("Error al iniciar sesión.");
        return;
      }

      console.log("Sesión iniciada:", session);

      // Obtener el rol del usuario desde la tabla `profiles`
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
        

      if (profileError) {
        console.error("Error al obtener el perfil:", profileError.message);
        alert("Error al obtener el perfil del usuario.");
        return;
      }

      console.log("Perfil del usuario:", profile);

      // Redirigir según el rol
      if (profile.role === "admin") {
        navigate("/admin");
      } else if (profile.role === "alumno") {
        navigate("/alumno");
      } else {
        alert("Rol no reconocido.");
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