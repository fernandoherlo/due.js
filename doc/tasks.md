# Tareas de due.js

Correcciones, deuda tecnica y comprobaciones del comportamiento actual.
Las propuestas de nuevas funcionalidades se recogen en [features.md](features.md).

## Editor

- [x] Sustituir el lenguaje Sass por resaltado propio de due.js.
- [x] Verificar comandos, variables, presets, notas, numeros, operadores y comentarios.

## Arranque y MIDI

- [x] Permitir arrancar el editor y reproducir audio si Web MIDI no esta soportado o se deniega el permiso.
	Probar ambos casos sin bloquear los controles ni ocultar el motivo de la indisponibilidad de MIDI.
- [x] Retirar solo el listener propio al eliminar una entrada o variable MIDI.
	Cada `MidiIn` quita su callback exacto; probado con dos variables en el mismo canal.

## Validar el DSL antes de modificar el audio

- [x] Rechazar presets desconocidos y variables sin definir.
- [x] Validar valores de efectos, duraciones e intervalos fuera de rango.
- [x] Decidir si el intervalo 0 debe rechazarse o limitarse.
	Se rechaza: el intervalo debe ser mayor que 0 (un rango puede empezar en 0).
- [x] Distinguir valores omitidos de ceros explicitos: el feedback `0` del delay no debe convertirse en `0.5`.
	Revisar los valores por defecto equivalentes y cubrir el caso con pruebas.
- [x] Validar la sintaxis de `miN`, canales de 1 a 16 y controladores de 0 a 127 antes de crear las conexiones,
	tambien cuando no exista el dispositivo seleccionado. La reconexion automatica sigue pendiente.

## Errores en pantalla

- [x] Mostrar errores de sintaxis con subrayado, marcador y mensaje con linea y columna.
- [x] Poner la barra en rojo ante errores de sintaxis y limpiar el estado al corregirlos.
- [ ] Mostrar tambien los errores de arranque, compilacion y reproduccion, sin depender solo de la barra y la consola.

## Recuperar tras fallos

- [ ] Liberar los recursos creados si una compilacion falla a mitad.
- [ ] Definir el comportamiento del audio cuando falla la aplicacion de un plan.

## Persistencia

- [ ] Gestionar fallos de lectura y escritura de localStorage sin impedir el arranque ni presentar como fallida
	una compilacion ya aplicada. Mostrar un aviso de guardado y probar almacenamiento bloqueado o sin espacio.

## Verificar el motor

- [ ] Probar cambios y borrados de instrumentos y efectos durante la reproduccion.
- [ ] Probar acordes, sintetizador, MIDI y Magenta.

## Arquitectura

Mantener los modulos App, Compiler, Editor y Music y los servicios como clases.
Conservar la reutilizacion del Parser desde Editor, sin duplicar la validacion del lenguaje.
No introducir un paquete Core/Shared ni nuevas capas o interfaces sin una necesidad concreta.

- [x] Romper el ciclo entre el registro `COMMANDS_ELEMENT_MAP` y los instrumentos: la clase base Instrument no debe importar el registro que construye sus subclases.
- [ ] Desacoplar Compiler de IApp: recibir solo el logger necesario y dejar que App publique las variables del plan tras aplicarlo correctamente.
- [ ] Revisar las dependencias de Music y Editor sobre IApp y reducirlas a las que realmente utilizan, sin crear una interfaz por cada servicio.
- [ ] Sustituir la herencia `Instrument extends Instruction` por composicion: recibir la instruccion como dato y mantener separado el estado de reproduccion.
- [ ] Cubrir los cambios con pruebas de importacion de instrumentos sin ciclos, ejecucion de instrumentos y efectos, y publicacion de variables solo tras una compilacion correcta.

## Documentar el arranque

- [x] Completar el README con instalacion, `npm run samples`, compilacion y reproduccion.
	Incluye requisitos de Node y navegador, permisos MIDI, build y descarga opcional de muestras.

## Cierre

- [x] Ejecutar la suite completa y el build con todos los cambios antes del commit.
- [ ] Repetir la suite completa, lint y build al completar los cambios pendientes, incluidos los de arquitectura.
	El check anterior registra la validacion del trabajo previo, no la de cambios posteriores.

## Decisiones posteriores

- [ ] Decidir que hacer con los comandos declarados pero no implementados.
- [ ] Fijar las escalas definitivas de los efectos.