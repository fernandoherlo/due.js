# Lenguaje de due.js

Este documento describe el DSL de due.js contrastándolo con el código actual. Distingue la sintaxis observable de los comportamientos que parecen errores o funciones incompletas; estos últimos no deben tomarse como decisiones de diseño confirmadas.

## Forma de una instrucción

Una línea define un instrumento y, opcionalmente, una o más acciones:

```text
instrumentoN[#modificador](valor;duracion;intervalo):accion(valor)
```

- `instrumento` es un comando como `sam` o `n`; `N` es el índice numérico de la instancia o del dispositivo MIDI. El intérprete actual requiere ese índice para agrupar un comando principal.
- `[#modificador]` es opcional y depende del comando: selecciona un sonido en `sam` y un canal MIDI en `mo`.
- Los argumentos entre paréntesis se separan con `;`.
- Las acciones sin índice se añaden al comando con índice de su misma línea. Una acción en una línea independiente no tiene instrumento asociado y se rechaza.

Ejemplo:

```text
sam1#piano([C4,E4,G4];0.25;1):v(90):r(20)
```

Define un sampler con el preset `piano`, elige notas al azar de la lista y le añade volumen y reverb.

## Modos de reproduccion

`::` configura como se reproduce la fuente; `:` sigue reservada a los efectos de audio.
El modo `::reverse` de `sam` decide si cada paso reproduce la muestra hacia delante o hacia atras:

```text
sam1#piano(C4;4;6)::reverse(127):v(48)
```

El sampler conserva `nota;duracion;intervalo`, en este ejemplo `C4`, 4 segundos y 6 segundos.
`reverse` recibe un unico numero obligatorio entre `0` y `127`, incluidos decimales:

- `0`: siempre hacia delante.
- `127`: siempre hacia atras.
- Valores intermedios: probabilidad de invertir igual a `valor / 127`; `64` es aproximadamente un 50 %.

La direccion se elige una vez por paso y se mantiene hasta terminar la nota.
Todas las notas de un acorde comparten la decision. No se altera el volumen ni se compensa la ganancia;
los efectos `:v(...)`, `:r(...)` y los demas siguen funcionando igual.

Se invierte el fragmento inicial que corresponde a la duracion de la nota, no toda la cola del archivo.
Asi el ataque invertido llega al final de la nota incluso en muestras de piano con colas largas.
La longitud del fragmento se ajusta a la transposicion para conservar la duracion y la afinacion.
Si la muestra es mas corta que la nota, se invierte solo su longitud disponible, sin estirarla ni repetirla.
Los fragmentos se preparan en cada disparo, sin modificar los datos originales ni normalizar el volumen.

Solo se permite un modo por sampler. La probabilidad debe ser un numero escalar, no una lista ni un rango;
las notas del sampler siguen admitiendo patrones y acordes. `:reverse(...)` no es un efecto valido.
No se admite `::reverse()` sin valor, varios argumentos ni su uso en otros instrumentos.
Los bancos de muestras, la eleccion de la muestra mas cercana y la transposicion son los mismos que sin modo.

Cambiar la probabilidad o retirar el modo reconstruye la fuente, sin transicion continua.
El prototipo `::grain` se ha retirado y ya no se admite.

## Operadores de nota

Tambien con `::`, pero en `n` y `sam`, transforman cada nota antes de tocarla. Se pueden encadenar y el orden importa:

```text
n1([C3,E3,G3,B3];0.8;1b)::oct(0.3;1)::late(0.4;0.3)
sam1#piano([C4,E4,G4];1b;2b)::chord(0.25)::human(0.04)
```

| Operador | Efecto |
| --- | --- |
| `::oct(p;octavas)` | Con probabilidad `p` (0 a 1) desplaza las notas `octavas` octavas (entero, por defecto 1, puede ser negativo) |
| `::late(p;max)` | Con probabilidad `p` retrasa la nota hasta `max` segundos (por defecto 0,5) |
| `::chord(p)` | Con probabilidad `p` anade una quinta y una octava sobre cada nota |
| `::human(s)` | Siempre retrasa la nota hasta `s` segundos (por defecto 0,03) y varia su duracion un 10 % |

