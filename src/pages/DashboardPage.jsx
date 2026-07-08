// src/pages/DashboardPage.jsx
import { useAuth } from "../context/AuthContext";
import { useSaldo } from "../hooks/useSaldo";
import { useTheme } from "../hooks/useTheme";
import { BalanceCard } from "../components/dashboard/BalanceCard";
import { TransferForm } from "../components/dashboard/TransferForm";
import { DepositWithdrawForm } from "../components/dashboard/DepositWithdrawForm";
import { TransactionHistory } from "../components/dashboard/TransactionHistory";
import { cerrarSesion } from "../services/authService";
import logo from "../assets/logo.png";

export function DashboardPage() {
  const { user } = useAuth();
  const { datosUsuario, cargando, error } = useSaldo(user.uid);
  const { tema, alternarTema } = useTheme();

  async function handleLogoutClick() {
    await cerrarSesion();
  }

  return (
    <div>
      <header>
        <img src={logo} alt="XBank" style={{ height: "36px" }} />
        <div>
          <button type="button" onClick={alternarTema}>
            {tema === "claro" ? "🌙 Oscuro" : "☀️ Claro"}
          </button>
          <button type="button" onClick={handleLogoutClick}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {cargando && <p>Cargando cuenta...</p>}
      {error && <p role="alert">Error: {error}</p>}

      {datosUsuario && (
        <>
          <BalanceCard datosUsuario={datosUsuario} />
          <DepositWithdrawForm saldoDisponible={datosUsuario.saldo} />
          <TransferForm
            nombreEmisor={datosUsuario.nombre}
            saldoDisponible={datosUsuario.saldo}
          />
          <TransactionHistory uid={user.uid} />
        </>
      )}
    </div>
  );
}
