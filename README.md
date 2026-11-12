# due.js

Lenguaje propio de live coding musical que se ejecuta en el navegador. Usa Vite,
TypeScript, Tone.js, CodeMirror 6 y Web MIDI. La referencia de sintaxis y del
comportamiento actual esta en [doc/language.md](doc/language.md).

## Requisitos

- Node.js 20.19+ o 22.12+.
- Navegador moderno con Web Audio API. No se mantiene una matriz de versiones
	de navegador probadas. Web MIDI es opcional; requiere soporte del navegador y
	permiso del usuario.

## Desarrollo

```sh
npm install
npm run dev
```

Vite muestra en la terminal la direccion local para abrir el editor.
`Cmd/Ctrl+S` compila el codigo y `Cmd/Ctrl+Enter` alterna la reproduccion.

## Comprobaciones y build

```sh
npm test -- --run
npm run lint
npm run build
```

`npm run build` ejecuta lint, TypeScript y la compilacion de produccion.

## Muestras

El proyecto incluye muestras en `public/samples/`. Si faltan archivos de audio,
se puede descargar de nuevo la coleccion publica ejecutando:

```sh
npm run samples
```

Este comando necesita conexion a Internet y copia los archivos descargados en
`public/samples/`, por lo que puede reemplazar muestras existentes.

## MIDI

La falta de soporte o de permiso de Web MIDI no impide usar el editor ni el
audio generado en el navegador. Las funciones de entrada y salida MIDI necesitan
un navegador compatible y acceso al dispositivo.
