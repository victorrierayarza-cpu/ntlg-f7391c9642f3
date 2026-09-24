# Notas de diseño y mantenimiento

Notas para cuando se toca el DISEÑO o el «esqueleto» del proyecto (no para crear ediciones).
Este archivo NO se carga solo en cada sesión; se lee solo cuando hace falta.

## Previsualizar en local
- Servidor de pruebas: `npx serve` (configurado en `.claude/launch.json`, puerto 4321).
- Es solo para desarrollo; no tiene nada que ver con la web publicada ni con el móvil.

## Regla del número de versión (evita el fallo de la caché)
Si cambias `assets/js/app.js` o `assets/css/estilo.css`:
1. Sube el número `?v=N` en los enlaces de `index.html` y `hemeroteca.html` (por ejemplo, de `?v=3` a `?v=4`).
2. Sube también `VERSION` en `sw.js`.
Si no, los móviles pueden seguir mostrando la versión antigua guardada.

## Iconos
- El icono maestro es `assets/iconos/icono.svg` (una «I» con serifa + punto rojo, dibujada con formas, sin depender de fuentes).
- Los PNG (180/192/512 y el «maskable») se generan con un pequeño script propio de Node, sin librerías externas.

## Fototeca
- Las fotos están optimizadas a WebP (ligeras para móvil). El catálogo con créditos está en `data/fototeca.json` y `assets/fotos/REGISTRO-LICENCIAS.md`.
- Las herramientas que descargan y optimizan (librería `sharp`) NO están en el repo (se usaron en una carpeta temporal). Para ampliar la fototeca hay que rehacer ese script (descargar de Wikimedia Commons y convertir a WebP), respetando las reglas legales (licencia libre, sin personas, nunca de prensa).

## Pendientes
- **Cambio de hora (26 de octubre de 2026):** desde esa fecha (horario de invierno), hay que ajustar la hora del robot para que siga publicando a las 11:00 de Madrid (pasa de las 09:00 a las 10:00 UTC). Si no, saldría a las 12:00.
- **No pisar la edición cero (`data/ediciones/2026-09-24.json`):** es contenido real ya revisado por Víctor. El robot crea siempre fechas nuevas, así que no debería tocarla; conviene no borrarla ni sobrescribirla.
