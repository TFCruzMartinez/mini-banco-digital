# Guia de defensa — XBank

Preguntas esperadas segun la rubrica del curso, agrupadas por tema, con la respuesta y el razonamiento detras de cada decision tecnica.

## 1. useEffect y dependencias

**Por que useSaldo tiene [uid] como dependencia y no []?**

Porque el efecto necesita volver a ejecutarse si el usuario cambia (por ejemplo, si cierra sesion y otro usuario inicia sesion). Si usara [], la suscripcion quedaria fija al primer uid que existia cuando el componente se monto, y nunca se actualizaria aunque cambiara el usuario logueado. Ademas, al primer render uid puede no estar listo todavia (viene de AuthContext, que tarda en resolver onAuthStateChanged), asi que el efecto debe reaccionar cuando ese valor llega.

**Por que el useEffect del AuthContext si usa []?**

Porque el listener onAuthStateChanged debe registrarse una sola vez, cuando la app arranca, y no depende de ningun valor que cambie con el tiempo. Es Firebase quien avisa de los cambios de sesion a traves del callback, no la app quien debe volver a suscribirse.

## 2. Cleanup / unsubscribe

**Que pasa si no haces unsubscribe?**

Queda un listener zombie escuchando cambios en Firestore para siempre, incluso despues de que el componente que lo creo ya no existe en pantalla. Cada vez que el usuario navega o cambia de cuenta se acumula una suscripcion mas, es una fuga de memoria. Con el tiempo la app hace mas trabajo del necesario y puede gastar cuota de lecturas de Firestore innecesariamente.

**En useMovimientos, por que hay que limpiar dos suscripciones y no una?**

El hook abre dos onSnapshot en paralelo (movimientos enviados y recibidos), porque Firestore no permite un OR entre dos campos distintos en una sola query. El cleanup del useEffect debe cancelar ambas: si solo se cancela una, la otra queda viva sin control.

## 3. Por que el saldo no vive en un useState local sin suscripcion

**Por que no simplemente guardas el saldo en un useState y lo actualizas manualmente despues de cada operacion?**

Porque eso romperia el requisito de tiempo real: si otro usuario transfiere dinero mientras tengo la app abierta, un useState local nunca se enteraria, a menos que yo mismo dispare la actualizacion, pero yo no soy quien hace esa transaccion. onSnapshot es lo que permite que Firestore avise a la app cuando alguien mas cambia los datos, sin refrescar ni hacer polling.

## 4. runTransaction

**Por que usas runTransaction en vez de dos updateDoc separados?**

Una transferencia son en realidad tres escrituras relacionadas (restar al emisor, sumar al receptor, crear el movimiento) que deben aplicarse como una sola unidad atomica. Si se hicieran por separado y algo fallara a mitad de camino, el dinero podria desaparecer: se resta pero nunca se suma. runTransaction garantiza que se apliquen todas o ninguna.

**Por que se valida el saldo dentro de la transaccion si ya se valido antes en el formulario?**

Doble capa de seguridad. La validacion del formulario es solo para dar feedback rapido al usuario, pero el saldo pudo cambiar entre que cargo la pantalla y que se envio el formulario, por ejemplo si llego otra transferencia justo en ese momento. La transaccion vuelve a leer el saldo real en el instante exacto de escritura, y ahi es donde la validacion realmente importa para la integridad de los datos.

## 5. useReducer vs useState

**Por que el AuthContext usa useReducer en vez de tres useState sueltos?**

user, loading y error estan relacionados entre si y deben cambiar juntos y de forma consistente ante cada evento. Con tres useState separados existe el riesgo de actualizar uno y olvidar otro, por ejemplo setear user pero olvidar poner loading en false, dejando el estado en una combinacion invalida. Con useReducer, cada accion (AUTH_SUCCESS, AUTH_LOGOUT, etc.) define explicitamente como cambian los tres valores a la vez, en un solo lugar centralizado.

## 6. Manejo de eventos

**Por que usas event.preventDefault()?**

Sin eso, el navegador ejecuta su comportamiento nativo al enviar un formulario: recarga la pagina completa. Eso destruiria todo el estado de React (la sesion visual, cualquier dato en memoria) y romperia la experiencia de SPA.

**Por que deshabilitas el boton mientras "enviando" es true?**

Para evitar doble submit. Si el usuario hace clic dos veces rapido, sin esa proteccion se dispararian dos operaciones en vez de una. En un contexto bancario ese bug seria particularmente grave.

## 7. Componentes controlados

**Que significa que un formulario este controlado?**

Que el valor del input vive en el estado de React (useState), no en el DOM. React es la unica fuente de verdad: el value del input viene del estado, y cada tecla dispara onChange, que actualiza ese estado, que a su vez vuelve a renderizar el input con el nuevo valor. Esto permite validar, transformar o resetear el valor programaticamente en cualquier momento.

## 8. Separacion de responsabilidades (services / hooks / components)

**Por que separaste la logica de Firebase en services/ en vez de llamarla directo desde los componentes?**

Para que los componentes no sepan nada de Firestore ni de Firebase Auth, solo consumen funciones con nombres de negocio (iniciarSesion, transferirDinero). Si manana cambiara el backend, solo se tocarian los archivos de services/, no cada componente. Tambien hace el codigo mas testeable y mas facil de leer.

## 9. Indices compuestos de Firestore

**Por que fue necesario crear indices manualmente?**

Firestore crea automaticamente indices de un solo campo, pero cuando se combina un where en un campo con un orderBy en otro campo distinto (como en useMovimientos), Firestore necesita un indice compuesto para poder filtrar y ordenar eficientemente al mismo tiempo. No se crean automaticamente por precaucion de costos; Firestore avisa la primera vez que se ejecuta la consulta, con un link que trae la definicion exacta lista para crear.

## 10. Firestore Security Rules

**Por que cualquier usuario autenticado puede modificar el saldo de otro documento?**

Es una limitacion conocida y documentada del modelo cliente-only. Para que una transferencia funcione, el emisor necesita actualizar tanto su propio saldo como el del receptor. Sin un backend propio (Cloud Function), no es posible validar con reglas de Firestore que esa escritura vino de una transaccion legitima. La regla actual acota el riesgo permitiendo modificar unicamente el campo saldo, pero no lo elimina del todo. La solucion robusta seria mover la transferencia a una Cloud Function con privilegios de administrador, lo que requiere el plan de pago Blaze de Firebase.

## 11. UI derivada del estado

**Que significa que la UI es una funcion del estado?**

Que nunca se manipula el DOM directamente; en vez de eso, todo lo que se muestra en pantalla se calcula a partir de variables de estado (useState, useReducer, o datos que llegan de props). Por ejemplo, en TransactionHistory, movimientosFiltrados no es su propio useState: se recalcula en cada render a partir de movimientos (que viene de Firestore) y filtroTipo (estado local del filtro), garantizando que nunca queden desincronizados entre si.

