// src/components/dashboard/BalanceCard.jsx
export function BalanceCard({ datosUsuario }) {
  const saldoFormateado = datosUsuario.saldo.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  return (
    <div>
      <p>Hola, {datosUsuario.nombre}</p>
      <h2>{saldoFormateado}</h2>
    </div>
  );
}

