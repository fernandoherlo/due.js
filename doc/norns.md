# Ideas inspiradas en monome Norns

Norns es un instrumento de scripts en vivo (Lua sobre SuperCollider) con tres encoders, tres teclas, una pantalla pequena y un ecosistema de scripts compartidos.
Estas ideas trasladan lo que mejor funciona de ese enfoque a due.js. Estan escritas sin probar; el ID es solo para referenciarlas (N01-N20).

## Opcion viable y prioritaria

**N07 (secuenciadores de longitudes distintas)** es la mas barata y la que mas resultado da: dos pistas de 5 y 7 pasos se alinean solo cada 35,
asi que con pocas notas la pieza no parece repetirse. Probablemente ya funciona hoy, porque cada pista es un bucle independiente.
Pendiente: comprobar que todas las pistas arrancan en el mismo instante y, opcionalmente, un modo `::len(N)` que recorte o rellene una pista.
Combina con G32 (pasos cortos) y G08 (probabilidad).

## Control y parametros

### N01. Parametros asignables

Cada instrumento y efecto expone sus parametros (volumen, filtro, tiempo de delay...) en un panel. Se pueden mover con raton o MIDI sin tocar el codigo,
como el menu de parametros de Norns. El valor movido en el panel gana hasta que se recompile.

### N02. Tres mandos virtuales

Tres controles siempre visibles, asignables a cualquier parametro, equivalentes a los tres encoders. Pueden moverse con raton, rueda o un controlador MIDI.

### N03. MIDI learn

Mover un mando MIDI mientras un parametro esta seleccionado lo asigna a ese parametro. La asignacion se guarda con la pieza (relacionada con L05, escenas).

### N04. Parametros con rango y curva

Cada parametro declara minimo, maximo y curva (lineal, exponencial) para que un mando de 0 a 127 sea util en frecuencias, tiempos o volumen.

### N05. Presets de parametros

Guardar y recuperar conjuntos de valores con nombre, para pasar de un sonido a otro en directo sin reescribir efectos.

## Tiempo y secuencias

### N06. Reloj compartido

Un reloj global del que cuelgan todas las pistas, con tempo ajustable en vivo y sincronizable por MIDI clock con otros dispositivos.

### N07. Secuenciadores de longitudes distintas

Como en "Awake": dos patrones de 5 y 7 pasos que se desfasan solos. Un modo que fije la longitud de la pista independientemente del resto.

### N08. Divisores y multiplicadores de reloj

Cada pista corre a una fraccion o multiplo del reloj (`/2`, `x3`), para polirritmos sin recalcular duraciones.

### N09. Corrimiento de pasos

Desplazar un patron uno o varios pasos hacia delante o atras mientras suena, sin cambiar sus notas.

### N10. Secuenciador de mano izquierda y derecha

Dos capas con reglas distintas (una fija, otra probabilistica) que comparten escala y reloj, al estilo de "No Refrain".

## Audio en vivo

### N11. Bucles de audio (softcut / mlr)

Grabar un tramo de la salida o de una pista en un buffer y reproducirlo en bucle, con velocidad, direccion y posicion variables.

### N12. Overdub

Grabar sobre un bucle existente sin borrarlo, con una realimentacion que va atenuando lo anterior.

### N13. Voces de reproduccion multiples

Varias cabezas de lectura sobre el mismo buffer, con tamano de ventana, tono y panoramica propios, como las voces de softcut.

### N14. Entrada de audio

Usar el microfono o la entrada de linea como fuente: procesar con los mismos efectos que un instrumento y grabar en los bucles.

### N15. Muestreo de la propia salida

Capturar un tramo de lo que esta sonando y convertirlo en un instrumento de muestras para reutilizarlo en la pieza.

## Interfaz y ecosistema

### N16. Pantalla minima de estado

Una vista pequena (monocroma) con pistas activas, nombre de la pieza, tempo y nivel. Pensada para dejarse abierta sin distraer (relacionada con G30).

### N17. Scripts compartidos

Un indice de piezas con descripcion, autor y parametros, para cargarlas con un clic y modificarlas. Amplia lo que ya hace `samples/index.json`.

### N18. Rejilla y arco virtuales

Una rejilla de botones en pantalla que dispare notas, escenas o silencios, equivalente a monome grid. Compatible con un grid fisico por WebMIDI/serie si se desea.

### N19. Modo de reproduccion sin editor

Cargar una pieza y dejarla sonando con solo los mandos y la pantalla minima visibles, util para actuar o para dejarla horas (relacionada con G28).

### N20. Modulos de sonido intercambiables

Separar motor de sonido y pieza: una pieza declara que necesita "un sintetizador polifonico" y se puede cambiar el motor sin tocar la secuencia,
como los engines de Norns.
