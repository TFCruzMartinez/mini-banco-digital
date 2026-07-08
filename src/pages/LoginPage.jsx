// src/pages/LoginPage.jsx
import { useState } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import logo from "../assets/logo.png";

export function LoginPage() {
  const [modo, setModo] = useState("login"); // "login" | "registro"

  function handleCambiarARegistro() {
    setModo("registro");
  }

  function handleCambiarALogin() {
    setModo("login");
  }

  return (
    <div>
      <img src={logo} alt="XBank" style={{ display: "block", margin: "0 auto 24px", maxWidth: "220px", width: "100%" }} />
      {modo === "login" ? (
        <LoginForm onCambiarARegistro={handleCambiarARegistro} />
      ) : (
        <RegisterForm onCambiarALogin={handleCambiarALogin} />
      )}
    </div>
  );
}
