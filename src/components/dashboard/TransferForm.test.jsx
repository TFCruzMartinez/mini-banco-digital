import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransferForm } from "./TransferForm";
import {
  buscarUsuarioPorEmail,
  transferirDinero,
} from "../../services/bankService";

vi.mock("../../services/bankService", () => ({
  buscarUsuarioPorEmail: vi.fn(),
  transferirDinero: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      uid: "usuario-emisor-123",
      email: "emisor@email.com",
    },
  }),
}));

describe("TransferForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza los campos y el botón de transferencia", () => {
    // Arrange
    render(
      <TransferForm
        nombreEmisor="Tamara"
        saldoDisponible={50000}
      />,
    );

    // Act
    const campoEmail = screen.getByLabelText(
      "Email del destinatario",
    );
    const campoMonto = screen.getByLabelText("Monto");
    const boton = screen.getByRole("button", {
      name: "Transferir",
    });

    // Assert
    expect(campoEmail).toBeInTheDocument();
    expect(campoMonto).toBeInTheDocument();
    expect(boton).toBeInTheDocument();
  });

  it("muestra un error y no llama al servicio con un monto inválido", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TransferForm
        nombreEmisor="Tamara"
        saldoDisponible={50000}
      />,
    );

    // Act
    await user.type(
      screen.getByLabelText("Email del destinatario"),
      "destinatario@email.com",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Transferir",
      }),
    );

    // Assert
    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("El monto debe ser mayor a 0");

    expect(buscarUsuarioPorEmail).not.toHaveBeenCalled();
    expect(transferirDinero).not.toHaveBeenCalled();
  });

  it("llama al servicio una vez y con los argumentos correctos", async () => {
    // Arrange
    const user = userEvent.setup();

    buscarUsuarioPorEmail.mockResolvedValue({
      uid: "usuario-receptor-456",
      nombre: "Camila",
      email: "destinatario@email.com",
    });

    transferirDinero.mockResolvedValue(undefined);

    render(
      <TransferForm
        nombreEmisor="Tamara"
        saldoDisponible={50000}
      />,
    );

    // Act
    await user.type(
      screen.getByLabelText("Email del destinatario"),
      "destinatario@email.com",
    );

    await user.type(
      screen.getByLabelText("Monto"),
      "10000",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Transferir",
      }),
    );

    // Assert
    await waitFor(() => {
      expect(transferirDinero).toHaveBeenCalledTimes(1);
    });

    expect(buscarUsuarioPorEmail).toHaveBeenCalledWith(
      "destinatario@email.com",
    );

    expect(transferirDinero).toHaveBeenCalledWith({
      emisorUid: "usuario-emisor-123",
      receptorUid: "usuario-receptor-456",
      monto: 10000,
      emisorNombre: "Tamara",
      receptorNombre: "Camila",
    });

    expect(
      await screen.findByText("Transferiste $10.000 a Camila"),
    ).toBeInTheDocument();
  });

  it("deshabilita el botón mientras la transferencia está en curso", async () => {
    // Arrange
    const user = userEvent.setup();
    let resolverTransferencia;

    buscarUsuarioPorEmail.mockResolvedValue({
      uid: "usuario-receptor-456",
      nombre: "Camila",
    });

    transferirDinero.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolverTransferencia = resolve;
        }),
    );

    render(
      <TransferForm
        nombreEmisor="Tamara"
        saldoDisponible={50000}
      />,
    );

    await user.type(
      screen.getByLabelText("Email del destinatario"),
      "destinatario@email.com",
    );

    await user.type(
      screen.getByLabelText("Monto"),
      "10000",
    );

    // Act
    await user.click(
      screen.getByRole("button", {
        name: "Transferir",
      }),
    );

    // Assert
    expect(
      await screen.findByRole("button", {
        name: "Procesando...",
      }),
    ).toBeDisabled();

    resolverTransferencia();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Transferir",
        }),
      ).not.toBeDisabled();
    });
  });

  it("muestra un mensaje cuando el servicio rechaza la transferencia", async () => {
    // Arrange
    const user = userEvent.setup();

    buscarUsuarioPorEmail.mockResolvedValue({
      uid: "usuario-receptor-456",
      nombre: "Camila",
    });

    transferirDinero.mockRejectedValue(
      new Error("Error al realizar la transferencia"),
    );

    render(
      <TransferForm
        nombreEmisor="Tamara"
        saldoDisponible={50000}
      />,
    );

    // Act
    await user.type(
      screen.getByLabelText("Email del destinatario"),
      "destinatario@email.com",
    );

    await user.type(
      screen.getByLabelText("Monto"),
      "10000",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Transferir",
      }),
    );

    // Assert
    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Error al realizar la transferencia");

    expect(transferirDinero).toHaveBeenCalledTimes(1);
  });
});
