# Features de due.js

Catalogo de propuestas de producto, no de compromisos para una version.
Salvo las entradas marcadas como prototipo disponible, no son funcionalidades implementadas.
Cada entrada necesita concretar su alcance, sintaxis y pruebas antes de implementarse.
Las correcciones, la deuda tecnica y las comprobaciones se mantienen en [tasks.md](tasks.md).
Las propuestas conservan el DSL propio de due.js; no requieren sustituirlo por JavaScript.

Como primer grupo, se sugieren F07, F24 y F25, una vez resueltas las correcciones necesarias del motor.
Las propuestas de interpretacion en directo (F01-F06, F26, F27 y F33) estan en [live-coding.md](live-coding.md).
F01 y F31 deben coordinarse para definir la relacion entre tiempo musical y tempo.

## Patrones y composicion

### F07. Silencios y prolongaciones

Representar pasos vacios y prolongaciones de notas dentro de las secuencias sin recurrir a trucos de volumen.
Un silencio avanzaria el patron sin disparar una nota; una prolongacion extenderia la nota anterior.
La sintaxis deberia contemplar acordes y definir el resultado cuando no existe una nota previa que prolongar.

### F08. Ritmos euclidianos

Generar un patron repartiendo un numero de golpes de la forma mas uniforme posible entre una cantidad de pasos.
Permitir tambien rotar el resultado para desplazar sus acentos respecto al inicio del compas.
El patron generado deberia poder combinarse con notas, silencios y las transformaciones normales del lenguaje.

### F09. Repeticion y subdivision

Repetir un patron o aumentar su densidad sin escribir cada evento manualmente.
Seria necesario distinguir entre repetir el contenido alargando la frase y encajarlo varias veces en la misma duracion.
La operacion deberia poder aplicarse a una secuencia completa o a un fragmento, con limites para evitar sobrecargas.

### F10. Polirritmos y polimetrias

Combinar pistas con diferentes subdivisiones o longitudes de patron manteniendo un reloj musical comun.
Esto permitiria crear relaciones ritmicas que se desplazan y vuelven a coincidir tras varias vueltas.
Habria que definir el reinicio de cada patron y su comportamiento al cambiar el tempo o recompilar.

### F11. Probabilidad por evento

Asignar a una nota, acorde o grupo de pasos una probabilidad de ejecutarse en cada aparicion.
Cuando un evento no se dispara, su espacio temporal se conservaria para no desplazar el resto del patron.
La probabilidad deberia poder combinarse con variaciones periodicas y con una semilla de aleatoriedad reproducible.

### F12. Aleatoriedad reproducible

Configurar una semilla para recuperar las mismas decisiones aleatorias en distintas ejecuciones de una sesion.
Esto ayudaria a depurar patrones y repetir una interpretacion que haya resultado interesante.
Habria que definir que operaciones consumen aleatoriedad y cuando se reinicia su estado, sin depender del refresco visual.

### F13. Variaciones periodicas

Aplicar una transformacion cada cierto numero de vueltas, como cambiar una nota o densificar el ultimo compas.
El programa podria describir una estructura que evoluciona sin copiar varias versiones de la misma frase.
Las variaciones deberian compartir una referencia de ciclo clara y no acumular cambios involuntarios sobre el patron base.

### F14. Transposicion

Desplazar notas, acordes y secuencias por semitonos u octavas sin reescribir sus valores originales.
La operacion permitiria reutilizar motivos musicales y construir variaciones a partir de una misma frase.
Deberia distinguirse de cambiar la velocidad de una muestra y respetar los limites del instrumento o de la salida MIDI.

### F15. Transformaciones de secuencia

Invertir el orden de los pasos, rotar su posicion o recorrer una secuencia alternando ida y vuelta.
Estas operaciones permitirian obtener variaciones estructurales manteniendo el material musical de partida.
Habria que definir si las duraciones, intensidades y silencios viajan con cada paso y como se combinan las transformaciones.

