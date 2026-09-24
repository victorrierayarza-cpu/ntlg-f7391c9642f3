# La Inteligencia — guía del proyecto

Periódico digital personal sobre inteligencia artificial. Es una web estática (PWA)
que se publica en GitHub Pages. Un agente en la nube crea y publica una edición
lunes, miércoles y viernes siguiendo INSTRUCCIONES-EDICION.md.

## Dónde está cada cosa
- `index.html` y `hemeroteca.html`: las páginas. El diseño está en `assets/css/estilo.css` y `assets/js/app.js`.
- `data/index.json`: la lista de todas las ediciones.
- `data/ediciones/AAAA-MM-DD.json`: una edición (6 noticias + secciones fijas).
- `data/fototeca.json`: catálogo de fotos disponibles, con su crédito, para elegir.
- `assets/fotos/`: fotos de licencia libre (detalle en REGISTRO-LICENCIAS.md).

## Reglas al crear una edición
- Seguir SIEMPRE INSTRUCCIONES-EDICION.md.
- Cada edición es un archivo nuevo por fecha; no modificar ediciones ya publicadas salvo que Víctor lo pida expresamente.
- Fotos: solo de data/fototeca.json (licencia libre, sin personas, nunca de prensa).
- Resumir con palabras propias; nunca copiar frases literales; enlazar siempre la fuente.
- Antes de publicar, pasar la validación; si falla, no publicar (ver INSTRUCCIONES-EDICION.md).
- Estas reglas están también en INSTRUCCIONES-EDICION.md; si cambias una, cámbiala en ambos archivos.

## Trabajo de diseño o mantenimiento
Para tocar el diseño (no para crear ediciones), ver NOTAS-DISENO.md.