Los operadores se validan al compilar y se actualizan en vivo. Limites conocidos: en `n` (sintetizador monofonico) `chord` no es util
y `late` debe ser menor que el intervalo. Las notas se transponen solo si son nombres (`C4`, `F#3`); un numero MIDI se deja igual.
Ejemplos en `doc/examples/operators.duejs`.

## Valores y patrones

Los tres argumentos principales representan:

```text
valor;duracion;intervalo
```

La duración se pasa al disparo de la nota y el intervalo establece cada cuánto se repite el patrón. Los valores numéricos se interpretan como segundos en el ciclo de reproducción.

Para el primer argumento, las listas usan estos separadores:

```text
[C4,E4,G4]
[C4>E4>G4]
[C4|E4|G4]
```

La coma elige un valor al azar en cada repetición; `>` recorre los valores en orden y vuelve al inicio; `|` toca las notas como acorde.

Las opciones pueden ser acordes: `[A2|C2|B2,D2|A2|G2]` elige al azar entre dos acordes y `[A2|C2|B2>D2|A2|G2]` los recorre en orden. Los corchetes rodean el patrón completo.

Los campos de duración e intervalo también admiten listas o rangos:

```text
sam1#piano([C4>E4>G4];[1-3];[2-4])
```

Los rangos se eligen con distribución uniforme continua desde el mínimo (incluido) hasta el máximo (excluido), por lo que admiten decimales y extremos iguales a `0`. Los campos se interpretan como segundos al programar el patrón. Los valores omitidos de duración e intervalo usan `0.25` y `2` cuando el comando lleva índice numérico. La duración debe ser un número mayor o igual que `0`; el intervalo debe ser mayor que `0`. En un rango de intervalo, el mínimo puede ser `0` pero el máximo debe ser mayor que `0`. Los valores fuera de estos límites o no numéricos se rechazan antes de modificar el audio.

## Tempo y pulsos

`bpm(N)` fija el tempo de la sesión, entre `20` y `300`; sin esa línea es `120`.
Debe ir sola en su línea, una sola vez, con un número literal (no admite variables) y puede escribirse antes o después de los instrumentos.

La duración y el intervalo admiten el sufijo `b` para expresar pulsos; sin sufijo son segundos y no dependen del tempo:

```text
bpm(90)
sam1#piano(C4;1b;4b)
sam2#tom(C2;0.5b;[1b-2b])
sam3#harp(C4;1;2)
```

El compilador convierte los pulsos a segundos (`b × 60 / bpm`) al compilar, también en listas, rangos y variables (`$beat=1b`).
Al cambiar `bpm` solo se reprograman los instrumentos que usan pulsos. Aún no hay compases ni subdivisiones.

## Variables

Las variables normales comienzan con `$` y se pueden reutilizar en argumentos posteriores:

```text
$volumen=90
sam1#piano([C4>E4>G4];0.25;1):v($volumen)
```

Las asignaciones se procesan en orden, así que define una variable antes de usarla; usar una variable sin definir es un error con línea y columna. La sustitución es textual y reemplaza todas las apariciones: no hay operaciones aritméticas ni evaluación de expresiones. Las variables normales se reinician al compilar de nuevo.

Las variables que comienzan con `$$` reciben valores de entrada MIDI. Por ejemplo:

```text
$$control=mi0(1@5)
sam1#piano(C4;0.25;1):v($$control)
```

`mi0` selecciona la entrada MIDI de índice `0`; `1` indica el canal y `5`, el número de controlador MIDI CC. La implementación actual acepta únicamente mensajes CC del canal seleccionado y, si se indicó, del controlador `5`. El valor recibido puede controlar un efecto que use esa variable.

Una entrada MIDI ausente no bloquea la compilación: se registra un aviso, la variable queda inactiva
y los demás instrumentos continúan. Un canal no disponible en una entrada presente sigue siendo un error.
No hay reconexión automática si el dispositivo se conecta después.

Si el navegador no soporta Web MIDI o deniega el permiso, el editor, la compilacion y el audio
siguen disponibles. La barra muestra `MIDI off`, con el motivo al pasar el puntero y en su nombre accesible;
tambien se registra el error original en el logger. Esto no habilita dispositivos MIDI ni oculta errores de audio.

## Comandos conectados actualmente

