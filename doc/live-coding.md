# Live coding en directo

Propuestas para interpretar con due.js sobre un escenario: control rapido, estructura del programa y visibilidad.
Es un catalogo de propuestas, no de compromisos; ninguna esta implementada salvo lo indicado.
Las propuestas de lenguaje, sonido y proyecto siguen en [features.md](features.md);
las correcciones y la deuda tecnica, en [tasks.md](tasks.md).
Una sintesis de opciones de interfaz y referentes externos esta en [ui-ideas.md](ui-ideas.md).

Las entradas F01-F06, F26, F27 y F33 se trasladaron desde features.md y conservan su identificador.
Las nuevas usan el prefijo L.

Atajos ya disponibles: `Cmd/Ctrl+S` compila, `Cmd/Ctrl+Enter` alterna play/pausa en el editor,
`Space` alterna play/pausa fuera del editor, `Cmd/Ctrl+/` comenta o descomenta,
`Cmd/Ctrl+Shift+M` (o clic en el margen) silencia la pista de la linea y `Cmd/Ctrl+Alt+Arriba/Abajo` ajusta el numero bajo el cursor.

Como primer grupo se sugieren L01, L02, L03 y L11, junto con F02 y F04, que comparten el estado por pista.

## Control rapido

### L01. Mute rapido de lineas

Alternar el silencio de una pista con un atajo o un clic en el margen, sin editar ni comentar su codigo.
Es la version por linea de F04: el estado se guardaria fuera del texto y se mostraria en el margen.
Habria que definir la identidad de la linea al editar o reordenar, y si el mute se aplica al instante o en el siguiente compas (F02).
Con varias lineas seleccionadas, el atajo alternaria todas.

Implementado: `Cmd/Ctrl+Shift+M` alterna las pistas de las lineas seleccionadas y un clic en el margen alterna la de esa linea
(`●` suena, `M` en rojo silenciada). El estado vive en Music por clave de pista (`sam1`), sobrevive a recompilar
y se aplica al instante. La pista silenciada sigue avanzando su patron y corta las voces que sonaban.
Queda el mute cuantizado (F02) y el solo.

### L02. Grupos de instrumentos

Aplicar efectos, volumen y mute a varias pistas a la vez:

```
[sam1#kick(C2;0.25b;$beat),sam2#hats(C4;0.1b;[0.5b,1b])]:r(2):v($xlow)
```

Los efectos del grupo se sumarian a los de cada pista; habria que fijar el orden y los conflictos de volumen.
Un grupo podria llevar nombre (`$$drums=[...]`) para silenciarlo, ajustarlo desde la interfaz o mapearlo a MIDI.
Debe decidirse si los grupos se anidan y si un grupo comparte una sola instancia de efecto o una por pista.

Implementado: una linea que empieza por `[` define un grupo de pistas separadas por `,`. Los efectos tras el `]` (y un `=>`) se
anaden a cada pista despues de los suyos, con una instancia de efecto por pista. El mute (`Cmd/Ctrl+Shift+M` o clic en el margen)
alterna todo el grupo. Sin anidado ni nombres de grupo; las pistas siguen en una sola linea.

### L03. Panel lateral de vista previa

Un panel a la derecha con el programa reducido, al estilo del minimapa de VS Code, util cuando el codigo es muy largo.
Mostraria la posicion visible, las pistas silenciadas, los errores y las lineas que suenan; un clic llevaria a esa zona.
Debe poder ocultarse y no consumir tiempo del hilo de audio al refrescarse.

Implementado parcialmente como minimapa integrado en CodeMirror: representa lineas de codigo y pistas, marca el viewport y la linea del cursor, y permite saltar por clic o teclado. Se oculta en pantallas estrechas y en documentos cortos; no muestra mute ni errores.

### L04. Lista de pistas

Un panel con las pistas del programa: nombre, mute, solo, volumen y salto a su linea.
Complementa L01 y F04 con una vista de conjunto y permite operar sin escribir.
Las pistas se identificarian por clave (`sam1`, `ai1`), de modo que sobrevivan a cambios de orden.

### L05. Escenas

Agrupar pistas en bloques con nombre y alternar entre ellos durante la interpretacion.

