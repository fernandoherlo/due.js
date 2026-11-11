# Ideas de shorts de live coding (Strudel)

Ideas extraidas de siete shorts de YouTube vistos fotograma a fotograma (solo codigo y pantalla; el sonido no se ha escuchado):
Switch Angel, "Coding Trance Music: in the beginning" (136 bpm) y "Coding DRUM and BASS" (170 bpm), dos sesiones de DJ_Dave (#algorave) con trance y bajo/arpegio,
Oazoor, "Turning an Old Hit into Code", benjulian, "making music w/ code again!" y Colin McCarthy, "harder better faster stronger, one kick at a time" (Daft Punk como codigo).
Todos usan Strudel. Las ideas estan escritas sin probar; el ID es solo para referenciarlas (S01-S30). Las que ya tienen equivalente se enlazan con G, N, L y F.

## Lo que se ve en los videos

- **Trance (Switch Angel):** `n("<0 4 0 9 7>*16").scale("g:minor").trans(-12).o(3).s("sawtooth").acidenv(slider(0.546))`; una segunda capa grave
  `n("<0>*16").scale("g:minor").trans(-24).detune(rand).o(4).s("supersaw")`; un bombo `s("tbd:2!4").duck("3:4:5:6").duckdepth(.8).duckattack(.16)`
  y un `s("top:1/2").fit()`. `acidenv(x)` es una macro propia: `lpf(100).lpenv(x*9).lps(.2).lpd(.12)`, controlada con un deslizador.
- **Drum and bass (Switch Angel):** `s("bd:1").beat("0,7?,10",16).duck("3:4:5")`, `s("sd:2").beat("4,12",16)`, `s("hh:4!8")`, bajo `s("supersaw!8").note("<c# f d# [d# a#2]>/2").sub(12)`,
  filtro `rlpf(slider)` con `lpenv("2")` y una voz `s("jt:3").scrub(berlin.fast(2).seg(8)).rib(...)`. Cada capa va a su `orbit` para el ducking.
- **DJ_Dave:** variables con alternativas de ritmo y ganancia (`Structures`, `gainn`) elegidas con `pick(lista, gooo)` donde `gooo` es un interruptor 0/1;
  bajo en `supersaw` `.slow(8)`, arpegios de 16 pasos entre varias frases (`<0 1 2 3>`), bateria con muestras (`tech`, `KorgDDM110`, `RolandTR808`) y `punchcard` visual junto al código.- **Oazoor:** una pieza entera como variables (`var melody`, `chord`, `chordRythmic`, `bassDrum`) lanzadas con `$:melody`; interruptores `const PLAY_BASS = 1` usados como
  `.postgain(PLAY_BASS ? 0.2 : 0)`, un `GLOBAL_LPF = slider(8000,300,8000)` compartido, progresion `scale("<C:major!2 A:minor!2 F:major G:major C:major!2>")`
  y ocho frases en una lista elegidas con `pick(NOTE,"<0 1 2 3 4 5 6 7>")`; cada capa con su `.color(...)` y `_pianoroll()` o `_scope()`.
- **benjulian:** capas con nombre (`$BASS`, `$DRUMS`, `$MEL`, `$SYNTH`, `$SYNTH2`) y una `energy = slider(1.54,0,10)` que alimenta `lpenv(energy)`; notas con peso de duracion
  (`a3@4 c4@8`), `<[b5@2 b5 b5]*4 ...>`, `.pan(0.2)` y `.pan(0.8)` para las dos manos y los bancos `RolandTR909`/`RolandTR808`. Comenta (`//`) el bombo para hacer el break.
- **Colin McCarthy (Daft Punk):** `setcpm(124/4) // drop`, `kick: s("bd*4").bank("RolandTR909").duck("2:3").duckdepth(.9)`, `chords: chord("<C#m E F#m!2>").voicing().s("supersaw")`,
  `vox: s("vox").slice(16, "5 8 ~ ~ 9 ~ 4 ~").clip(1)` y un secuenciador de rejilla con `bd`, `cp`, `oh` y `vx`.
## Sonidos

### S01. Supersaw y dientes de sierra

`supersaw` (varias sierras desafinadas) y `sawtooth` son la base de todo el trance y el drum and bass de los videos.
Un instrumento `saw` y otro `supersaw` (Tone.FatOscillator con `count` y `spread`) cambiarian de golpe lo que suena en `n`.
Ejemplo: `n1([C2,E2,G2];1;1b)#supersaw` con un `::detune(c)` para los cents de desafinacion.

### S02. Detune aleatorio por nota

`detune(rand)` desafina cada nota un poco distinto, y da el sonido ancho de la capa grave. Un operador `::detune(cents)` por nota, con el valor al azar dentro de un rango.

### S03. Sub y octavas apiladas

`sub(12)` añade la misma nota una octava abajo; `.o(4)` fija la octava. Un `::sub(semitonos)` que sume otra voz grave, y una forma corta de fijar la octava (`::oct` ya cambia, pero no fija).

### S04. Voz cortada (chops)

`s("jt:3").scrub(berlin.fast(2).seg(8))` mueve el punto de lectura de una muestra con una senal, para trocear una voz. Un `::scrub(senal;trozos)` sobre `sam`, o `::slice(n)` para tocar fragmentos de una muestra.

### S05. Muestras de baterias clasicas

Bancos de máquina de ritmos (`RolandTR808`, `KorgDDM110`, `tech`, `tbd`) y repositorios de muestras como `algorave-dave/samples` y `dirt-samples`.
Anadir mas bancos a `Music/constants/samples.json` es la forma mas barata de sonar parecido; el compilador ya valida que el preset exista.

## Ritmo y estructura

### S06. Patrones por posiciones de pulso

`s("bd:1").beat("0,7?,10",16)` coloca golpes en los pasos 0, 7 (con probabilidad `?`) y 10 de 16, y `beat("4,12",16)` hace la caja.
Se escribe una vez cada capa de bateria sin repetir silencios. Una forma `beat(0,7?,10;16)` o un modo que acepte posiciones daria lo mismo con la sintaxis de due.js (ver G08 y N07).

### S07. Repeticiones con `!` y `*`

`hh:4!8`, `<...>*16` y `[d# a#2]` agrupan repeticiones y subdivisiones. En due.js ya hay `[a>b]`, rangos y `b`; falta un atajo para «repetir esto n veces dentro del paso».

### S08. Alternar frases por indice

`pick(Structures, gooo)` elige una de varias frases con un interruptor, y `<0 1 2 3>.slow(2)` las recorre. Es la base del cambio de energia: una variable con dos o tres versiones de un patron y un valor que dice cual suena.
Se relaciona con L05 (escenas), pero mas ligero: variables `$` con alternativas.

### S09. Ritmo del bajo en compases largos

`.slow(8)` y `/2` alargan una frase de 16 pasos a ocho compases. Poder expresar «esta frase dura 8 compases» sin recalcular intervalos (ver N08).

### S10. Acentos por patron de ganancia

`postgain(pick(gainn, gooo))` con listas tipo `{0.75 2.5}%4` da una dinamica distinta a cada golpe. Un operador `::accent(lista)` o una lista de volumenes que se recorre con la secuencia (ver G38).

## Efectos y sonido

### S11. Ducking (sidechain)

`.duck("3:4:5").duckdepth(.8).duckattack(.16)` baja el bajo y las capas cada vez que suena el bombo. Es lo que da el bombeo del trance y del drum and bass.
Un `::duck(pista;profundidad;ataque)` con una pista como disparador. Necesita que cada pista tenga su propia salida (orbit en Strudel).

### S12. Salidas por pista (orbits)

El ducking, la reverb y el delay se aplican por `orbit`. En due.js hace falta una forma de enviar varias pistas a un mismo bus para compartir efecto o ducking (ver `=>` en `doc/language.md`).

### S13. Macro de filtro estilo acid

`acidenv(x)` agrupa `lpf`, `lpenv`, `lps` y `lpd` en un solo numero, y con un deslizador se abre y cierra el sonido en vivo. Un efecto `:acid(x)` con un valor por defecto, y despues una forma de moverlo con el raton (S14).

### S14. Deslizadores en el codigo

`slider(0.55)` pinta un control al lado del numero. Las dos sesiones lo usan para el filtro y la ganancia. Es lo que mas aporta al directo (ver N01 y F26).

### S15. Reverb y estereo por golpe

`room(sine.range(0.1,0.4))` mueve la reverb con una onda y `.jux(rev)` pone el original a un lado y el invertido al otro. Variaciones de efecto por golpe que dan movimiento sin cambiar las notas (ver G37).

### S16. Curva de ganancia

`setGainCurve(x => Math.pow(x,2))` hace que el control de volumen suene mas natural. Aplicar una curva cuadratica al volumen global ayuda a que las capas se mezclen con mas facilidad.

## Escritura y visualizacion

### S17. Notas por grado de escala

`n("<0 4 0 9 7>*16").scale("g:minor")` escribe grados en vez de nombres. Es lo que hace comodo cambiar de tonalidad. Descartado en G01/G02 por cambiar demasiado la sintaxis; reabrir solo si el uso lo pide.

### S18. Transposicion global

`.trans(-12)` y `.trans(-24)` ya existen en due.js como `::trans(n)`. Falta una variable compartida (`$key`) que sume a todas las pistas.

### S19. Visualizacion embebida

`_pianoroll()`, `_punchcard()` y `_scope()` muestran el patron o la forma de onda justo debajo del codigo. Las capas de los videos se entienden de un vistazo (ver F27).

### S20. Comentarios y estructura de la pieza

Los videos construyen en orden: bateria, bajo, arpegio y voz, cada capa con su linea. Una convencion de pistas con nombre (`$drums:`, `$bass:`, `$vox:`) que se pueda silenciar o aislar por nombre (ver L05 y F06).

## Estructura y directo (shorts de Oazoor, benjulian y Colin McCarthy)

### S21. Interruptores de capa

`const PLAY_BASS = 1` con `.postgain(PLAY_BASS ? 0.2 : 0)` apaga o enciende una capa cambiando un solo numero. Un `::mute` o una variable `$bass=0` que silencie la pista sin borrarla (ver L05 y F06).
Benjulian tambien la silencia comentando la linea; ese gesto ya funciona en due.js con `//`.

### S22. Un mando de energia

`energy = slider(1.54,0,10)` alimenta `lpenv(energy)` y mueve el caracter de varias pistas a la vez. Una variable global que se pueda usar como argumento (`:lpf(100;$energy)`) y se mueva en vivo (S14).

### S23. Progresion por escala y ciclo

`scale("<C:major!2 A:minor!2 F:major G:major C:major!2>")` cambia de acorde cada ciclo y las notas se ajustan solas. Parecido a G03/G04, con una lista de acordes que avanza por compas sin tocar el patron de notas.

### S24. Banco de frases

`pick(NOTE,"<0 1 2 3 4 5 6 7>")` toca una de ocho frases por ciclo. Una variable `$frases` con varias secuencias y un indice de recorrido (`[a>b>c]` ya recorre notas; falta recorrer frases enteras). Ver G36.

### S25. Peso de duracion dentro de la secuencia

`a3@4 c4@8` y `[b5@2 b5 b5]*4` reparten la duracion entre las notas de la misma frase. En due.js la duracion es del paso; un `@n` por nota daria ritmos melodicos sin escribir un paso por cada una.

### S26. Dos manos con panoramica opuesta

La misma frase en dos voces con `.pan(0.2)` y `.pan(0.8)` da amplitud estereo con muy poco codigo. Un `:pan(x)` por pista ya es G15; la idea nueva es una frase de dos notas en paralelo.

### S27. Caida y regreso (drop)

Quitar el bombo y bajar la energia (`//s("bd")...`, `setcpm(124/4) // drop`) y volver con todo es el gesto de estructura de cada directo. Escenas con entrada en el siguiente compas (L05) lo harian sin editar el codigo.

### S28. Acordes por nombre con voicing

`chord("<C#m E F#m!2>").voicing()` convierte nombres de acorde en notas colocadas con un registro estable. Es la forma concreta de G03: `Cm`, `E`, `F#m` como valores y una colocacion automatica.

### S29. Rebanar una muestra

`s("vox").slice(16, "5 8 ~ ~ 9 ~ 4 ~")` parte una muestra en 16 trozos y toca los que indica la secuencia, con silencios `~`. Es la forma concreta de S04: `sam1#vox::slice(16)` con una lista de indices.

### S30. Visualizacion por capa

Cada capa muestra su rollo de piano o su onda (`_pianoroll()`, `_scope()`) con su color, el codigo resalta la nota que suena y el secuenciador de rejilla (`bd`, `cp`, `oh`, `vx`) muestra la bateria de un vistazo. Une S19 con F27.

## Orden sugerido

1. S01-S02 (supersaw y detune): es lo que mas cambia lo que suena.
2. S13 con S14 y S22 (acid, deslizadores y energia): el gesto principal del directo.
3. S11 con S12 (ducking y salidas por pista).
4. S06 (patrones por posiciones de pulso).
5. S08, S10 y S21 (alternativas por indice, acentos y interruptores de capa).
6. S28, S29 y S25 (acordes por nombre, rebanado de muestras y duracion por nota).
