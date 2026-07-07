// src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { registrarUsuario } from "../../services/authService";

export function RegisterForm({ onCambiarALogin }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  function handleNombreChange(event) {
    setNombre(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleConfirmarPasswordChange(event) {
    setConfirmarPassword(event.target.value);
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setErrorMensaje("");

    // Validaciones previas, con mensajes específicos
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setErrorMensaje("Todos los campos son obligatorios");
      return;
    }
    if (password.length < 6) {
      setErrorMensaje("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmarPassword) {
      setErrorMensaje("Las contraseñas no coinciden");
      return;
    }

    if (enviando) return;

    setEnviando(true);
    try {
      await registrarUsuario(nombre, email, password);
      // El AuthContext detecta el login automático tras el registro
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMensaje("Ese email ya está registrado");
      } else {
        setErrorMensaje("No se pudo crear la cuenta, intenta de nuevo");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleRegisterSubmit}>
      <h2>Crear cuenta</h2>

      <label htmlFor="register-nombre">Nombre</label>
      <input
        id="register-nombre"
        type="text"
        value={nombre}
        onChange={handleNombreChange}
        disabled={enviando}
      />

      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        disabled={enviando}
      />

      <label htmlFor="register-password">Contraseña</label>
      <input
        id="register-password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        disabled={enviando}
      />

      <label htmlFor="register-confirmar">Confirmar contraseña</label>
      <input
        id="register-confirmar"
        type="password"
        value={confirmarPassword}
        onChange={handleConfirmarPasswordChange}
        disabled={enviando}
      />

      {errorMensaje && <p role="alert">{errorMensaje}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Creando cuenta..." : "Registrarme"}
      </button>

      <p>
        ¿Ya tienes cuenta?{" "}
        <button type="button" onClick={onCambiarALogin}>
          Inicia sesión
        </button>
      </p>
    </form>
  );
}
