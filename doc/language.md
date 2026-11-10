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

Los campos de duración e intervalo también admiten listas o rangos:

```text
sam1#piano([C4>E4>G4];[1-3];[2-4])
```

Los rangos se eligen con distribución uniforme continua desde el mínimo (incluido) hasta el máximo (excluido), por lo que admiten decimales y extremos iguales a `0`. Los campos se interpretan como segundos al programar el patrón. Los valores omitidos de duración e intervalo usan `0.25` y `2` cuando el comando lleva índice numérico. Un rango de intervalo que incluya `0` puede producir un intervalo que Tone.js no acepte; falta fijar si debe rechazarse o limitarse.

## Variables

Las variables normales comienzan con `$` y se pueden reutilizar en argumentos posteriores:

```text
$volumen=90
sam1#piano([C4>E4>G4];0.25;1):v($volumen)
```

Las asignaciones se procesan en orden, así que define una variable antes de usarla. La sustitución es textual: no hay operaciones aritméticas ni evaluación de expresiones. Las variables normales se reinician al compilar de nuevo.

Las variables que comienzan con `$$` reciben valores de entrada MIDI. Por ejemplo:

```text
$$control=mi0(1@5)
sam1#piano(C4;0.25;1):v($$control)
```

`mi0` selecciona la entrada MIDI de índice `0`; `1` indica el canal y `5`, el número de controlador MIDI CC. La implementación actual acepta únicamente mensajes CC del canal seleccionado y, si se indicó, del controlador `5`. El valor recibido puede controlar un efecto que use esa variable.

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
| `v(valor)` | `0-127` se mapea linealmente a `-30..30` dB. |
| `r(valor)` | `0-127` se mapea a `0..20` segundos de decay. |
| `d(retardo;feedback)` | El retardo se mapea de `0-127` a `0..3` segundos; feedback se pasa como número y, si falta, usa `0.5`. |
| `cho(valor)` | `0-127` se mapea a `0..30` Hz. |

En una cadena de efectos, el primer efecto escrito queda más cerca de la salida de audio. Para MIDI en vivo, el enlace `$$variable=miN(...)` crea la escucha de entrada.

## Comportamiento observado

- Las líneas vacías y los comentarios, incluidos los comentarios al final de una instrucción, se eliminan antes de analizar cada línea. El lexer también elimina whitespace en cada línea.
- Los valores explícitos `0` de duración e intervalo se conservan al crear una nota. La validez de un intervalo cero para Tone.js no está garantizada.
- El tempo no se configura desde el DSL; el transporte de Tone.js se inicia actualmente a `120` BPM. Esto puede ser una limitación deliberada, no necesariamente un bug.
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