### F16. Escalas y grados

Definir una tonalidad y una escala para escribir melodias mediante grados en lugar de notas absolutas.
Cambiar la escala o la tonica permitiria reutilizar un patron conservando sus relaciones musicales.
La propuesta deberia definir octavas, grados fuera de rango y la convivencia con notas escritas de forma explicita.

### F17. Acordes y progresiones

Declarar acordes por nombre y tipo, elegir inversiones y encadenarlos como una progresion musical.
Esto complementaria los acordes actuales escritos como conjuntos de notas, que seguirian siendo validos.
Habria que definir la duracion de cada acorde, su registro y la interaccion con escalas, transposicion y secuencias.

### F18. Dinamica por paso

Asignar intensidades o acentos distintos a los eventos de un patron sin modificar el volumen global de la pista.
La dinamica podria describirse mediante otra secuencia y ayudar a construir frases menos uniformes.
Deberia adaptarse a la velocidad MIDI y a los controles de los instrumentos, con reglas para patrones de distinta longitud.

### F19. Articulacion

Controlar cuanto dura una nota en relacion con el intervalo hasta la siguiente para crear efectos cortos o ligados.
Esto permitiria separar la estructura ritmica de la duracion efectiva de cada sonido.
La implementacion tendria que definir solapamientos, liberacion de notas y diferencias entre samplers, sintetizador y MIDI.

### F20. Swing y humanizacion

Desplazar ciertas subdivisiones para crear swing y permitir pequenas variaciones de tiempo e intensidad.
Los limites deberian ser configurables, con la posibilidad de desactivar la variacion o reproducirla mediante una semilla.
Estos cambios afectarian a los eventos musicales, no al reloj maestro ni a la sincronizacion de toda la sesion.

## Sonido

### F21. Automatizacion

Mover parametros de instrumentos y efectos mediante rampas, envolventes y osciladores lentos.
Esto permitiria crear evoluciones de volumen, filtros u otros controles sin recompilar cada valor intermedio.
Cada automatizacion deberia respetar el rango del parametro y poder sustituirse o eliminarse sin dejar tareas activas.

### F22. Manipulacion de muestras

Controlar el inicio, la longitud, la velocidad y la direccion de reproduccion de una muestra.
Estas operaciones abririan posibilidades de recorte y reutilizacion ritmica del audio existente.
Habria que distinguirlas de la afinacion del sampler y especificar que formatos y modos admiten cada transformacion.

Disponible parcialmente: `sam1#piano(C4;4;6)::reverse(127)` invierte el fragmento inicial de la muestra
que corresponde a la duracion de cada nota, respetando la transposicion.
El valor `0-127` indica la probabilidad de invertir cada paso; `0` nunca y `127` siempre.
El recorte, la longitud y el control independiente de velocidad siguen siendo propuestas.

### F23. Explorador de sonidos

Buscar presets y muestras desde el editor, escucharlos antes de usarlos e insertar su referencia en el codigo.
El explorador deberia mostrar cuales estan disponibles y cuales necesitan descargarse o cargarse todavia.
La preescucha tendria su propio control de parada y no modificaria los instrumentos del programa activo.

## Editor y proyecto

### F24. Autocompletado contextual

Sugerir comandos, presets, variables y notas segun la posicion del cursor y el contenido del programa.
Las opciones deberian proceder de los mismos registros que utiliza el compilador para evitar divergencias.
La insercion respetaria el texto existente y permitiria aceptar o descartar sugerencias mediante teclado.

### F25. Ayuda contextual

Mostrar la firma, las unidades, los rangos y un ejemplo del comando o parametro que se esta editando.
La ayuda distinguiria argumentos opcionales, valores por defecto y funciones todavia no disponibles.
Deberia poder consultarse sin abrir otra pagina y mantenerse coherente con la documentacion y la validacion del DSL.

### F28. Versiones de una sesion