Decisiones tomadas:

- Sintaxis: `scene#intro{ ... }`, en la misma linea que el resto del DSL (`#` introduce el nombre, como en `sam1#kick`).
- Codigo fuera de una escena: es global y suena siempre (por ejemplo `bpm`, variables y una base comun).
- Una sola escena activa a la vez; activar otra silencia las pistas de la anterior.
- Reutilizacion: `scene('intro')` dentro de otra escena incluye sus pistas, renombrando sus claves con un prefijo
  de la escena para evitar colisiones (`sam1` de `intro` no choca con `sam1` de la escena que la incluye).
- Variables y `bpm` son globales y compartidas por todas las escenas.
- Una inclusion que forme un ciclo (A incluye B y B incluye A, o una escena que se incluye a si misma) es un error de validacion.
- Activacion: manual con atajo de teclado; la escena entra en el siguiente compas (F02).
  Se activa de dos formas: con el cursor dentro de la escena y `Cmd+Shift+Enter`,
  o por numero: `scene#intro@1` la asigna a `Cmd+1` (`@2` a `Cmd+2`, y asi hasta `@9`).
- Primer play: suena solo lo global hasta activar una escena.
- Editar la escena activa y compilar: los cambios entran en el siguiente compas.
- Claves incluidas: `scene('intro')` dentro de `verso` anade las pistas de `intro` con prefijo (`intro.sam1`);
  ese nombre es el que se ve en el mute (L01) y en la lista de pistas (L04).
- Una escena incluida solo suena mientras esta activa la escena que la incluye; no suena por su cuenta.

Ejemplo:

```
bpm(100)
$beat=1b

scene#intro@1{
  sam1#kick(C2;0.25b;$beat)
  sam5#harp([G4,E4,C4];7;[6-17])
}

scene#verso@2{
  scene('intro')
  sam9#guitar([C5|E5|G5];$beat;[2b-4b])
}
```

Opcion futura: avisar de que hay una escena en cola hasta el siguiente compas y permitir cancelarla.
Atajo y validacion: `Cmd+Shift+Enter` activa la escena bajo el cursor
y un `@N` repetido entre escenas es un error de validacion.

### L06. Tap tempo y rampas de tempo

Marcar el tempo con pulsaciones y cambiarlo gradualmente en un numero de compases.
Actualizaria `bpm(N)` respetando los limites 20-300 y las duraciones expresadas en pulsos.
Las duraciones en segundos conservarian su unidad, como en F31.

### L07. Metronomo y pulso visual

Un clic opcional y un indicador del pulso y del compas sobre la barra de progreso.
Ayuda a entrar a tiempo con otros musicos y a anticipar cuando se aplicara un cambio cuantizado.
Debe poder silenciarse y no incluirse en la salida grabada (F30).

### L08. Medidores y limitador de seguridad

Mostrar el nivel de la mezcla y de cada pista, y un limitador maestro que evite saturaciones.
Protege el equipo ante una subida de volumen o una realimentacion accidental, y apoya a F06.
El limitador seria configurable y su actuacion se indicaria en pantalla.

### L09. Volumen maestro y fundidos

Control del volumen global y fundidos de entrada y salida de una pista o grupo (`fade`) en pulsos o segundos.
Evita cortes bruscos al silenciar y facilita transiciones entre escenas.
La rampa deberia cancelarse limpiamente si se recompila a mitad.

### L10. Ajuste rapido de numeros

Incrementar o reducir el numero bajo el cursor con teclas (por ejemplo `Alt+Arriba/Abajo`), con paso configurable.
Con compilacion automatica (L11), permite ajustar volumenes, intervalos y efectos escuchando el resultado.
Respetaria los rangos de cada comando y las unidades, incluido el sufijo `b`.

Implementado: `Cmd/Ctrl+Alt+Arriba/Abajo` suma o resta 1 (0,1 en decimales, conservando los decimales).
Ignora los numeros que forman parte de un nombre (`sam1`, `C4`, `A#3`) y no baja de 0 en el limite superior de un rango.
No valida el rango de cada comando: eso lo hace la compilacion.

### L11. Compilacion automatica cuantizada

