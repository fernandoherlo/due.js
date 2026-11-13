# Musica generativa ambiental

Ideas para que due.js produzca musica ambiental generativa como la de [generative.fm](https://generative.fm/)
(proyecto de Alex Bainter; codigo en [github.com/generativefm](https://github.com/generativefm), sobre todo `generators`).
Es un catalogo de propuestas, no de compromisos. G31 esta implementada y G32 parcialmente; el resto son ideas pendientes.

Las piezas de ese proyecto comparten recursos que due.js ya tiene en parte: instrumentos de muestras (Tone.js), reverbs largas,
delays, notas elegidas al azar de una escala y bucles que no coinciden entre si, de modo que la combinacion tarda mucho en repetirse.
Lo que falta para acercarse a ese enfoque es escala global, probabilidad por evento, evolucion lenta y semillas reproducibles.

Identificadores con prefijo G. Los ejemplos de sintaxis son orientativos; las propuestas de lenguaje general siguen en [features.md](features.md)
y las de directo en [live-coding.md](live-coding.md).

Como primer grupo de exploracion se sugieren G05, G11 y G19. G01 y G02 se consideran descartadas porque cambiarian demasiado la sintaxis;
mientras tanto, las piezas pueden declarar listas de notas explicitas y usar `::trans(n)` para transponerlas.

## Lo observado en el codigo (pieza "Zed")

Las piezas de `generators` son JavaScript sobre Tone.js, con las muestras en otro repositorio; el autor avisa de que el codigo es poco cuidado.
Leyendo `packages/piece-zed/src/piece.js` se ve el patron que sigue la musica ambiental:

- **Notas de una escala:** solo naturales de Do mayor en las octavas 3 y 4 (14 notas). Cada acorde toma un indice y suma 2 y 5 posiciones en esa lista (G01, G02, G03).
- **Acordes que se encadenan solos:** al sonar un acorde se programa el siguiente a 8-14 segundos aleatorios, sin parar (G07, G09).
- **Envolventes lentas:** ataque de 5 s y liberacion de 12 s con duraciones de 4-7 s, de modo que los acordes se funden unos con otros (G05, G16).
- **Reverb muy larga:** decaimiento de 20 s con mezcla del 50 % (G20).
- **LFO sobre casi todo:** filtro pasa-bajos del pad entre 100 y 250 Hz, del ruido entre 5 y 10 kHz y ganancia del ruido, con frecuencias de 0,05-0,1 Hz.
  Incluso las frecuencias de los LFO estan moduladas por otro LFO, y se fijan al azar al arrancar (G15, G23).
- **Capa de ruido continua:** un bucle de ruido filtrado, muy bajo (-40 dB), como fondo (G26).
- **Un solo generador de azar:** toda la pieza usa `rng()`, lo que permitiria una semilla comun (G10).
- **Detalles de coste y volumen:** el pad y el ruido se prerenderizan a audio para ahorrar CPU, y cada pieza lleva un ajuste de ganancia para igualar el volumen entre ellas (G18).

Idea que resulta de ahi: con envolventes largas, el instrumento deberia aceptar ataque y liberacion por pista, no solo duracion de nota (relacionado con G05 y G16).

## Lo observado en el codigo (pieza "Oxalis 1")

`piece-oxalis-1` son cuatro lineas: una lista de cinco notas (`C3, C4, B4, E5, G5`) pasada a la factoria `make-piece-oxalis`, que tambien usan otras piezas.
La logica esta en `make-oxalis.js`:

- **Un bucle independiente por nota:** cada nota se reprograma a si misma con un retardo aleatorio de 0 a 15 s mas 15 s fijos (45 s para la mas grave).
  Con periodos distintos y aleatorios, el conjunto no se repite nunca, y es el principio de las cintas de Eno (G07, G09).
- **Arranque inmediato:** una nota elegida al azar suena enseguida y el resto entra despues, para no empezar en silencio (G17).
- **Probabilidad del 5 %:** cada vez que suena una nota de piano, con esa probabilidad se anade la misma nota una octava mas arriba en un glockenspiel, a -15 dB (G08).
- **Delay muy largo:** retardo de 5 s con realimentacion de 0,5, compartido por piano y glockenspiel, de modo que cada nota deja ecos cada 5 s (G21, G22).
- **Reverb de 15 s:** mezcla del 50 %, integrada en las muestras prerenderizadas (G20).
- **Solo muestras y pocas notas:** piano y glockenspiel de la misma coleccion VSCO2 que `piano` y `glock` en due.js. Toda la riqueza viene del tiempo, no de la melodia (G27).

Una aproximacion con lo que due.js ya permite seria una pista `sam` por nota con intervalo aleatorio largo y mucha reverb,
por ejemplo `sam1#piano(C3;8;[45-60])` y `sam2#piano(C4;8;[15-30])`, pero faltarian el delay de 5 s con realimentacion
y la probabilidad por nota; es un ejemplo orientativo, sin probar.

## Otras piezas leidas

Se leyo el `piece.js` de estas piezas (carpeta `packages/piece-*`). Todas siguen un mismo esquema: unas pocas notas, un azar acotado,
reverb y delay largos, y reprogramacion continua de cada evento con un retardo aleatorio.

| Pieza | Que hace |
| --- | --- |
| Eno Machine | Acorde de novena mayor invertido en tres octavas; cada nota se repite con un intervalo propio de 20 a 60 s y un desfase inicial aleatorio |
| Drones | Tres notas (`C4, G4, E4`) con muestras largas transpuestas 36 semitonos hacia abajo, cada una repetida a los 40-60 s, con un filtro automatico de frecuencia muy lenta |
| Observable Streams | Flujo de notas de Do mayor al que se aplican operadores encadenados (octavas, retardo, acordes, humanizacion), con piano, violin y corno ingles |
| Sevenths | Acordes de septima (mayor, menor, dominante) con tonica e inversion al azar; sus notas se reparten en una ventana de 0,25 a 5 s y el siguiente acorde llega a los 3-15 s |
| Little Bells | Glockenspiel que toca acordes menores de septima: en cada pulso tiene una probabilidad pequena de sonar, mayor en pulsos impares; delay de 8 s |
| Pinwheels | Un acorde de septima menor que suena en bucle cada vez mas rapido y luego mas lento, y al terminar lanza otro u otros dos |
| No Refrain | Patron fijo de seis notas graves ("mano izquierda") con tiempos ligeramente irregulares y notas agudas ("mano derecha") con un 80 % de probabilidad |
| Lemniscate | Dos pianos con panoramica opuesta; la probabilidad de que suene cada nota cambia con un LFO de ocho minutos |
| Bhairav | Una frase de raga de la que se extraen fragmentos al azar, con piano, bordones de violonchelo y cambio de octava de la tonica |
| A Viable System | Piano, contrabajo y violin con frases por pasos cortos, cada uno con su separacion entre notas |
| Timbral Oscillations | Frases por pasos cortos de un piano que pasa por una cadena de siete efectos, la mayoria con LFO muy lento |
| Agua Ravine | Siete frases de acordes fijas, elegidas al azar, recortadas y a veces invertidas, mas dos notas de vibrafono cada 20-60 s con reverb de 30 s |
| Trees | Tonica y escala mayor al azar; progresiones de acordes que se abren alrededor de un centro |
| Apoapsis | Piano en reversa y violines con fundido de 8 s, repetidos cada 30-60 s y 60-180 s, con delays de 0,2 s y de 20-30 s en serie |

Tecnicas que se repiten y que due.js aun no cubre:

- **Intervalo propio por nota o por instrumento:** casi todas las piezas dan a cada nota un `scheduleRepeat` con su intervalo aleatorio
  y un desfase inicial para que no arranquen a la vez (G07, G09).
- **Reprogramacion recursiva:** cada evento decide cuando sera el siguiente, en vez de seguir un compas fijo (G07, G14).
- **Pasos cortos:** las melodias nunca saltan mas de dos o tres notas de la escala (G32).
- **Reverb prerenderizada:** muchas piezas aplican la reverb a las muestras antes de tocar, para ahorrar CPU (G42).
- **Todas leen un `rng()` global:** la misma semilla da la misma pieza (G10).

Las ideas que salen de estas piezas, nuevas respecto a G01-G30, estan en el ultimo apartado (G31-G43).

## Escalas y armonia

### G01. Escalas y tonalidad global

Declarar una tonalidad y una escala (`key(D)`, `scale(dorian)`) y que toda nota aleatoria se ajuste a ella.
Es la base de la musica ambiental: el azar siempre cae en notas que suenan bien juntas, sea cual sea el orden.
Hoy hay que escribir a mano la lista de notas de cada pista; con una escala global, cambiar de tonalidad seria una sola linea.

### G02. Notas por grado de escala

Escribir grados (`1`, `3`, `5`, `b7`) en vez de nombres de nota, resueltos con la escala activa.
Permite reutilizar un patron en otra tonalidad y transponer una pieza entera cambiando `key(...)`.

### G03. Acordes por nombre y progresiones

Aceptar `Cmaj7`, `Dm9` o `Fsus2` como valor y listas de acordes (`[Cmaj7>Am9>Fmaj7]`) que avanzan lentamente.
Las progresiones largas con acordes abiertos, de muchos pulsos por acorde, son el esqueleto de muchas piezas ambientales.

### G04. Cambio de tonalidad lento

Modular a otra tonalidad o escala cada cierto numero de compases, sin cortes: las notas ya sonando terminan y las nuevas usan la escala nueva.
Da la sensacion de pieza que "respira" durante horas sin repetir.

### G05. Notas guia y pedales

Una nota larga y estable (un pedal o drone) que se mantiene mientras el resto cambia a su alrededor.
Se podria expresar con una duracion mayor que el intervalo, de modo que las notas se solapen y formen una nube.

### G06. Registro por pista

Limitar cada pista a un rango de octavas (`range(C2,C3)`) y generar solo notas dentro de el.
Evita que una pista grave suba a un registro agudo y mantiene un reparto de frecuencias estable.

## Tiempo y azar

### G07. Bucles de longitud distinta

Facilitar que cada pista tenga un periodo propio, incluso no multiplo de las demas (7b, 11b, 13b), como las cintas de "Music for Airports".
La superposicion tarda en repetirse el minimo comun multiplo de todos los periodos. Un aviso o ayuda podria calcular cuanto dura el ciclo total.

### G08. Probabilidad por nota

Una probabilidad de que cada golpe suene (`p(0.3)`): la pista deja huecos al azar en lugar de sonar siempre.
Es lo que da el caracter disperso de las piezas de piano ambiental.

### G09. Intervalos aleatorios con distribucion

Elegir el intervalo entre notas de un rango con una distribucion (uniforme, normal, cola larga) en vez de solo `[min-max]`.
Con mas peso en intervalos largos y algun golpe cercano ocasional, el pulso deja de percibirse.

### G10. Semilla del azar

`seed(42)` fija la secuencia aleatoria para repetir una pieza exacta, y sin semilla cada reproduccion es distinta.
Util para guardar y compartir un resultado que gusto, y para tests.

### G11. Humanizacion del tiempo

Desviar levemente el instante y la duracion de cada nota (unos milisegundos) y variar la velocidad.
Con sampler y notas separadas de forma irregular, el resultado se siente tocado y no secuenciado.

### G12. Evitar repeticiones inmediatas

Al elegir al azar de una lista, no repetir la nota anterior o evitar repetir la misma nota dos veces seguidas (modo "sin repeticion").
Mejora mucho la sensacion melodica del azar puro.

### G13. Cadenas de Markov

Definir transiciones entre notas o acordes (`C->[E,G]`, `E->[C,D]`) para que la melodia tenga direccion sin ser una secuencia fija.
Con pocas reglas se obtienen melodias que parecen intencionadas.

### G14. Tiempo largo y duracion de la pieza

Una unidad para escalas de minutos (`4m`) y una forma de definir secciones que duran minutos u horas.
La musica generativa se escucha durante periodos largos, mucho mas que un bucle de directo.

## Evolucion y movimiento

### G15. Parametros que derivan lentamente

Valores que cambian solos con el tiempo: una rampa, una onda lenta (LFO) o un paseo aleatorio.
Por ejemplo `v(~0.5)` para un volumen que oscila, o `r(lfo(20,80;3m))` para una reverb que varia en 3 minutos.

### G16. Fundido de entrada y salida por pista

Cada pista entra y sale con un fundido largo, sin cortes, en momentos distintos.
Hace que la textura global cambie sin que se note donde ocurre.

### G17. Capas que aparecen y desaparecen

Activar o desactivar pistas automaticamente segun probabilidad o ciclo (una pista suena 40 % del tiempo, en tramos de 1 a 3 minutos).
Es el equivalente automatico del mute de directo, y se apoya en el estado de silencio por pista ya existente.

### G18. Dinamica global suave

Una envolvente de volumen para toda la pieza (swell lento, valles y picos) aplicada al maestro.
Evita que la mezcla suene plana durante horas.

### G19. Variaciones por pasadas

Un valor distinto en cada repeticion de un bucle (`[A3>C4>E4]` ya lo hace) combinado con probabilidad:
que una nota del patron cambie solo de vez en cuando, y que el cambio se mantenga o se revierta.

## Sonido y efectos

### G20. Reverb larga y de calidad

Mas control de la reverb (tiempo de decaimiento, pre-delay, mezcla) y una reverb por convolucion con respuestas de sala o de catedral.
Los ambientales dependen de colas de varios segundos; la `r(...)` actual deja poco margen para ajustarlas.

### G21. Reverb compartida entre pistas

Un bus de efecto compartido por varias pistas, en vez de una instancia por pista.
Suena mas cohesivo, gasta menos CPU y hace posible mezclar con precision (relaciona con L02: los grupos hoy crean una instancia por pista).

### G22. Delays largos con realimentacion

Delay con tiempo en pulsos, realimentacion alta y filtro para que cada eco sea mas oscuro.
Convierte una nota aislada en una estela de ecos que se desvanecen.

### G23. Filtros y su movimiento

Filtro pasa-bajos y pasa-altos con frecuencia modulada lentamente.
Con un barrido muy lento, un mismo sample cambia de brillo durante minutos.

### G24. Pitch aleatorio y desafinacion

Variar ligeramente el tono (unos centesimos) o reproducir muestras a velocidad distinta (media o doble) para texturas.
Es habitual en piezas hechas con una sola muestra: la misma grabacion suena distinta cada vez.

### G25. Muestras en reversa y granulares

Ampliar el modo de reversa existente con reproduccion granular (fragmentos cortos y solapados de una muestra larga).
Permite hacer atmosferas con pads, voces y sonidos de campo grabados.

### G26. Sonidos de ambiente

Capas de ruido y grabaciones de campo (lluvia, oceano, viento, pajaros) como pista continua de fondo.
Algunas ya existen como presets (`ocean`, `waves`, `birds`, `whales`); faltaria reproducirlas en bucle sin costuras y a volumen bajo.

## Estructura y herramientas

### G27. Plantillas de piezas

Cargar un esqueleto de pieza ambiental (tonalidad, 3 capas, reverb y delay) desde el menu de ejemplos (L18) y modificarlo.
Reduce la barrera de entrada: se empieza oyendo algo bueno y se cambian cosas.

### G28. Reproduccion continua sin interaccion

Un modo "emisora" que reproduce indefinidamente una pieza, con nueva semilla si se reinicia, y pantalla minima.
Pensado para dejarla sonando horas, como hace generative.fm, sin recompilar ni tocar el codigo.

### G29. Exportar a audio

Grabar la salida (minutos u horas) a un archivo WAV u OGG, o renderizarla mas rapido que tiempo real.
Es la forma de conservar una buena pasada y compartirla (F27 y L22 estan relacionadas, pero guardan secuencias, no audio).

### G30. Visualizacion minimalista

Una vista suave (puntos que aparecen por cada nota, tamano segun la velocidad) sincronizada con el audio y que se pueda ocultar.
Acompana la escucha sin competir con ella, en la linea de las visuales de generative.fm.

## Ideas derivadas de otras piezas

Las propuestas mas cercanas a capacidades existentes son G31 (implementada), G32 (parcialmente implementada mediante `::walk(n)`) y G37 (probabilidad modulada, pendiente). G01 y G02 estan descartadas; se pueden usar listas explicitas de notas en combinacion con los operadores actuales.

### G31. Operadores de nota encadenables

**Implementado:** `::oct(p;octavas)`, `::late(p;max)`, `::chord(p)`, `::human(s)`, `::unique(s)`, `::walk(n)`, `::trans(n)` y `::detune(cents)`; ver `doc/language.md`.

En "Observable Streams" el flujo de notas pasa por una cadena de operadores: cambiar de octava con cierta probabilidad,
retrasar la nota, convertirla en acorde, limitar repeticiones, humanizar, limitar saltos, transponer y desafinar ligeramente cada nota.
En due.js estos operadores se encadenan con `::` y se aplican en el orden escrito; solo los que lo especifican usan probabilidad.

### G32. Melodias por pasos cortos

En "A Viable System" y "Timbral Oscillations" cada frase empieza en una nota al azar y cada nota siguiente esta como mucho a dos o tres grados de la escala;
la frase termina con probabilidad creciente (cada nota adicional tiene la mitad de posibilidades que la anterior, hasta tres notas).
En due.js, `::walk(n)` ya limita el salto en semitonos entre las notas candidatas de la lista, solo para notas sueltas. No limita la longitud de una frase
ni implementa su terminacion probabilistica; esas partes siguen pendientes.
Cada instrumento puede tener su propio ritmo: el piano cada 2 s, el violin cada 8 s y el contrabajo solo una nota.

### G33. Acorde repartido en el tiempo

En "Sevenths" las notas de un acorde no suenan a la vez: cada una arranca en un instante aleatorio dentro de una ventana (de 0,25 a 5 s).
Un modificador de dispersion (`::spread(0.25-5)`) convertiria cualquier acorde `|` en un arpegio irregular, sin escribirlo nota a nota.
Tambien se podria elegir la inversion al azar, que cambia el registro de cada acorde.

### G34. Aceleracion y deceleracion

En "Pinwheels" un acorde se toca nota a nota con un intervalo que se multiplica por 0,85-0,95 en cada paso (acelera) hasta un minimo,
despues por 1,05-1,15 (frena) hasta un maximo, y entonces nace otro acorde, o dos, con su propio ritmo.
Un modo `::accel(0.9,0.1b,2b)` (factor, minimo y maximo) crearia ese efecto de remolino sin escribir cada intervalo.

### G35. Progresiones en abanico

En "Trees" cada acorde se construye con indices de la escala simetricos alrededor de un centro: primero `[0]`, luego `[2,-2]`, despues `[4,-4,0]`.
Los acordes van abriendose alrededor de una nota, y la tonica y el punto de partida se eligen al azar.
Una generacion de acordes a partir de indices y una escala daria progresiones parecidas con solo declarar centro, anchura maxima y escala (G01, G02).

### G36. Frases base recortadas e invertidas

"Bhairav" parte de una frase fija (una raga con duraciones) de la que se extraen fragmentos de longitud aleatoria, que se repiten o se renuevan con probabilidad 0,5.
"Agua Ravine" guarda siete frases de acordes, elige una, la recorta a una longitud aleatoria y en el 25 % de los casos la toca al reves.
Un instrumento que acepte una frase base y genere variaciones (recorte, inversion, repeticion) es una forma de componer sin escribir cada variacion.

### G37. Probabilidad modulada y panoramica opuesta

En "Lemniscate" la probabilidad de que suene cada nota la controla un LFO de ocho minutos, y dos pianos con panoramica opuesta se reparten el protagonismo:
mientras uno sube, el otro baja. Un parametro `p(lfo(0,1;8m))` sobre la probabilidad (G08) y un `pan(...)` modulable (G15) darian este movimiento.

### G38. Probabilidad acentuada por pulso

En "Little Bells" cada pulso tiene una probabilidad base de 0,1, mas 0,1 si es impar y otro 0,1 si es el primero de cuatro.
El numero de notas por acorde tambien es aleatorio (de 0 a 4) y no se repiten dentro del mismo acorde.
Un modo `::accent(...)` que de mas probabilidad a ciertos pulsos daria un pulso implicito sin compas fijo.

### G39. Patron base con adornos probabilisticos

"No Refrain" toca un patron fijo de seis notas graves con tiempos ligeramente irregulares y le suma notas agudas con un 80 % de probabilidad.
La octava de las notas agudas cambia de vez en cuando (5 % y 10 %) y alguna nota aislada aparece mucho despues (10 %).
Distingue una capa estable de otra con adornos que varian, que en due.js serian dos pistas con probabilidades y octavas moduladas.

### G40. Transposicion de muestras y bordones

"Drones" lanza muestras largas transpuestas varias octavas hacia abajo cada 40-60 s, con un filtro automatico de frecuencia muy baja que abre y cierra el sonido.
"Bhairav" usa bordones de violonchelo reprogramados cada 5-15 s. Una transposicion por semitonos en la pista (ya mencionada en G24)
junto con el filtro de G23 permitiria hacer bordones a partir de cualquier muestra.

### G41. Tonalidad y registro al azar al arrancar

"Trees" elige tonica al azar cada vez que arranca; "Bhairav" elige entre dos octavas. La misma pieza suena distinta en cada ejecucion
sin dejar de sonar coherente (G01, G10). Una instruccion `key(?)` o `key(random)` lo haria explicito, y la semilla permitiria repetirlo.

### G42. Reverb prerenderizada

Muchas piezas aplican la reverb a las muestras antes de tocar y guardan el resultado, de modo que durante la reproduccion no se calcula ninguna convolucion.
Para due.js seria util en pistas con mucha reverb (20-30 s) y muchas notas simultaneas, donde la CPU limita el numero de pistas (G20, G21).

### G43. Varios delays en serie

"Apoapsis" encadena un delay corto (0,2 s) con otro de 20-30 s; "Observable Streams" usa tres (0,08 s, 0,5 s y 5 s) con realimentacion alta (0,7-0,75).
El corto da brillo, el medio da cuerpo y el largo hace de eco lejano. Haria falta poder encadenar varios `:d(...)`
con tiempos largos y realimentacion alta (G22).
