# XBank — Mini Banco Digital

Prototipo de banca digital construido con React + Firebase. Permite iniciar sesion, ver saldo en tiempo real, transferir dinero entre usuarios y revisar el historial de movimientos, todo sincronizado con Firestore sin necesidad de refrescar la pagina.

## Stack

- React 18 (Vite)
- Firebase Authentication (Email/Password)
- Cloud Firestore (con suscripciones en tiempo real via onSnapshot)

## Requisitos previos

- Node.js 18 o superior
- Una cuenta de Firebase (gratuita, plan Spark es suficiente)

## Instalacion y ejecucion local

1. Clonar el repositorio:
   git clone URL_DEL_REPO
   cd mini-banco-digital

2. Instalar dependencias:
   npm install

3. Configurar las variables de entorno:
   - Copiar .env.example a .env: cp .env.example .env
   - Completar .env con las credenciales de tu propio proyecto de Firebase (Project Settings, Your apps, SDK config).

4. Habilitar en tu proyecto de Firebase:
   - Authentication, Sign-in method, Email/Password (habilitado)
   - Firestore Database, crear base de datos
   - Publicar las reglas de seguridad incluidas en firestore.rules

5. Correr el proyecto:
   npm run dev
   La app queda disponible en http://localhost:5173

## Usuarios de prueba

Email: camila@gmail.com / Contrasena: 123456789
Email: tamara@gmail.com / Contrasena: 123456789

Ambos usuarios parten con un saldo inicial de 100.000 CLP al registrarse.

## Estructura del proyecto

src/
  services/         Capa de acceso a Firebase (Auth y Firestore). No conoce React.
    firebaseConfig.js
    authService.js
    bankService.js
  context/
    AuthContext.jsx   Estado global de sesion con useReducer + useContext
  hooks/
    useSaldo.js       Suscripcion en tiempo real al saldo del usuario
    useMovimientos.js Suscripcion en tiempo real al historial
    useTheme.js       Modo oscuro persistente con localStorage
  components/
    auth/          LoginForm, RegisterForm
    dashboard/     BalanceCard, TransferForm, DepositWithdrawForm, TransactionHistory
  pages/
    LoginPage.jsx
    DashboardPage.jsx

## Modelo de datos (Firestore)

users/{uid}
  - nombre: string
  - email: string
  - saldo: number

movimientos/{id}
  - emisorUid: string
  - receptorUid: string
  - emisorNombre: string
  - receptorNombre: string
  - monto: number
  - fecha: timestamp

El historial de un usuario se arma combinando dos consultas (movimientos donde es emisor, movimientos donde es receptor) en el hook useMovimientos, ya que Firestore no permite una condicion OR entre dos campos distintos en una sola consulta.

## Transferencias: transaccion atomica

Las transferencias usan runTransaction de Firestore en vez de dos escrituras separadas (restar al emisor, sumar al receptor). Esto garantiza que la operacion se aplique completa o no se aplique en absoluto, evitando estados inconsistentes si falla a mitad de camino, y evitando condiciones de carrera si dos transferencias ocurren en paralelo sobre la misma cuenta.

## Funcionalidades opcionales implementadas

- useReducer + useContext para el estado global de sesion (AuthContext)
- Filtro de historial por tipo (todos, enviados, recibidos)
- Deposito y retiro simulado, con las mismas validaciones que las transferencias
- Modo oscuro persistente (localStorage), aplicado mediante variables CSS

## Reglas de seguridad de Firestore

Las reglas (ver firestore.rules) restringen:

- Lectura de users: solo usuarios autenticados.
- Creacion de users: un usuario solo puede crear su propio documento.
- Lectura de movimientos: solo las partes involucradas (emisor o receptor).
- Creacion de movimientos: solo si el emisorUid coincide con el usuario autenticado.
- movimientos es inmutable: no se puede editar ni borrar desde el cliente.

### Limitacion conocida

Para que una transferencia funcione, el emisor necesita poder actualizar el campo saldo tanto de su propio documento como del documento del receptor. Con reglas de Firestore puras (sin backend propio) no es posible validar que esa escritura provino de una transaccion de transferencia legitima y no de una edicion directa. La regla actual permite que cualquier usuario autenticado modifique unicamente el campo saldo de cualquier documento de users (no puede tocar nombre ni email ajenos), lo cual acota el riesgo pero no lo elimina del todo.

La solucion robusta a este problema seria mover la logica de transferencia a una Cloud Function (que corre con privilegios de administrador y puede validar la operacion completa antes de escribir), pero eso requiere el plan de pago Blaze de Firebase y esta fuera del alcance de este prototipo.

## Notas de seguridad

- El archivo .env con las credenciales de Firebase no se incluye en el repositorio (ver .gitignore). Usa .env.example como plantilla.
- La apiKey de Firebase para proyectos web no es un secreto critico en si misma (queda igualmente visible en el bundle del navegador); la proteccion real de los datos la dan las Firestore Security Rules descritas arriba.

## Uso de IA en el desarrollo

Este proyecto se desarrollo con apoyo de Claude (Anthropic) como asistente de programacion durante todo el proceso: definicion de arquitectura (separacion en services/context/hooks/components/pages), redaccion de codigo en cada capa, explicacion de conceptos de Firebase (transacciones atomicas, indices compuestos, security rules), y debugging de errores durante el desarrollo (configuracion de terminal, indices de Firestore, guardado de archivos).

Cada archivo generado fue revisado, ejecutado y probado antes de aceptarlo, y las decisiones de arquitectura (por ejemplo, el uso de runTransaction para las transferencias, o useReducer para el estado de sesion) fueron explicadas paso a paso durante el desarrollo, por lo que puedo justificar el por que de cada una en la defensa.

