// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

const SALDO_INICIAL = 100000;

// Registra un nuevo usuario en Auth y crea su documento en Firestore
export async function registrarUsuario(nombre, email, password) {
  const credenciales = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credenciales.user.uid;

  // Creamos el documento del usuario en la colección "users"
  await setDoc(doc(db, "users", uid), {
    nombre,
    email,
    saldo: SALDO_INICIAL,
  });

  return credenciales.user;
}

// Inicia sesión con email y contraseña
export async function iniciarSesion(email, password) {
  const credenciales = await signInWithEmailAndPassword(auth, email, password);
  return credenciales.user;
}

// Cierra la sesión activa
export async function cerrarSesion() {
  await signOut(auth);
}