Guardar instantaneas del programa y su configuracion para comparar o recuperar versiones durante una interpretacion.
Restaurar una instantanea deberia pasar por la misma validacion y aplicacion segura que una compilacion normal.
Estas versiones se distinguirian del historial de deshacer del editor y del guardado automatico del ultimo codigo valido.

### F29. Proyectos compartibles

Exportar e importar el codigo, la configuracion y las referencias de muestras como un proyecto transportable.
El formato deberia tener version y detectar recursos ausentes sin depender de las rutas locales de otra persona.
Habria que definir si el audio se incluye o solo se referencia, respetando sus licencias y sin exigir un servicio externo.

### F30. Grabacion de la salida

Capturar la mezcla de audio de una interpretacion y descargarla como archivo reproducible.
La grabacion tendria acciones claras de inicio y parada, indicacion de estado y limites razonables de memoria.
Deberia explicarse que el sonido de dispositivos MIDI externos no se incluye salvo que se incorpore como entrada de audio.

## Propuestas trasladadas desde tareas

### F31. Tempo configurable

Implementado de forma parcial: `bpm(N)` y el sufijo `b` (pulsos) en duracion e intervalo; ver `doc/language.md`.
Quedan control desde la interfaz, compases y subdivisiones (F01).

Permitir cambiar el tempo de la sesion sin modificar el codigo interno ni perder la sincronizacion de las pistas.
Habria que decidir si se controla desde el DSL, desde la interfaz o desde ambos, con una precedencia explicita.
Los patrones expresados en tiempo musical seguirian el tempo; los expresados en segundos conservarian su unidad.

### F32. Conexiones con => y con

Definir el significado musical de las conexiones que el parser ya reconoce con `=>` y el comando `con`.
Antes de habilitarlas habria que concretar que elementos pueden conectarse, como se representan las rutas y que ciclos se permiten.
La creacion, modificacion y eliminacion de conexiones deberia integrarse en el plan de compilacion y liberar sus recursos.

## Exploracion experimental

Estas propuestas exploran instrumentos y sistemas musicales mas alla de las mejoras generales del editor.
El texto debe describir el comportamiento musical; las visualizaciones serian opcionales salvo donde se indique.
El encaje directo significa que la idea puede expresarse como instrumento, accion o valor del DSL,
no que el motor actual ya la soporte ni que su implementacion sea sencilla.

Se sugiere explorar F36 y F38 como instrumentos y acciones.
Para F40 y F41 convendria definir un modelo comun de generadores con estado, separado de los instrumentos
que reproducen sus eventos y ampliable a F42 y F43, sin crear un mecanismo independiente por propuesta.
La sintaxis, los limites de recursos y la recuperacion tras recompilar siguen pendientes de concretar.

### F34. Nubes granulares

Propuesta no implementada. El prototipo granular se retiro porque su aportacion musical
no justificaba la complejidad del motor y sus controles.
Una futura exploracion deberia demostrar una textura util con una interfaz sencilla antes de incorporarse al DSL.

### F35. Bucles que se degradan

Encaje directo como instrumento o efecto que transforma el material en cada repeticion.
El bucle podria perder agudos, variar su afinacion o incorporar ruido, creando una memoria sonora que se deteriora.
El texto describiria las reglas y limites de esa evolucion, distinguiendola de un delay con parametros fijos.
Habria que definir como recuperar el estado inicial y evitar una acumulacion incontrolada de ganancia.

### F36. Resonadores y objetos sonoros

Encaje directo como un nuevo instrumento que excita un conjunto de resonancias mediante golpes o ruido.
En lugar de elegir solo un preset, el usuario describiria afinacion, amortiguacion y caracter de la excitacion.
Esto permitiria explorar timbres de cuerdas, placas o campanas sin prometer una simulacion fisica exacta.
Su ciclo de vida deberia integrarse con los mismos comandos de creacion, actualizacion y borrado del resto de instrumentos.

### F37. Microtonalidad