Aplicar el programa al dejar de escribir si es valido, en el siguiente pulso o compas elegido.
Reduce la necesidad de pulsar `Cmd+S` durante una interpretacion y se apoya en F02.
Debe poder activarse y desactivarse, y no aplicar nada mientras existan errores de sintaxis.

Implementado: el boton de la barra superior activa la compilacion automatica (desactivada por defecto).
Tras 800 ms sin escribir se valida el programa y, si el transporte suena, se aplica al comienzo del siguiente
compas de 4 pulsos segun `bpm`; con el transporte parado se aplica de inmediato. Si hay errores no se aplica nada
y solo se registra el error. El compas es fijo (4 pulsos) y el estado no se guarda entre sesiones.

### L12. Volver a la ultima version valida

Una accion para recuperar el ultimo programa que sono bien tras un experimento fallido.
Es mas rapido que deshacer en el editor y se distingue de F28, que guarda versiones con nombre.
Pasaria por la misma validacion que una compilacion normal.

## Visibilidad

### L13. Actividad por linea

Marcar en el margen las pistas que estan sonando y parpadear con cada evento.
Es una version ligera de F27, util para saber que linea produce que sonido sin analizar el codigo.
La marca debe seguir el reloj del audio y no ralentizar la escritura.

Implementado parcialmente: el token de nota, acorde o silencio activo se resalta directamente en el editor para patrones explicitos de `n`, `sam` y `mo`. Tambien marca la opcion elegida al azar, incluidos sus pesos, y las notas fuente de operadores como `::trans` o `::chord`. `ai` genera notas y `misam` recibe MIDI, asi que no tienen un token de patron que resaltar. Pausar o recompilar limpia la marca.

### L14. Deslizadores de variables

Mostrar un control junto a una variable (`$low`, `$$test`) para cambiar su valor con el raton o el teclado.
Complementa a F26: ademas de ver el valor, permite modificarlo sin reescribir el numero.
El cambio actualizaria la variable y quedaria reflejado en el texto o se marcaria como pendiente.

### L15. Indicador de carga

Mostrar el numero de voces activas y la carga de audio para avisar antes de que se produzcan cortes.
Ayuda a decidir cuando simplificar un programa denso durante la actuacion.
El aviso no debe interrumpir el audio ni cubrir el editor.

### L16. Plegado de bloques

Plegar y desplegar secciones delimitadas por comentarios para manejar programas largos.
Facilita centrarse en una parte, y con L03 da una imagen de la estructura del programa.
El plegado no cambiaria lo que se compila.

Implementado: cualquier comentario independiente que empieza por `//` puede plegar el bloque hasta el siguiente comentario independiente. Los comentarios al final de codigo no delimitan bloques. El gutter permite plegar y desplegar sin modificar el programa.

## Interfaz y proyeccion

### L17. Modo escenario

Un modo con tipografia grande, tema de alto contraste y sin barras ni paneles, pensado para proyectar.
Se activaria con un atajo y mantendria visibles solo el codigo y el pulso.
Debe incluir un modo de salida sencilla para volver al editor sin tocar el codigo.

### L18. Cargar ejemplos desde el menu

Dar uso al boton de menu para elegir y cargar un ejemplo de `samples/index.json`.
Pediria confirmacion antes de sustituir el codigo y permitiria volver al anterior (L12).
Sirve tambien como punto de partida para aprender.

### L19. Control MIDI de la interfaz

Asignar notas o controladores a acciones de la interfaz: play, mute de una pista, escena o volumen maestro.
Permitiria interpretar con una superficie de control sin tocar el teclado.
Convendria un modo de aprendizaje (mover un control para asignarlo) y reutilizar F33 para las conexiones.

### L20. Pads de teclado

Disparar notas o muestras sueltas con teclas del ordenador, sin editar el programa.
Util para improvisar encima de lo que suena o probar un instrumento antes de escribirlo.
Las teclas se desactivarian mientras el foco este en el editor para no interferir al escribir.

### L21. Escucha previa

Escuchar un cambio antes de enviarlo a la mezcla, por ejemplo por otra salida de audio.
Parecido a F23, pero aplicado al programa y no solo a muestras sueltas.
Depende de la compatibilidad del navegador con varias salidas, por lo que seria experimental.

