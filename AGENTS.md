# AGENTS.md

Contexto para asistentes de IA. Leer antes de tocar el repo. Detalle del lenguaje en `doc/language.md`; ideas y pendientes en `doc/`.

## Que es due.js

Lenguaje propio de live coding musical que corre en el navegador: Vite + TypeScript + Tone.js + CodeMirror 6 + WebMIDI. El DSL se mantiene propio, no se sustituye por JavaScript.

## Comandos

- `npm run dev`: servidor de desarrollo.
- `npm run lint`: eslint + `tsc` (debe pasar siempre antes de un commit).
- `npx vitest run`: tests (incluye compilar todos los `doc/examples/*.duejs`).
- `npm run samples`: script `samples.js` de la raiz.
- En esta maquina `grep -r` sobre carpetas grandes puede tardar minutos; usar las busquedas del editor.

## Preferencias del usuario

- Escribe en espanol; respuestas breves e impersonales, sin emojis.
- No crear documentos markdown sin pedirlo; los ejemplos largos van a `doc/examples/*.duejs`.
- Los commits son locales; nunca hacer push. Mensajes en ingles (`feat:`, `docs:`...).
- Docs en espanol sin acentos ni enes en los `.md` nuevos de `doc/`.
- Estilo de codigo: una clase por servicio que implementa una interfaz; tipos en `types/`, constantes en `constants/`, utilidades en `helpers/`.

## Sintaxis del DSL

`nombre+elemento#modificador(valor;duracion;intervalo):efecto(v)::modo(args)`

- `:` efectos (`v`, `r`, `d`, `cho`); `::` modos y operadores de nota; `=>` conexiones (sin ejecutor aun); `$var` variables; `$$var=mi0(1@5)` entrada MIDI.
- Listas: `[a,b]` azar, `[a>b]` secuencia, `[a|b]` acorde; rangos `[a-b]` (duracion e intervalo); sufijo `b` para pulsos; `bpm(N)` solo en su linea.
- En listas aleatorias, `^peso` asigna probabilidad relativa a una opcion (peso por defecto `1`; solo listas con coma, no secuencias `>`).
- `~` es un silencio de un paso en el primer argumento de `n` y `sam`; no se admite en acordes, duraciones ni intervalos.
- Instrumentos: `samN#preset` (Tone.Sampler, polifonico), `nN` (Tone.Synth, monofonico; `nN#supersaw` selecciona cinco sierras), `moN`, `misamN`, `aiN`.
- Presets de `sam` en `Music/constants/samplers.ts` (`piano`, `kick`, `hats`, `snare`, `harp`, `chorus`...) y datos en `Music/constants/samples.json`.
- `v(0..127)` va de -30 a +30 dB (64 aprox. unidad; `v(90)` puede saturar). `r` de 0 a 20 s, `cho` de 0 a 30 Hz.

## Operadores de nota (G31)

Encadenables y aplicados en el orden escrito. Todos funcionan en `n` y `sam`, salvo `::detune`, que solo funciona en `n`.

| Operador | Efecto |
| --- | --- |
| `::oct(p;octavas)` | Con probabilidad `p` desplaza octavas (entero, puede ser negativo) |
| `::late(p;max)` | Con probabilidad `p` retrasa la nota hasta `max` s |
| `::chord(p)` | Con probabilidad `p` anade +7 y +12 semitonos |
| `::human(s)` | Retraso hasta `s` s y duracion +-10 % |
| `::unique(s)` | Quita notas que sonaron en los ultimos `s` s; si no queda ninguna, silencio |
| `::walk(n)` | Limita el salto a `n` semitonos respecto a la nota anterior, usando la lista de candidatas (`pool`); solo notas sueltas |
| `::trans(n)` | Transpone `n` semitonos |
| `::detune(cents)` | En `n`, aplica una variacion aleatoria uniforme de `-cents` a `+cents`, con limite de 100 cents |

Poner `::walk` antes de `::trans` (walk mira la lista sin transponer). Argumentos validados al compilar.

## Arquitectura (`src/packages`)

