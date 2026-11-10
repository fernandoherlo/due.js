# Tareas de due.js

## Editor

- [ ] Sustituir el lenguaje Sass por resaltado propio de due.js.
- [ ] Verificar comandos, variables, presets, notas, numeros, operadores y comentarios.

## Validar el DSL antes de modificar el audio

- [ ] Rechazar presets desconocidos y variables sin definir.
- [ ] Validar valores de efectos, duraciones e intervalos fuera de rango.
- [ ] Decidir si el intervalo 0 debe rechazarse o limitarse.

## Errores en pantalla

- [ ] Mostrar el mensaje de error y su linea y columna cuando esten disponibles.
- [ ] No depender solo del color de la barra y de la consola.

## Recuperar tras fallos

- [ ] Liberar los recursos creados si una compilacion falla a mitad.
- [ ] Definir el comportamiento del audio cuando falla la aplicacion de un plan.

## Verificar el motor

- [ ] Probar cambios y borrados de instrumentos durante la reproduccion.
- [ ] Probar acordes, sintetizador, MIDI y Magenta.

## Documentar el arranque

- [ ] Completar el README con instalacion, `npm run samples`, compilacion y reproduccion.

## Cierre

- [ ] Ejecutar la suite completa y el build con todos los cambios antes del commit.

## Decisiones posteriores

- [ ] Definir el comportamiento de `=>` y del comando `con`.
- [ ] Decidir que hacer con los comandos declarados pero no implementados.
- [ ] Permitir configurar el tempo.
- [ ] Fijar las escalas definitivas de los efectos.