### L22. Grabacion del directo como secuencia

Registrar el codigo y los cambios con su instante para reproducir una sesion o exportarla.
Se apoya en F28 y F30: guarda como se construyo la interpretacion, no solo el audio.
Habria que definir el formato y la resolucion temporal de los cambios.

## Trasladado desde features.md

### F01. Tiempo musical

Permitir expresar duraciones e intervalos en pulsos, compases y subdivisiones, ademas de segundos.
Esto facilitaria escribir patrones que mantengan su relacion ritmica al cambiar el tempo.
Habria que distinguir ambas unidades explicitamente y conservar el significado de los programas actuales.

Disponible parcialmente: el sufijo `b` expresa pulsos con `bpm(N)`; ver F31 y `doc/language.md`.
Quedan los compases y las subdivisiones.

### F02. Cambios cuantizados

Preparar y validar un programa antes de aplicar sus cambios al siguiente pulso o compas elegido.
El objetivo es introducir variaciones sin romper la continuidad ritmica durante una interpretacion.
Deberia indicarse que hay un cambio pendiente y permitir cancelarlo o sustituirlo antes de aplicarlo.

### F03. Ejecutar una seleccion

Compilar una linea o un bloque seleccionado sin modificar las pistas que quedan fuera de ese fragmento.
Esto permitiria experimentar con una parte del programa mientras el resto sigue sonando.
La identidad de las pistas y el alcance de las variables deben quedar definidos para evitar borrados inesperados.

### F04. Mute y solo por instrumento

Silenciar temporalmente una pista o escucharla de forma aislada sin borrar ni comentar su codigo.
El estado deberia ser visible y poder restablecerse sin reconstruir el programa.
Habria que definir como conservar estos estados al recompilar y como afectan a las notas y efectos que ya suenan.
Ver L01, L02 y L04 para el atajo, los grupos y la lista de pistas.

### F05. Atajos configurables

Ofrecer atajos para compilar, ejecutar la seleccion, reproducir y detener sin abandonar el teclado.
Las combinaciones deberian poder consultarse y configurarse, evitando conflictos con el editor y el navegador.
Las mismas acciones seguirian disponibles mediante controles accesibles para quienes no utilicen atajos.

Disponible parcialmente: `Cmd/Ctrl+S` compila, `Cmd/Ctrl+Enter` y `Space` (fuera del editor) alternan la reproduccion,
y `Cmd/Ctrl+/` comenta. Quedan la ejecucion de la seleccion, la parada y la configuracion.

### F06. Parada de emergencia

Incluir una accion inmediata para detener el transporte, cortar las voces activas y evitar notas MIDI colgadas.
Su comportamiento debe distinguirse de una pausa normal y definir que ocurre con las colas de los efectos.
El codigo permaneceria intacto y el usuario podria volver a iniciar una interpretacion desde un estado conocido.

### F26. Inspeccion de valores

Consultar el valor actual de variables, controles MIDI y expresiones relevantes sin depender de la consola.
La vista deberia distinguir los valores del programa aplicado de los cambios que siguen pendientes en el editor.
Las actualizaciones frecuentes se limitarian para no interferir con el rendimiento del audio ni con la escritura.

### F27. Visualizacion sincronizada

Senalar el paso activo de cada patron y ofrecer una vista de las notas o eventos proximos a ejecutarse.
Esto ayudaria a relacionar el codigo con lo que se escucha, especialmente con secuencias largas o varias pistas.
La visualizacion seguiria el reloj del audio, no controlaria su ejecucion y reflejaria pausas y recompilaciones.

Implementado parcialmente: el token activo se resalta inline en el codigo y sigue el indice real elegido por el runtime, tanto en secuencias `>` como en listas aleatorias. No muestra todavia una prevision de los proximos eventos ni un piano roll o punchcard separado.

### F33. Conexion y reconexion MIDI en directo

Gestionar la conexion y desconexion de dispositivos mientras el programa esta activo, sin detener los demas instrumentos.
Habria que decidir como identificar un dispositivo al cambiar el orden de las entradas y si las variables inactivas se reconectan.
La interfaz deberia reflejar el estado y la recuperacion de cada conexion, evitando listeners duplicados y notas colgadas.
