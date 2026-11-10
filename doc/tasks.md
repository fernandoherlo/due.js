# Tareas de due.js

## Editor

- [x] Sustituir el lenguaje Sass por resaltado propio de due.js.
- [x] Verificar comandos, variables, presets, notas, numeros, operadores y comentarios.

## Validar el DSL antes de modificar el audio

- [ ] Rechazar presets desconocidos y variables sin definir.
- [ ] Validar valores de efectos, duraciones e intervalos fuera de rango.
- [ ] Decidir si el intervalo 0 debe rechazarse o limitarse.

## Errores en pantalla

- [x] Mostrar errores de sintaxis con subrayado, marcador y mensaje con linea y columna.
- [x] Poner la barra en rojo ante errores de sintaxis y limpiar el estado al corregirlos.
- [ ] Mostrar tambien los errores de ejecucion, sin depender solo de la barra y la consola.

## Recuperar tras fallos

- [ ] Liberar los recursos creados si una compilacion falla a mitad.
- [ ] Definir el comportamiento del audio cuando falla la aplicacion de un plan.

## Verificar el motor

- [ ] Probar cambios y borrados de instrumentos durante la reproduccion.
- [ ] Probar acordes, sintetizador, MIDI y Magenta.

## Documentar el arranque

- [ ] Completar el README con instalacion, `npm run samples`, compilacion y reproduccion.

## Cierre

- [x] Ejecutar la suite completa y el build con todos los cambios antes del commit.

## Decisiones posteriores

- [ ] Definir el comportamiento de `=>` y del comando `con`.
- [ ] Decidir que hacer con los comandos declarados pero no implementados.
- [ ] Permitir configurar el tempo.
- [ ] Fijar las escalas definitivas de los efectos.