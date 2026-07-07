// src/hooks/useSaldo.js
import { useEffect, useState } from "react";
import { suscribirseASaldo } from "../services/bankService";

// Hook que expone el saldo del usuario en tiempo real
export function useSaldo(uid) {
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    const unsubscribe = suscribirseASaldo(
      uid,
      (data) => {
        setDatosUsuario(data);
        setCargando(false);
      },
      (err) => {
        setError(err.message);
        setCargando(false);
      }
    );

    // Cleanup: cancela la suscripción si el uid cambia o el componente se desmonta
    return () => unsubscribe();
  }, [uid]);

  return { datosUsuario, cargando, error };
}
