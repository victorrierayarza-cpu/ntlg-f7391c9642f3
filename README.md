# La Inteligencia

Periódico digital personal sobre inteligencia artificial. Web instalable en el móvil (PWA),
privada y de coste cero. Se actualiza lunes, miércoles y viernes.

## Cómo está organizado (mapa del proyecto)

```
index.html            La portada (muestra la última edición).
hemeroteca.html       El archivo de todas las ediciones por fecha.
manifest.webmanifest  Ficha que convierte la web en app instalable.
sw.js                 Permite abrir la app sin conexión.
robots.txt            Pide a los buscadores que no la indexen.

assets/
  css/estilo.css      El aspecto de periódico (tipografías, columnas, colores).
  js/app.js           Arma las páginas leyendo los datos. No hay que tocarlo para publicar.
  iconos/             El icono "I." en varios tamaños.
  fotos/              La fototeca (fotos con licencia libre) + REGISTRO-LICENCIAS.md

data/
  index.json          Lista de todas las ediciones (una línea por edición).
  ediciones/          Un archivo por edición: 2026-09-24.json, etc.
```

## Cómo se publica una edición nueva (idea general)

1. Se crea un archivo `data/ediciones/AAAA-MM-DD.json` con las 6 noticias y las secciones fijas.
2. Se añade esa edición a la lista de `data/index.json`.
3. Se sube el cambio. La portada mostrará automáticamente la más reciente.

Más adelante, una tarea automática en la nube hará estos tres pasos sola.

## Cómo verlo en el ordenador (mientras desarrollamos)

Al abrir la web hace falta un pequeño servidor local (los navegadores no dejan
leer los archivos de datos con doble clic). Con Node instalado:

```
npx serve .
```

y se abre la dirección que indique (algo como http://localhost:3000).

## Reglas que no se tocan

- Fotos con licencia libre, sin personas identificables, nunca de medios de prensa.
- Cada noticia enlaza a su fuente original.
- Hechos clave contrastados con dos fuentes. Nada inventado.
