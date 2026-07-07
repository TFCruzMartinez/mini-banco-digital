// src/App.jsx
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return <DashboardPage />;
}

export default App;
