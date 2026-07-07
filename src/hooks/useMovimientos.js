// src/hooks/useMovimientos.js
import { useEffect, useState } from "react";
import {
  suscribirseAMovimientosEnviados,
  suscribirseAMovimientosRecibidos,
} from "../services/bankService";

// Hook que combina movimientos enviados y recibidos en un solo historial ordenado
export function useMovimientos(uid) {
  const [enviados, setEnviados] = useState([]);
  const [recibidos, setRecibidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    const unsubscribeEnviados = suscribirseAMovimientosEnviados(
      uid,
      (data) => {
        setEnviados(data);
        setCargando(false);
      },
      (err) => {
        setError(err.message);
        setCargando(false);
      }
    );

    const unsubscribeRecibidos = suscribirseAMovimientosRecibidos(
      uid,
      (data) => {
        setRecibidos(data);
        setCargando(false);
      },
      (err) => {
        setError(err.message);
        setCargando(false);
      }
    );

    // Cleanup: cancela AMBAS suscripciones
    return () => {
      unsubscribeEnviados();
      unsubscribeRecibidos();
    };
  }, [uid]);

  // Combinamos ambas listas, marcando el tipo, y ordenamos por fecha descendente
  const movimientos = [...enviados, ...recibidos]
    .map((mov) => ({
      ...mov,
      tipo: mov.emisorUid === uid ? "envio" : "recepcion",
      contraparte: mov.emisorUid === uid ? mov.receptorNombre : mov.emisorNombre,
    }))
    .sort((a, b) => b.fecha.toMillis() - a.fecha.toMillis());

  return { movimientos, cargando, error };
}
