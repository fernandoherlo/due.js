# Ideas de interfaz para due.js

Este documento reune 30 ideas de interfaz a partir de las propuestas ya escritas en el repo y de patrones observados en otros entornos de live coding musical. No son compromisos ni una lista de trabajo aprobada. Las referencias entre corchetes enlazan con propuestas existentes; `Nueva` identifica una adaptacion aun no catalogada. Las ideas de visualizacion deben observar el motor de audio, no alterar sus decisiones ni su reloj.

## Editor y aprendizaje

1. **Autocompletado contextual** [F24, propuesta]: sugerir comandos, presets, variables y notas validas en la posicion del cursor.
2. **Ayuda junto al codigo** [F25, propuesta]: mostrar firma, unidades, rangos, valores por defecto y ejemplos del comando actual.
3. **Galeria de ejemplos** [L18, propuesta]: buscar, preescuchar y abrir ejemplos sin perder el programa actual; pedir confirmacion antes de sustituirlo.
4. **Buscador rapido de comandos y sonidos** [Nueva]: una paleta filtrable para insertar un comando, preset o efecto sin recorrer menus.
5. **Plegado y minimapa del programa** [L03, L16, propuestas]: plegar secciones y saltar entre pistas desde una vista compacta.
6. **Diagnosticos junto a la linea** [tasks.md, parcialmente pendiente]: distinguir errores de sintaxis, compilacion, carga de muestras y reproduccion con una accion para ir al origen.
7. **Atajos configurables** [F05, parcialmente implementada]: consultar y reasignar acciones como compilar, play, mute y parada.

## Visualizacion del patron

8. **Anotaciones visuales en el codigo** [inspiracion: Gibber]: mostrar informacion musical al lado del codigo sin convertirla en parte de la sintaxis ejecutable.
9. **Piano roll por pista** [S19, S30; inspiracion: Strudel]: ver alturas, duraciones y acordes alineados en el tiempo.
10. **Vista de pasos tipo punchcard** [S19, S30; inspiracion: Strudel; no elegida]: se exploro una cuadricula separada, pero la implementacion actual resalta inline el token activo para evitar duplicar la vista del editor.
11. **Scope y forma de onda** [S19; inspiracion: Sonic Pi y Strudel]: inspeccionar la salida de audio sin confundir la forma de onda con la estructura de notas.
12. **Prevision de proximos eventos** [F27, propuesta; ver tambien patrones.md]: mostrar notas, acordes y silencios ya resueltos, junto con su posicion temporal.
13. **Cursor de paso activo** [F27, L13; parcialmente implementado]: resaltar inline el token exacto del paso elegido, sincronizado con el loop real; incluye opciones aleatorias, pesos, acordes y silencios en patrones explicitos.
14. **Registro de eventos y cues** [Nueva; inspiracion: Sonic Pi]: listar eventos recientes con pista, nota, hora, operador aplicado y motivo de una omision.

## Controles de interpretacion

15. **Lista de pistas** [L04, propuesta]: ver nombre, instrumento, preset, estado y acceso directo a la linea de cada pista.
16. **Mute y solo por pista** [F04, L01; mute parcialmente implementado]: silenciar o aislar pistas desde la lista o el margen y conservar ese estado al recompilar.
17. **Controles de grupo** [L02, implementado parcialmente]: aplicar mute y acciones comunes a grupos; la propuesta incluye compartir controles y efectos.
18. **Lanzador de escenas** [L05, propuesta]: cambiar entre secciones con botones y ver cual esta activa o pendiente.
19. **Barra de transporte clara** [F06, F05; propuesta parcial]: play, pausa, compilar y parada de emergencia con estados diferenciados.
20. **Cola de cambios cuantizados** [F02, L11; compilacion automatica implementada parcialmente]: ver el cambio pendiente, el compas de aplicacion y permitir sustituirlo o cancelarlo.
21. **Controles asignables tipo macros** [N01, N02, S22, propuestas]: reunir parametros importantes en unos pocos mandos ajustables durante la interpretacion.
22. **Deslizadores junto a variables** [L14, S14; propuesta]: cambiar un valor desde el editor e indicar si el texto o la compilacion aun no reflejan el cambio.
23. **MIDI learn** [N03, L19, propuestas]: seleccionar una accion y mover un control MIDI para asignarlo.
24. **Panel de dispositivos y conexiones** [F33, N03, propuestas]: mostrar entradas y salidas MIDI, reconexion, canal y estado de cada asignacion.
25. **Grid virtual de disparo** [N18, propuesta; inspiracion: monome grid/Orca]: disparar notas, silencios o escenas con celdas, con soporte opcional para un grid fisico.
26. **Modo escenario** [L17, propuesta]: reducir barras y paneles, aumentar la legibilidad y conservar visibles transporte, tempo y estado de pistas.
27. **Medidores y proteccion de nivel** [L08, L15, propuestas]: mostrar nivel maestro, nivel por pista y actividad de voces; indicar cuando actua el limitador.

## Recursos y sesiones

28. **Explorador y preescucha de muestras** [F23, propuesta]: buscar presets, comprobar disponibilidad y escuchar una muestra sin alterar el programa activo.
29. **Grabacion y exportacion accesibles** [F30, L22, propuestas]: controlar grabacion de audio o de la sesion, mostrar su estado y ofrecer acciones de exportacion claras.
30. **Biblioteca, versiones y compartir piezas** [F28, F29, N17, propuestas]: encontrar ejemplos y sesiones, comparar versiones y exportar un proyecto con codigo y referencias a muestras.

## Referentes revisados

- [Sonic Pi: tutorial e interfaz](https://sonic-pi.net/tutorial.html): editor, controles Run/Stop/Save/Record, ayuda integrada, log de eventos, cue viewer, scope y preferencias de audio.
- [monome norns](https://monome.org/docs/norns/): instrumento con pantalla, tres controles y tres teclas; editor Maiden, scripts compartidos e integracion con controladores.
- [Orca](https://100r.co/site/orca.html): secuenciacion en una rejilla textual y comunicacion con otros instrumentos mediante MIDI, OSC o UDP.
- [Gibber](https://gibber.cc/): anotaciones y visualizaciones dentro del editor, codigo audiovisual y trabajo en conjunto por red.
- [Strudel](https://strudel.cc/): entorno de live coding en navegador; las visualizaciones `_pianoroll()`, `_punchcard()` y `_scope()` tambien se documentan en [shorts.md](shorts.md).

Estos referentes inspiran interacciones, no implican que due.js deba copiar su lenguaje ni su arquitectura. Las propuestas de este documento pueden agruparse o descartarse despues de elegir un flujo principal de uso.
