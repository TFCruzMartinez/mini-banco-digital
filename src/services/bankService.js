// src/services/bankService.js
import {
  doc,
  runTransaction,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// Busca un usuario por su email (para validar destinatario en una transferencia)
export async function buscarUsuarioPorEmail(email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docEncontrado = snapshot.docs[0];
  return { uid: docEncontrado.id, ...docEncontrado.data() };
}

// Ejecuta una transferencia de dinero de un usuario a otro de forma atómica
export async function transferirDinero({ emisorUid, receptorUid, monto, emisorNombre, receptorNombre }) {
  if (monto <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }
  if (emisorUid === receptorUid) {
    throw new Error("No puedes transferirte dinero a ti mismo");
  }

  const emisorRef = doc(db, "users", emisorUid);
  const receptorRef = doc(db, "users", receptorUid);
  const movimientoRef = doc(collection(db, "movimientos"));

  await runTransaction(db, async (transaction) => {
    const emisorSnap = await transaction.get(emisorRef);
    const receptorSnap = await transaction.get(receptorRef);

    if (!emisorSnap.exists() || !receptorSnap.exists()) {
      throw new Error("Usuario no encontrado");
    }

    const saldoEmisor = emisorSnap.data().saldo;

    if (saldoEmisor < monto) {
      throw new Error("Saldo insuficiente");
    }

    const saldoReceptor = receptorSnap.data().saldo;

    // Todas estas escrituras se aplican juntas, o ninguna se aplica
    transaction.update(emisorRef, { saldo: saldoEmisor - monto });
    transaction.update(receptorRef, { saldo: saldoReceptor + monto });
    transaction.set(movimientoRef, {
      emisorUid,
      receptorUid,
      emisorNombre,
      receptorNombre,
      monto,
      fecha: new Date(),
    });
  });
}

// Suscripción en tiempo real al saldo del usuario. Retorna la función unsubscribe.
export function suscribirseASaldo(uid, callback, onError) {
  const userRef = doc(db, "users", uid);

  const unsubscribe = onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    },
    (error) => {
      onError(error);
    }
  );

  return unsubscribe;
}

// Suscripción en tiempo real a los movimientos donde el usuario es emisor
export function suscribirseAMovimientosEnviados(uid, callback, onError) {
  const q = query(
    collection(db, "movimientos"),
    where("emisorUid", "==", uid),
    orderBy("fecha", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const movimientos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(movimientos);
    },
    (error) => onError(error)
  );
}

// Suscripción en tiempo real a los movimientos donde el usuario es receptor
export function suscribirseAMovimientosRecibidos(uid, callback, onError) {
  const q = query(
    collection(db, "movimientos"),
    where("receptorUid", "==", uid),
    orderBy("fecha", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const movimientos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(movimientos);
    },
    (error) => onError(error)
  );
}
// Simula un depósito: aumenta el saldo del usuario directamente
export async function depositarDinero(uid, monto) {
  if (monto <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }

  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("Usuario no encontrado");
    }

    const saldoActual = userSnap.data().saldo;
    transaction.update(userRef, { saldo: saldoActual + monto });
  });
}

// Simula un retiro: disminuye el saldo del usuario, validando saldo suficiente
export async function retirarDinero(uid, monto) {
  if (monto <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }

  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("Usuario no encontrado");
    }

    const saldoActual = userSnap.data().saldo;

    if (saldoActual < monto) {
      throw new Error("Saldo insuficiente para retirar");
    }

    transaction.update(userRef, { saldo: saldoActual - monto });
  });
}

