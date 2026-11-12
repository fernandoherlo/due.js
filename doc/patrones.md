# Patrones musicales: estado y propuestas

Este documento reune lo que el repo ya permite hacer con patrones, las ideas de patrones repartidas por los catalogos actuales y 20 propuestas adicionales. Las propuestas no son compromisos ni fijan sintaxis. La referencia de comportamiento implementado sigue siendo [language.md](language.md); el catalogo general de producto sigue siendo [features.md](features.md).

## Que significa patron

En una instruccion como `n1(patron;duracion;intervalo)`, el primer argumento es el patron: el material que se repite o cambia en cada paso. Un paso puede contener una nota, un acorde o, en `n` y `sam`, un silencio. La duracion define cuanto dura una nota; el intervalo define el tiempo hasta el siguiente paso. Un patron avanza tambien cuando el paso es un silencio.

Los patrones explicitos los reproducen `n`, `sam` y `mo`. `ai` genera una secuencia por su cuenta y `misam` responde a notas MIDI recibidas, asi que no usan el primer argumento como patron escrito de notas. Las capacidades no son identicas en todos los instrumentos: por ejemplo, `~` y los operadores de nota solo estan disponibles en `n` y `sam`.

## Capacidades actuales

| Forma | Comportamiento |
| --- | --- |
| `C4` | Repite el mismo valor en cada paso. |
| `[C4,E4,G4]` | Elige una opcion al azar en cada paso. La eleccion no tiene semilla configurable. |
| `[C4^4,E4^2,G4]` | Elige al azar con pesos relativos `4:2:1`; el peso omitido vale `1`. |
| `[C4>E4>G4]` | Recorre las opciones en orden y vuelve al inicio. |
| `[C4|E4|G4]` | Dispara las notas como un acorde. `n` es monofonico; `sam` es polifonico. |
| `[A2|C2|B2,D2|A2|G2]` | Elige al azar entre dos acordes. Tambien se pueden recorrer acordes con `>`. |
| `[C4>~>E4]` | En `n` y `sam`, `~` ocupa un paso sin disparar ni cortar notas que ya suenan. |

Las elecciones aleatorias y las secuencias aceptan acordes como elementos. Las colecciones no se anidan ni mezclan `,` y `>` en el mismo nivel. `~` no se admite dentro de un acorde, en `mo`, ni como duracion o intervalo. La prolongacion de una nota es una propuesta aparte, F52.

`^peso` es una extension de las listas aleatorias: modifica la probabilidad relativa de escoger cada opcion, no la probabilidad de que un evento suene. Se admiten pesos decimales no negativos; el valor omitido es `1`, `0` excluye la opcion y la suma debe ser positiva. Puede aplicarse a una opcion que sea un acorde entero. Los operadores `::` se aplican despues y pueden transformar la opcion elegida. No se admite en secuencias `>` ni en los campos de duracion o intervalo. Esta capacidad esta implementada; F11 sigue pendiente porque propone descartar un paso con cierta probabilidad.

Los patrones se pueden guardar en variables `$` y reutilizar despues de definirlas. La sustitucion es textual, no una funcion ni una expresion parametrizada. Los operadores `::oct`, `::late`, `::chord`, `::human`, `::unique`, `::walk` y `::trans` se encadenan despues del patron en `n` y `sam`; su orden importa. `::walk` usa como candidatas las notas sencillas del patron, no acordes ni silencios. `::reverse(...)` es un modo de reproduccion de `sam`, no un operador del patron.

