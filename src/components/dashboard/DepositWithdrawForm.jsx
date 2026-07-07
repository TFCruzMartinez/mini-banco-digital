// src/components/dashboard/DepositWithdrawForm.jsx
import { useState } from "react";
import { depositarDinero, retirarDinero } from "../../services/bankService";
import { useAuth } from "../../context/AuthContext";

export function DepositWithdrawForm({ saldoDisponible }) {
  const { user } = useAuth();
  const [monto, setMonto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [exitoMensaje, setExitoMensaje] = useState("");

  function handleMontoChange(event) {
    setMonto(event.target.value);
  }

  async function ejecutarOperacion(tipoOperacion) {
    setErrorMensaje("");
    setExitoMensaje("");

    const montoNumerico = Number(monto);

    if (!monto || montoNumerico <= 0) {
      setErrorMensaje("El monto debe ser mayor a 0");
      return;
    }
    if (tipoOperacion === "retiro" && montoNumerico > saldoDisponible) {
      setErrorMensaje("Saldo insuficiente");
      return;
    }

    if (enviando) return;
    setEnviando(true);

    try {
      if (tipoOperacion === "deposito") {
        await depositarDinero(user.uid, montoNumerico);
        setExitoMensaje(`Depositaste $${montoNumerico.toLocaleString("es-CL")}`);
      } else {
        await retirarDinero(user.uid, montoNumerico);
        setExitoMensaje(`Retiraste $${montoNumerico.toLocaleString("es-CL")}`);
      }
      setMonto("");
    } catch (error) {
      setErrorMensaje(error.message || "No se pudo completar la operación");
    } finally {
      setEnviando(false);
    }
  }

  function handleDepositClick() {
    ejecutarOperacion("deposito");
  }

  function handleWithdrawClick() {
    ejecutarOperacion("retiro");
  }

  return (
    <div>
      <h3>Depósito / Retiro</h3>

      <label htmlFor="deposit-withdraw-monto">Monto</label>
      <input
        id="deposit-withdraw-monto"
        type="number"
        value={monto}
        onChange={handleMontoChange}
        disabled={enviando}
        min="1"
      />

      {errorMensaje && <p role="alert">{errorMensaje}</p>}
      {exitoMensaje && <p>{exitoMensaje}</p>}

      <button type="button" onClick={handleDepositClick} disabled={enviando}>
        {enviando ? "Procesando..." : "Depositar"}
      </button>
      <button type="button" onClick={handleWithdrawClick} disabled={enviando}>
        {enviando ? "Procesando..." : "Retirar"}
      </button>
    </div>
  );
}
