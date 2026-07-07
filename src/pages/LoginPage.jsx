// src/pages/LoginPage.jsx
import { useState } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";

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
      <h1>XBank</h1>
      {modo === "login" ? (
        <LoginForm onCambiarARegistro={handleCambiarARegistro} />
      ) : (
        <RegisterForm onCambiarALogin={handleCambiarALogin} />
      )}
    </div>
  );
}