La duracion y el intervalo pueden ser numeros, elecciones aleatorias con coma o rangos `[min-max]`. Sin sufijo se expresan en segundos; `bpm(N)` y el sufijo `b` permiten expresarlos en pulsos. Sin valores explicitos se usan 0.25 segundos de duracion y 2 segundos de intervalo. La duracion puede ser 0; el intervalo debe ser mayor que 0. Ver [language.md](language.md#patron-duracion-e-intervalo) para unidades, limites y ejemplos completos.

## Ideas ya documentadas

### Composicion del patron

- **F07, silencios:** implementada parcialmente como `~` en `n` y `sam`; falta decidir si se amplia a otros generadores.
- **F52, prolongaciones:** mantener una nota a traves de pasos sin volver a disparar el ataque. Pendiente; definir su relacion con acordes, silencios y samplers.
- **F08-F10:** ritmos euclidianos con rotacion; repeticion y subdivision de frases; polirritmos y polimetrias.
- **F11-F13:** probabilidad por evento; azar reproducible mediante semilla; variaciones periodicas de un patron.
- **F14-F16:** transposicion global (parcialmente cubierta por `::trans(n)` en `n` y `sam`); transformaciones de secuencia como invertir o rotar; escalas y grados.
- **F17-F20:** acordes por nombre y progresiones; dinamica por paso; articulacion relativa al intervalo; swing y humanizacion.
- **S24, G36:** bancos de frases y fragmentos que se eligen, recortan, invierten o repiten.
- **S25, F19:** duracion por nota y articulacion, separadas del intervalo general del paso.
- **S28, G03, G33, G35:** nombres de acordes, inversiones y voicings; dispersion de acordes en el tiempo; progresiones generadas alrededor de un centro.
- **S29, F22, G25:** cortar y reproducir fragmentos de una muestra como elementos de un patron.

### Generacion y variacion

- **G01-G06:** escala y tonalidad global, grados, progresiones, modulacion lenta, pedales y limites de registro por pista.
- **G07-G10, G13-G14:** longitudes distintas entre pistas, probabilidad por evento, distribuciones de intervalo mas alla del rango uniforme actual, semillas, cadenas de Markov y piezas de larga duracion.
- **G11:** `::human(s)` ya desplaza el evento y varia su duracion, pero no varia la velocidad MIDI como propone la idea.
- **G12:** `::unique(s)` elimina notas repetidas dentro de una ventana temporal; falta una opcion especifica de no repetir solo la eleccion inmediatamente anterior.
- **G19, G32, G34, G37-G41:** cambios por pasada, melodias de pasos cortos, aceleracion/deceleracion, probabilidad modulada, acentos por pulso, adornos probabilisticos, drones transpuestos y tono o registro aleatorio.
- **N07-N10:** secuencias de distinta longitud, divisores y multiplicadores de reloj, corrimiento de pasos y capas con reglas distintas.
- **S06-S10:** golpes por posiciones de pulso, atajos de repeticion, alternancia de frases, frases que abarcan varios compases y patrones de acentos.
- **S17-S18, S23:** grados de escala, transposicion global y progresiones que cambian por ciclo.

### Interpretacion y herramientas

- **F01/F31, N06, N08 y L06-L07:** tiempo musical, tempo, reloj compartido, divisores, tap tempo, rampas, metronomo y pulso visual. `bpm(N)` y `b` existen; compases y control de tempo en vivo siguen pendientes.
- **F02-F04, L01-L02, L04-L05 y L11:** cambios cuantizados, ejecucion parcial, mute/solo, grupos, lista de pistas, escenas y compilacion automatica. L01, L02 y L11 estan implementadas; escenas y otros controles siguen siendo propuestas.
- **F26-F27, L03, L13-L16 y S19/S30:** inspeccionar valores, visualizar eventos y actividad, vista previa, plegado y controles junto al codigo.
- **S08, S20-S21, S24 y S27:** cambiar entre frases, organizar pistas con nombres, interruptores de capa, bancos de frases y transiciones tipo drop.
- **F32, F33, F44, N03 y S11-S12:** conexiones de pistas, control o reconexion MIDI, respuestas entre instrumentos y buses compartidos. Son mecanismos relacionados con la ejecucion del patron, no formas actuales de escribir sus pasos.

## Estado y solapamientos

- G31 esta implementada: sus siete operadores son parte del lenguaje actual. G32 esta implementada parcialmente con `::walk(n)`; no genera frases de longitud aleatoria ni su terminacion probabilistica.
- F14 y S18 se solapan en la transposicion global. `::trans(n)` transpone notas de `n` y `sam`, pero no define una tonalidad global ni una transposicion compartida entre pistas.
- F11 y G08 describen probabilidad por evento; F12 y G10 describen semilla; F17, G03 y S28 describen acordes por nombre/progresion. Conviene tratarlos como grupos relacionados al priorizar, no como entregas independientes.
- G01/G02 se consideran descartadas en `AGENTS.md`, y S17 remite a esa decision, aunque F16 sigue en el catalogo como propuesta. Resolver esa diferencia antes de retomarlas.
- N07 podria funcionar ya porque cada pista mantiene su propio bucle, pero `norns.md` deja pendiente comprobar alineacion inicial. Verificarlo antes de disenar otra forma de longitudes distintas.
- Las ideas de efectos, instrumentos, microfonos, visuales y grabacion se mantienen en sus catalogos originales cuando no cambian la estructura o ejecucion de los pasos.

## 20 ideas nuevas

Las siguientes 20 propuestas se idearon como exploracion, no como una ampliacion aprobada del catalogo F. La primera ya se implemento como `^peso`; las otras 19 siguen siendo ideas.

### Creacion y generacion

1. **Elecciones ponderadas (implementada):** asignar pesos distintos a las opciones de una lista; distinto de decidir si un evento suena o no. Ver [language.md](language.md#contenido-del-patron).
2. **Bolsa aleatoria sin reemplazo:** barajar las opciones y consumir cada una una vez antes de volver a barajar; da mas control que evitar solo la repeticion inmediata.
3. **Morph entre patrones:** pasar gradualmente de un patron origen a otro durante un numero configurable de ciclos, preservando el pulso; distinto de alternar escenas o reemplazar una frase al final del ciclo.
4. **Generacion con restricciones duras:** producir una frase que cumpla condiciones obligatorias de rango, cantidad de notas o notas inicial/final; si no hay solucion valida, informar el error en vez de relajar reglas sin aviso.
5. **Conduccion de voces automatica:** elegir inversiones de acordes para minimizar el movimiento entre voces, sin cambiar la progresion escrita.
6. **Motivos con parametros:** definir una frase reutilizable que reciba valores como nota inicial, transposicion o duracion y que no altere otras variables globales.
7. **Subpatrones con fase propia:** componer una frase desde bloques reutilizables que mantengan su propio cursor y puedan repetirse sin expandirlos en el texto.
8. **Semillas independientes por patron:** aislar el flujo aleatorio de cada pista para que editar una no cambie las decisiones de las demas.
9. **Elecciones aleatorias correlacionadas:** permitir que dos pistas compartan una misma decision aleatoria cuando deben escoger variantes relacionadas.

### Interpretacion y control

10. **Edicion que conserva la fase:** al cambiar notas de un patron activo, mantener su posicion actual en vez de reiniciarlo desde el primer paso.
11. **Cambio de frase al final del ciclo:** preparar una frase nueva y sustituir la actual en su propio limite de ciclo, no solo en el siguiente pulso o compas global (extension de los cambios cuantizados F02).
12. **Adorno de una sola pasada:** disparar un fill o variacion una vez mediante un control MIDI o una accion del editor, y despues volver al patron base.
13. **Preescucha aislada de patron:** escuchar una frase con su instrumento y efectos sin reemplazar ni interrumpir la interpretacion activa; complementa la preescucha de muestras F23.
14. **Avance manual de pasos:** pausar el reloj de una pista y avanzar evento por evento para revisar un patron, manteniendo las otras pistas sonando.

### Inspeccion e intercambio

15. **Prevision determinista de los proximos pasos:** mostrar las proximas N notas ya resueltas, incluidos operadores y una semilla fijada, antes de reproducirlas; amplia la visualizacion F27 con resultados reproducibles.
16. **Traza de decisiones por evento:** inspeccionar por que se eligio una opcion, que operador la cambio y si un silencio o probabilidad omitio el disparo.
17. **Comparacion de patrones:** presentar solo las diferencias de notas, silencios, duraciones y pasos entre la version activa y la que se va a compilar; complementa el historial de versiones F28.
18. **Captura MIDI a patron:** grabar notas tocadas desde un teclado MIDI, cuantizarlas opcionalmente y convertirlas en texto DSL editable, sin convertir la entrada MIDI en una dependencia para reproducir el patron.
19. **Exportacion de eventos a MIDI:** convertir el patron ya expandido a un archivo MIDI, conservando tempo, duraciones, silencios y cambios de instrumento cuando sea posible.
20. **Diagnostico estructural de patrones:** avisar de patrones totalmente silenciosos, opciones inalcanzables, duplicados accidentales o rangos que exceden el registro indicado para una pista.