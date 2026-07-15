import { describe, expect, it } from "vitest";
import { validarTransferencia } from "./validaciones";

describe("validarTransferencia", () => {
  const datosBase = {
    emailDestino: "destinatario@email.com",
    emailEmisor: "emisor@email.com",
    monto: "10000",
    saldoDisponible: 50000,
  };

  it.each([
    ["monto negativo", "-1000", "El monto debe ser mayor a 0"],
    ["monto igual a cero", "0", "El monto debe ser mayor a 0"],
    ["monto no numérico", "abc", "El monto debe ser un número válido"],
    ["monto decimal", "1000.5", "El monto debe ser un número entero"],
  ])("rechaza %s", (_caso, monto, mensajeEsperado) => {
    // Arrange
    const datos = {
      ...datosBase,
      monto,
    };

    // Act
    const resultado = validarTransferencia(datos);

    // Assert
    expect(resultado.esValida).toBe(false);
    expect(resultado.mensaje).toBe(mensajeEsperado);
  });

  it("rechaza un monto mayor al saldo disponible", () => {
    // Arrange
    const datos = {
      ...datosBase,
      monto: "60000",
      saldoDisponible: 50000,
    };

    // Act
    const resultado = validarTransferencia(datos);

    // Assert
    expect(resultado.esValida).toBe(false);
    expect(resultado.mensaje).toBe("Saldo insuficiente");
  });

  it("rechaza una transferencia al mismo usuario", () => {
    // Arrange
    const datos = {
      ...datosBase,
      emailDestino: "EMISOR@email.com",
      emailEmisor: "emisor@email.com",
    };

    // Act
    const resultado = validarTransferencia(datos);

    // Assert
    expect(resultado.esValida).toBe(false);
    expect(resultado.mensaje).toBe(
      "No puedes transferirte dinero a ti mismo",
    );
  });

  it("rechaza un destinatario vacío", () => {
    // Arrange
    const datos = {
      ...datosBase,
      emailDestino: "   ",
    };

    // Act
    const resultado = validarTransferencia(datos);

    // Assert
    expect(resultado.esValida).toBe(false);
    expect(resultado.mensaje).toBe(
      "Debes ingresar el email del destinatario",
    );
  });

  it("rechaza un email con formato inválido", () => {
    // Arrange
    const datos = {
      ...datosBase,
      emailDestino: "correo-invalido",
    };

    // Act
    const resultado = validarTransferencia(datos);

    // Assert
    expect(resultado.esValida).toBe(false);
    expect(resultado.mensaje).toBe("Debes ingresar un email válido");
  });

  it("acepta una transferencia válida con saldo suficiente", () => {
    // Arrange
    const datos = {
      ...datosBase,
      emailDestino: "  destinatario@email.com  ",
      monto: "10000",
    };

    // Act
    const resultado = validarTransferencia(datos);

    // Assert
    expect(resultado.esValida).toBe(true);
    expect(resultado.mensaje).toBe("");
    expect(resultado.emailDestino).toBe("destinatario@email.com");
    expect(resultado.montoNumerico).toBe(10000);
  });
});