| Comando | Uso actual |
| --- | --- |
| `samN#preset(...)` | Sampler con un preset de la biblioteca de muestras, como `piano`, `tom` o `harp`. |
| `nN(...)` | Sintetizador Tone.js. |
| `moN#canal(...)` | Salida MIDI: `N` selecciona la salida y el modificador, el canal. |
| `misamN#preset(canal)` | Sampler disparado por notas recibidas desde una entrada MIDI. |
| `aiN#preset(...)` | Genera una secuencia melódica con MusicVAE y la reproduce con el preset indicado. |
| `v(valor)` | Efecto de volumen. |
| `r(valor)` | Efecto de reverb. |
| `d(retardo;feedback)` | Efecto de delay; el segundo argumento configura feedback. |
| `cho(valor)` | Efecto chorus. |

Las siguientes escalas describen lo que hace el runtime actual, no necesariamente la escala que debería formar parte de la especificación. Por ejemplo, `v(90)` no significa 90 dB:

| Efecto | Escala aplicada |
| --- | --- |
| `v(valor)` | Cualquier número; `0-127` se mapea linealmente a `-30..30` dB. |
| `r(valor)` | `0-127` se mapea a `0..20` segundos de decay. |
| `d(retardo;feedback)` | El retardo `0-127` se mapea a `0..3` segundos; el feedback va de `0` a `1` y, si falta, usa `0.5`. Un `0` explícito se conserva. |
| `cho(valor)` | `0-127` se mapea a `0..30` Hz. |

Los valores de `r`, `d` y `cho` fuera de `0-127`, o de feedback fuera de `0-1`, se rechazan antes de modificar el audio. Un preset de `sam` desconocido también se rechaza.

En una cadena de efectos, el primer efecto escrito queda más cerca de la salida de audio. Para MIDI en vivo, el enlace `$$variable=miN(...)` crea la escucha de entrada.

## Comportamiento observado

- El parser ignora comentarios y espacios al interpretar instrucciones y conserva las líneas vacías para ubicar los errores.
- Las listas deben estar encerradas en corchetes y los argumentos separados por `;`. El parser rechaza estructuras como `A2>C2]` o `[1-3][2-4]` antes de modificar el audio.
- El editor valida la estructura al escribir: subraya el primer error, marca su línea y muestra un mensaje con línea y columna. La barra se pone roja y el aviso se limpia al corregir el código. Esto no sustituye la validación semántica de presets, variables y valores.
- Los valores explícitos `0` de duración y de feedback se conservan; el intervalo `0` se rechaza.
- El tempo se configura con `bpm(N)` (ver Tempo y pulsos); no se usa el tempo del transporte de Tone.js.
- El compilador prepara un plan y solo actualiza su snapshot y variables tras aplicar las operaciones de audio. Esto mantiene coherente el estado lógico, pero no revierte efectos de audio/MIDI si una operación falla a mitad.

## Posibles bugs e incompletitudes

- **Sintaxis incompleta:** el parser reconoce `=>`, pero no hay ejecutor para el comando `con`; el preflight lo rechaza antes de modificar el audio.
- **Función incompleta:** nombres como `p`, `seq`, `s`, `c` y `e` están declarados, pero no conectados al motor; el preflight los rechaza. `miN(...)` se usa para declarar una entrada asociada a una variable `$$`, no como instrumento independiente.
- El comentario de `sample1.duejs` describe `mi0(1@5)` como una nota. El código lo interpreta como número de controlador CC; no está claro si el comentario o la implementación refleja la intención.

## Ejemplo completo

```text
$bajo=24
$alto=96

sam3#tom([A2>C2>B2>D3];[1-3];[2-4]):r(64):d(64;0.3):v($bajo)
sam5#harp([G4,E4,C4,A3];0.25;1):v($alto)
```

Al compilar, due.js compara las instrucciones nuevas con las anteriores y añade, actualiza o elimina los instrumentos correspondientes.

## Flujo interno

`Parser → Analyzer → Compiler`: el parser convierte el texto en un AST; el analizador resuelve variables, convierte los valores y asocia las acciones al instrumento de su línea; el compilador prepara el diff y confirma el estado con `commit` tras aplicar el plan. Los tres servicios son clases. Parser y Analyzer no conservan estado del programa entre llamadas; no hay etapas separadas de Lexer o Interpreter.