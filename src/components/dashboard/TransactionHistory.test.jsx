import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { TransactionHistory } from "./TransactionHistory.jsx";
import { useMovimientos } from "../../hooks/useMovimientos";

vi.mock("../../hooks/useMovimientos", () => ({
  useMovimientos: vi.fn(),
}));

describe("TransactionHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra un estado vacío cuando no hay movimientos", () => {
    // Arrange
    useMovimientos.mockReturnValue({
      movimientos: [],
      cargando: false,
      error: null,
    });

    // Act
    render(<TransactionHistory uid="usuario-123" />);

    // Assert
    expect(
      screen.getByText("Aún no tienes movimientos"),
    ).toBeInTheDocument();
  });

  it("renderiza los movimientos del más reciente al más antiguo", () => {
    // Arrange
    const fechaAntigua = new Date("2026-07-10T10:00:00");
    const fechaReciente = new Date("2026-07-15T10:00:00");

    useMovimientos.mockReturnValue({
      movimientos: [
        {
          id: "movimiento-antiguo",
          tipo: "envio",
          contraparte: "Ana",
          monto: 5000,
          fecha: {
            toDate: () => fechaAntigua,
          },
        },
        {
          id: "movimiento-reciente",
          tipo: "recepcion",
          contraparte: "Camila",
          monto: 10000,
          fecha: {
            toDate: () => fechaReciente,
          },
        },
      ],
      cargando: false,
      error: null,
    });

    // Act
    render(<TransactionHistory uid="usuario-123" />);

    const elementos = screen.getAllByRole("listitem");

    // Assert
    expect(elementos).toHaveLength(2);

    expect(
      within(elementos[0]).getByText(/Recibido de Camila/i),
    ).toBeInTheDocument();

    expect(
      within(elementos[1]).getByText(/Enviado a Ana/i),
    ).toBeInTheDocument();
  });

  it("distingue movimientos enviados y recibidos", () => {
    // Arrange
    const fecha = new Date("2026-07-15T12:00:00");

    useMovimientos.mockReturnValue({
      movimientos: [
        {
          id: "envio-1",
          tipo: "envio",
          contraparte: "Ana",
          monto: 7000,
          fecha: {
            toDate: () => fecha,
          },
        },
        {
          id: "recepcion-1",
          tipo: "recepcion",
          contraparte: "Camila",
          monto: 12000,
          fecha: {
            toDate: () => fecha,
          },
        },
      ],
      cargando: false,
      error: null,
    });

    // Act
    render(<TransactionHistory uid="usuario-123" />);

    // Assert
    expect(
      screen.getByText(/Enviado a Ana/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Recibido de Camila/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/-\$7\.000/)).toBeInTheDocument();
    expect(screen.getByText(/\+\$12\.000/)).toBeInTheDocument();
  });

  it("muestra el estado de carga", () => {
    // Arrange
    useMovimientos.mockReturnValue({
      movimientos: [],
      cargando: true,
      error: null,
    });

    // Act
    render(<TransactionHistory uid="usuario-123" />);

    // Assert
    expect(
      screen.getByText("Cargando movimientos..."),
    ).toBeInTheDocument();
  });

  it("muestra un mensaje cuando ocurre un error", () => {
    // Arrange
    useMovimientos.mockReturnValue({
      movimientos: [],
      cargando: false,
      error: "No fue posible cargar los datos",
    });

    // Act
    render(<TransactionHistory uid="usuario-123" />);

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Error al cargar el historial: No fue posible cargar los datos",
    );
  });
});
