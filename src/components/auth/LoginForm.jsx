// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { iniciarSesion } from "../../services/authService";

export function LoginForm({ onCambiarARegistro }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setErrorMensaje("");

    // Validación previa: nunca tocamos Firestore/Auth sin datos válidos
    if (!email.trim() || !password.trim()) {
      setErrorMensaje("Debes ingresar email y contraseña");
      return;
    }

    // Prevención de doble submit
    if (enviando) return;

    setEnviando(true);
    try {
      await iniciarSesion(email, password);
      // No hace falta redirigir manualmente: el AuthContext detecta
      // el cambio de sesión automáticamente vía onAuthStateChanged
    } catch (error) {
      setErrorMensaje("Email o contraseña incorrectos");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleLoginSubmit}>
      <h2>Iniciar sesión</h2>

      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        disabled={enviando}
      />

      <label htmlFor="login-password">Contraseña</label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        disabled={enviando}
      />

      {errorMensaje && <p role="alert">{errorMensaje}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Ingresando..." : "Ingresar"}
      </button>

      <p>
        ¿No tienes cuenta?{" "}
        <button type="button" onClick={onCambiarARegistro}>
          Regístrate
        </button>
      </p>
    </form>
  );
}