Encaje como ampliacion de los valores de nota, admitiendo frecuencias, desviaciones en cents o afinaciones alternativas.
El objetivo es componer fuera de las doce notas habituales sin confundir afinacion con velocidad de reproduccion.
Habria que conservar la notacion actual y declarar que instrumentos admiten cada modalidad.
Las salidas MIDI requeririan un tratamiento especifico de sus capacidades y limitaciones de afinacion.

### F38. Trayectorias espaciales

Encaje directo como una accion de espacializacion que acepta posiciones y recorridos a lo largo del tiempo.
El texto describiria el movimiento del sonido respecto al oyente, sin exigir un editor grafico tridimensional.
Los ejemplos de espacializacion de Tone.js servirian para explorar el motor, definiendo coordenadas y unidades claras.
La escucha estereo deberia seguir siendo util aunque no se disponga de un sistema de reproduccion espacial.

### F39. Desfase progresivo

Encaje como extension temporal de los patrones: varias pistas interpretan un mismo motivo con diferencias
de velocidad o desplazamientos acumulativos que hacen evolucionar su relacion ritmica.
El ejemplo Piano Phase de Tone.js es una referencia directa; no se trata de cambiar la fase de un oscilador.
Habria que mantener una referencia temporal estable y definir el reinicio o la conservacion del desfase al recompilar.

### F40. Caminantes musicales

Requiere generadores con estado que recorran notas, acordes o muestras siguiendo reglas de movimiento.
El texto describiria el punto inicial, los desplazamientos posibles y condiciones como evitar repeticiones
o regresar a una nota central. El generador produciria eventos para instrumentos existentes,
con reglas explicitas para conservar o reiniciar su posicion al recompilar y para reproducir sus decisiones aleatorias.

### F41. Cadenas de Markov

Requiere un generador que elija cada evento segun transiciones condicionadas por los eventos anteriores.
El usuario podria aportar una tabla de transiciones o una frase de referencia para obtener variaciones relacionadas.
No necesita un modelo de IA externo: necesita definir el orden, la memoria y las probabilidades del generador.
Deberia compartir el modelo de estado de F40 y admitir una semilla y una salida valida cuando no exista una transicion.

### F42. Gramaticas musicales

Requiere reglas de expansion que describan como una frase se transforma en variaciones y respuestas.
El DSL representaria esas reglas y su traduccion a eventos, en lugar de enumerar todas las notas resultantes.
Habria que separar la expansion de la ejecucion temporal y limitar profundidad, longitud y coste de generacion.
El resultado deberia poder inspeccionarse y reproducirse sin crear una segunda sintaxis general de programacion.

### F43. Automatas celulares musicales

Requiere un estado inicial, reglas de evolucion y un mapeo de los estados resultantes a notas o controles.
Una cuadricula podria evolucionar por pasos del reloj musical y generar estructuras a partir de reglas pequenas.
La definicion seguiria siendo textual; una vista de la cuadricula seria una ayuda opcional, no otro editor obligatorio.
Habria que limitar el tamano y el coste de cada generacion y definir como conservar, reiniciar y reproducir su estado.

### F44. Instrumentos que se responden

Requiere referencias entre pistas y condiciones sobre sus eventos, mas alla de reproducir patrones independientes.
Una pista podria responder despues de un silencio, imitar un contorno melodico o evitar coincidir con otra.
El DSL describiria estas relaciones sin confundirlas con las conexiones de audio de F32.
Habria que definir orden de evaluacion, latencia musical y limites para impedir ciclos infinitos de respuestas.

### F45. Audio como senal de control

Requiere fuentes de analisis y mapeos hacia parametros, usando intensidad o energia por bandas de una entrada de audio.
Por ejemplo, una percusion podria abrir el filtro de otra pista sin necesidad de reconocer sus notas.
Es distinto de F21: aqui la modulacion procede del sonido analizado, no de una curva o un oscilador programado.
El texto definiria fuente, destino, rango y suavizado; una entrada de microfono requeriria permiso y activacion explicita.

