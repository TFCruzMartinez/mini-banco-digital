// src/hooks/useTheme.js
import { useEffect, useState } from "react";

const CLAVE_STORAGE = "xbank-theme";

export function useTheme() {
  const [tema, setTema] = useState(() => {
    // Al iniciar, lee la preferencia guardada, o usa "claro" por defecto
    const guardado = localStorage.getItem(CLAVE_STORAGE);
    return guardado || "claro";
  });

  useEffect(() => {
    // Cada vez que cambia el tema, lo persistimos y lo aplicamos al <body>
    localStorage.setItem(CLAVE_STORAGE, tema);
    document.body.setAttribute("data-theme", tema);
  }, [tema]);

  function alternarTema() {
    setTema((temaActual) => (temaActual === "claro" ? "oscuro" : "claro"));
  }

  return { tema, alternarTema };
}