- `App`: servicios de aplicacion (`App`, `Debugger`, `Error/handler`, `Logger`, `Store`, `Ui`).
- `Compiler`: el servicio coordina `Parser` y `Analyzer`, prepara el plan de cambios de instrucciones y confirma el estado tras aplicarlo. No hay etapas separadas de Lexer o Interpreter.
- `Editor`: CodeMirror 6 con lenguaje y tema propios.
- `Music`: instrumentos (`Instrument/{Sampler,Synth,Magenta,MidiOut,MidiSampler}`), efectos, `MidiIn`, variables y operadores.
- Operadores: tipos `Music/types/IOperator.ts` (`INoteEvent` con `notes`, `duration`, `time?`, `pool?`), registro `Music/constants/operators.ts` (`OPERATORS_MAP`), clase base `Music/services/Operators/index.ts` (helpers protegidos `label`, `numbers`, `probability`, `chance`; las subclases llaman `super()` y parsean en el constructor), una carpeta por operador, `Music/helpers/{transpose,createOperators}.ts`. `Instrument/triggerAttack.ts` aplica la cadena y no toca el instrumento si no queda ninguna nota.
- Para anadir un operador: clase en `Operators/<Nombre>/index.ts`, entrada en `COMMANDS`, `OPERATORS` y `COMMANDS_MAP` (Compiler), registro en `OPERATORS_MAP`, tests en `Music/tests/Music/operators.test.js`, fila en `doc/language.md`, ejemplo en `doc/examples/`.
- Las clases con estado (`Unique`, `Walk`) lo pierden al actualizar el codigo en vivo porque los operadores se recrean.

## Tests

- `Compiler/tests/Parser/samples.test.js` compila cada `doc/examples/*.duejs`, valida instrucciones y que el preset de `sam` exista.
- `Music/tests/Music/operators.test.js` cubre operadores y la integracion con `TriggerAttack`.
- Estado conocido: lint limpio y 233 tests pasan. Los operadores nuevos se probaron con tests, no de oido en el navegador.

## Ejemplos (`doc/examples/`)

Todos empiezan con el banner ASCII `DUE.JS` (5 lineas de comentario, copiar de `sample1.duejs`). Existentes: `sample1`, `sample2`, `operators`, `operators-all`, `generative-ambient`, `dj-dave`.
`operators-all` mantiene todas las pistas en do mayor (transposiciones distintas por pista sonaban mal).

## Documentacion de ideas (`doc/`)

- `language.md`: referencia del lenguaje y comportamiento real.
- `generative.md` (G01-G43): musica generativa; G31 implementado (operadores) y G32 parcialmente implementado con `::walk(n)`. G01/G02 (escala global y grados) descartados por cambiar demasiado la sintaxis; la transposicion de notas en `n` y `sam` se cubre parcialmente con `::trans(n)`.
- `norns.md` (N01-N20): prioridad N07 (secuenciadores de longitudes distintas; probablemente ya funciona, queda comprobar que todas las pistas arrancan a la vez y un posible `::len(N)`).
- `live-coding.md`: escenas L05 (decisiones tomadas: `scene#intro{ ... }`, una activa, entra en el siguiente compas, `Cmd+Shift+Enter` o `@n`), L03 minimapa y L16 plegado por regiones parcialmente implementados, F06 parada de emergencia, F26 inspeccion y F27 token activo inline en patrones explicitos.
- `shorts.md` (S01-S30): ideas de siete shorts de live coding en Strudel (supersaw, filtro acid, ducking, `beat` por posiciones, deslizadores, `slice`, voicing...). Orden sugerido: S01-S02, S13+S14+S22, S11+S12, S06, S08+S10+S21, S28+S29+S25.
- `features.md` y `tasks.md`: catalogo de propuestas y deuda tecnica.

## Siguientes pasos probables

Supersaw y detune (S01-S02); filtro con envolvente y deslizadores (S13, S14, S22); ducking (S11); patrones por posiciones de pulso (S06); N07; escenas L05; F06. Aun pendientes en el motor: ejecutor de `=>`, indices MIDI validados, retirada del listener propio al borrar una entrada MIDI.

## Gotchas

- `create_file` no sobreescribe: borrar antes el archivo.
- Verificar siempre el contenido actual antes de editar: el usuario edita en paralelo.
