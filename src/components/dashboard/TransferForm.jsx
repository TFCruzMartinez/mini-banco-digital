// src/components/dashboard/TransferForm.jsx
import { useState } from "react";
import {
  buscarUsuarioPorEmail,
  transferirDinero,
} from "../../services/bankService";
import { useAuth } from "../../context/AuthContext";
import { validarTransferencia } from "../../utils/validaciones";

export function TransferForm({ nombreEmisor, saldoDisponible }) {
  const { user } = useAuth();

  const [emailDestino, setEmailDestino] = useState("");
  const [monto, setMonto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [exitoMensaje, setExitoMensaje] = useState("");

  function handleEmailDestinoChange(event) {
    setEmailDestino(event.target.value);
  }

  function handleMontoChange(event) {
    setMonto(event.target.value);
  }

  async function handleTransferSubmit(event) {
    event.preventDefault();

    setErrorMensaje("");
    setExitoMensaje("");

    const validacion = validarTransferencia({
      emailDestino,
      emailEmisor: user.email,
      monto,
      saldoDisponible,
    });

    if (!validacion.esValida) {
      setErrorMensaje(validacion.mensaje);
      return;
    }

    if (enviando) {
      return;
    }

    const {
      emailDestino: emailLimpio,
      montoNumerico,
    } = validacion;

    setEnviando(true);

    try {
      const destinatario = await buscarUsuarioPorEmail(emailLimpio);

      if (!destinatario) {
        setErrorMensaje("No existe un usuario registrado con ese email");
        return;
      }

      await transferirDinero({
        emisorUid: user.uid,
        receptorUid: destinatario.uid,
        monto: montoNumerico,
        emisorNombre: nombreEmisor,
        receptorNombre: destinatario.nombre,
      });

      setExitoMensaje(
        `Transferiste $${montoNumerico.toLocaleString("es-CL")} a ${destinatario.nombre}`,
      );

      setEmailDestino("");
      setMonto("");
    } catch (error) {
      setErrorMensaje(
        error.message || "No se pudo completar la transferencia",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleTransferSubmit}>
      <h3>Transferir dinero</h3>

      <label htmlFor="transfer-email">Email del destinatario</label>
      <input
        id="transfer-email"
        type="email"
        value={emailDestino}
        onChange={handleEmailDestinoChange}
        disabled={enviando}
      />

      <label htmlFor="transfer-monto">Monto</label>
      <input
        id="transfer-monto"
        type="number"
        value={monto}
        onChange={handleMontoChange}
        disabled={enviando}
        min="1"
      />

      {errorMensaje && <p role="alert">{errorMensaje}</p>}
      {exitoMensaje && <p>{exitoMensaje}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Procesando..." : "Transferir"}
      </button>
    </form>
  );
}
