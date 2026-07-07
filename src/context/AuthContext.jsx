// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useReducer } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

// Estado inicial: nadie ha iniciado sesión todavía, y estamos verificando
const estadoInicial = {
  user: null,
  loading: true,
  error: null,
};

// El reducer decide cómo cambia el estado según la acción recibida
function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return { user: action.payload, loading: false, error: null };
    case "AUTH_ERROR":
      return { user: null, loading: false, error: action.payload };
    case "AUTH_LOGOUT":
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, estadoInicial);

  useEffect(() => {
    // onAuthStateChanged es el "listener" de Firebase: se dispara automáticamente
    // cada vez que cambia el estado de sesión (login, logout, o al cargar la página)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch({ type: "AUTH_SUCCESS", payload: firebaseUser });
      } else {
        dispatch({ type: "AUTH_LOGOUT" });
      }
    });

    // Cleanup: cancelamos la suscripción cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
