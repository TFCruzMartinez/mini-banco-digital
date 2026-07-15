export function validarTransferencia({
  emailDestino,
  emailEmisor,
  monto,
  saldoDisponible,
}) {
  const emailLimpio = emailDestino.trim();
  const montoNumerico = Number(monto);
  const formatoEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailLimpio) {
    return {
      esValida: false,
      mensaje: "Debes ingresar el email del destinatario",
    };
  }

  if (!formatoEmailValido.test(emailLimpio)) {
    return {
      esValida: false,
      mensaje: "Debes ingresar un email válido",
    };
  }

  if (monto === "" || monto === null || monto === undefined) {
    return {
      esValida: false,
      mensaje: "El monto debe ser mayor a 0",
    };
  }

  if (!Number.isFinite(montoNumerico)) {
    return {
      esValida: false,
      mensaje: "El monto debe ser un número válido",
    };
  }

  if (montoNumerico <= 0) {
    return {
      esValida: false,
      mensaje: "El monto debe ser mayor a 0",
    };
  }

  if (!Number.isInteger(montoNumerico)) {
    return {
      esValida: false,
      mensaje: "El monto debe ser un número entero",
    };
  }

  if (
    emailEmisor &&
    emailLimpio.toLowerCase() === emailEmisor.trim().toLowerCase()
  ) {
    return {
      esValida: false,
      mensaje: "No puedes transferirte dinero a ti mismo",
    };
  }

  if (montoNumerico > saldoDisponible) {
    return {
      esValida: false,
      mensaje: "Saldo insuficiente",
    };
  }

  return {
    esValida: true,
    mensaje: "",
    emailDestino: emailLimpio,
    montoNumerico,
  };
}
