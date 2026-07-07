// src/components/dashboard/TransactionHistory.jsx
import { useState } from "react";
import { useMovimientos } from "../../hooks/useMovimientos";

export function TransactionHistory({ uid }) {
  const { movimientos, cargando, error } = useMovimientos(uid);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  function handleFiltroChange(event) {
    setFiltroTipo(event.target.value);
  }

  if (cargando) {
    return <p>Cargando movimientos...</p>;
  }

  if (error) {
    return <p role="alert">Error al cargar el historial: {error}</p>;
  }

  // Filtrado derivado del estado: no se guarda en su propio useState,
  // se recalcula en cada render a partir de "movimientos" y "filtroTipo"
  const movimientosFiltrados =
    filtroTipo === "todos"
      ? movimientos
      : movimientos.filter((mov) => mov.tipo === filtroTipo);

  return (
    <div>
      <h3>Historial de movimientos</h3>

      <label htmlFor="filtro-tipo">Filtrar por</label>
      <select id="filtro-tipo" value={filtroTipo} onChange={handleFiltroChange}>
        <option value="todos">Todos</option>
        <option value="envio">Enviados</option>
        <option value="recepcion">Recibidos</option>
      </select>

      {movimientos.length === 0 && <p>Aún no tienes movimientos</p>}

      {movimientos.length > 0 && movimientosFiltrados.length === 0 && (
        <p>No hay movimientos que coincidan con el filtro</p>
      )}

      {movimientosFiltrados.length > 0 && (
        <ul>
          {movimientosFiltrados.map((mov) => (
            <li key={mov.id}>
              <span>{mov.fecha.toDate().toLocaleString("es-CL")}</span>
              {" — "}
              <span>{mov.tipo === "envio" ? "Enviado a" : "Recibido de"} {mov.contraparte}</span>
              {" — "}
              <strong>
                {mov.tipo === "envio" ? "-" : "+"}
                {mov.monto.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
