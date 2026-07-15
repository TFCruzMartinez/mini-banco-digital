import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm.jsx";
import { iniciarSesion } from "../../services/authService";

vi.mock("../../services/authService", () => ({
  iniciarSesion: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no llama al servicio cuando los campos están vacíos", async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <LoginForm onCambiarARegistro={vi.fn()} />,
    );

    // Act
    await user.click(
      screen.getByRole("button", {
        name: "Ingresar",
      }),
    );

    // Assert
    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Debes ingresar email y contraseña",
    );

    expect(iniciarSesion).not.toHaveBeenCalled();
  });

  it("muestra un mensaje cuando las credenciales son inválidas", async () => {
    // Arrange
    const user = userEvent.setup();

    iniciarSesion.mockRejectedValue(
      new Error("Credenciales inválidas"),
    );

    render(
      <LoginForm onCambiarARegistro={vi.fn()} />,
    );

    // Act
    await user.type(
      screen.getByLabelText("Email"),
      "usuario@email.com",
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "claveincorrecta",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ingresar",
      }),
    );

    // Assert
    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Email o contraseña incorrectos",
    );

    expect(iniciarSesion).toHaveBeenCalledTimes(1);

    expect(iniciarSesion).toHaveBeenCalledWith(
      "usuario@email.com",
      "claveincorrecta",
    );
  });

  it("llama al servicio con los datos correctos cuando el formulario es válido", async () => {
    // Arrange
    const user = userEvent.setup();

    iniciarSesion.mockResolvedValue({
      uid: "usuario-123",
      email: "usuario@email.com",
    });

    render(
      <LoginForm onCambiarARegistro={vi.fn()} />,
    );

    // Act
    await user.type(
      screen.getByLabelText("Email"),
      "usuario@email.com",
    );

    await user.type(
      screen.getByLabelText("Contraseña"),
      "clave-segura",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Ingresar",
      }),
    );

    // Assert
    expect(iniciarSesion).toHaveBeenCalledTimes(1);

    expect(iniciarSesion).toHaveBeenCalledWith(
      "usuario@email.com",
      "clave-segura",
    );
  });
});