### F46. Sonificacion de datos

Requiere fuentes de datos y reglas que conviertan valores en notas, ritmos o controles de instrumentos.
El usuario podria aportar una serie local o conectar una fuente externa, con un mapeo explicito y comprobable.
La llegada irregular de los datos debe separarse del reloj que ejecuta la musica, con limites de frecuencia y almacenamiento.
Habria que definir el comportamiento ante datos ausentes o invalidos, evitando que una fuente externa bloquee el audio.

### F47. Realimentacion controlada

Requiere rutas de audio explicitas y una politica de ciclos para devolver parte de una salida a su procesamiento.
El DSL podria describir circuitos de realimentacion como una ampliacion de F32, no como conexiones arbitrarias sin validar.
El primer prototipo deberia incluir limites de ganancia, proteccion de salida y parada inmediata mediante F06.
Habria que validar las restricciones de los ciclos de Web Audio y garantizar que borrar una ruta libera sus recursos.

### F48. Sampler de memoria circular

Encaje parcial: el texto puede configurar una memoria de los ultimos segundos de una entrada y su reproduccion,
pero hacen falta controles claros para elegir la entrada, conceder permisos y capturar un fragmento.
Una voz, una palmada o un instrumento externo podrian convertirse en material musical durante la interpretacion.
Deberian definirse los limites de memoria, la diferencia entre captura y reproduccion y la liberacion de la entrada de audio.

### F49. Partituras audiovisuales

Encaje parcial porque amplia el producto hacia otro dominio y otro motor, aunque conserve la composicion mediante texto.
La propuesta conectaria eventos y parametros de due.js con un entorno como Hydra para componer imagen y sonido conjuntamente.
Un golpe podria cambiar una figura y una transformacion musical modificar su movimiento, mas alla de un visualizador decorativo.
La integracion deberia ser opcional y sus fallos o su frecuencia de dibujo no deberian controlar ni interrumpir el reloj del audio.

### F50. Imagenes como partituras

Encaje parcial: las reglas de traduccion pueden escribirse en el DSL, pero elegir y previsualizar una imagen necesita apoyo visual.
El usuario definiria un recorrido de lectura y como brillo, color o posicion se convierten en alturas, duraciones o timbres.
La imagen seria material de composicion, no una sustitucion del editor de texto por una cuadricula de notas.
Habria que resolver la carga del recurso, limitar el coste de analisis y conservar sus referencias al compartir un proyecto.

### F51. Evolucion por seleccion

Encaje parcial: las reglas de mutacion pueden describirse en texto, pero escuchar alternativas y elegirlas requiere otra interaccion.
El sistema generaria pequenas variaciones de un patron y la persona decidiria cuales desarrollar en la siguiente ronda.
No sustituiria al compositor ni exigiria un modelo de IA; seria una busqueda guiada con limites y decisiones recuperables.
Las alternativas se preescucharian sin modificar el programa activo hasta su aceptacion y conservarian su semilla e historial.

### Referencias del bloque experimental

Las referencias orientan estas propuestas; no implican que todos los proyectos usen Tone.js ni que incluyan cada feature descrita.
Scribbletune utiliza Tone.js en el navegador; Orca y Gibber aportan otras formas de secuenciar y componer,
y Hydra permite explorar una integracion audiovisual con su propio motor visual.

- [Ejemplos de Tone.js](https://tonejs.github.io/examples/): granular, espacializacion, analisis y Piano Phase.
- [Orca](https://github.com/hundredrabbits/Orca): programacion espacial y secuenciadores procedurales.
- [Gibber](https://github.com/gibber-cc/gibber): composicion audiovisual mediante live coding en el navegador.
- [Hydra](https://github.com/hydra-synth/hydra): sintesis visual programable e interaccion audiovisual.
- [Scribbletune](https://github.com/scribbletune/scribbletune): composicion mediante patrones y reproduccion con Tone.js.