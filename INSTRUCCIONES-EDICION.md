# Instrucciones de edición de «La Inteligencia» (receta para la automatización)

Este documento es el encargo cerrado que sigue la automatización cada vez que crea una edición.
Objetivo: un periódico veraz, contrastado y con criterio, sobre inteligencia artificial.

> Nota: algunas de estas reglas están también en CLAUDE.md; si cambias una, cámbiala en ambos archivos.

## 1. Cadencia
- Se publica **lunes, miércoles y viernes a las 11:00 (hora de Madrid)**.
- **Solo los lunes** se añade la sección **«El fin de semana»** (lo ocurrido de viernes a lunes).

## 2. Fuentes prioritarias (en este orden de confianza)
1. Blogs y comunicados oficiales de las empresas y organismos (OpenAI, Anthropic, Google, Meta, Comisión Europea, Casa Blanca, ONU…).
2. Agencias y prensa de referencia: Reuters, Bloomberg, Associated Press, Financial Times.
3. Tecnología especializada solvente: The Verge, TechCrunch, Ars Technica.
4. Prensa española de calidad: El País, elDiario.es, Xataka, Newtral (para contrastar y para el matiz local).
- Investigar en **inglés y español**; **escribir siempre en español**.
- **Nunca** copiar fotos ni textos de medios de prensa.

## 3. Selección (criterio periodístico)
- Entre 20 y 30 búsquedas por edición.
- Elegir **6 noticias**, priorizando el **impacto real** sobre el ruido mediático.
- Repartir entre las secciones-etiqueta: *Modelos y lanzamientos · Empresas y CEOs · Regulación y Derecho · Polémicas e irregularidades · Impacto en el mundo*. Puede repetirse una sección si la actualidad lo pide.
- No repetir una noticia ya publicada en ediciones recientes (revisar la hemeroteca).

## 4. Estructura de cada edición (formato de datos)
Crear `data/ediciones/AAAA-MM-DD.json` con:
- **6 noticias**, cada una con: `seccion`, `titular`, `entradilla` (resumen completo pero breve), `reaccion` («La reacción»: respuesta de la competencia o contrapunto), `por_que_importa` (con mirada jurídica o de negocio cuando encaje), `foto` (de la fototeca) y `fuente` (medio, url y fecha).
- **posturas**: 3-4 posturas de países o figuras ante hechos graves; cada una con quién, qué, cuándo y fuente; etiquetar «sin confirmar» lo no confirmado; tono equilibrado.
- **mercados**: breve financiero (salidas a bolsa, valoraciones, ingresos) de las punteras.
- **datos_curiosos**: 1-2 datos.
- **glosario**: un término técnico explicado en dos líneas.
- **fin_de_semana**: solo los lunes.
Después, añadir la edición a `data/index.json`.

## 5. Verificación (regla de oro)
- Los **hechos clave se contrastan con dos fuentes** independientes y solventes.
- **No inventar nada.** Ante la duda: omitir, o publicar con la etiqueta «sin confirmar».
- Cada noticia enlaza a **su fuente original**.
- Texto **redactado de cero**, con palabras propias. Nada de copiar. Como mucho, una cita corta (menos de 15 palabras) entrecomillada y atribuida.
- **Neutralidad**: no tomar partido. Evitar sobrerrepresentar a ninguna empresa (incluida Anthropic).

## 6. Fotografías
- Elegir de `data/fototeca.json` la foto cuyo tema encaje con cada noticia.
- Copiar su `archivo` y su `credito` tal cual (el crédito es obligatorio en licencias CC BY / CC BY-SA).
- Variar las fotos entre noticias; no repetir la misma dos veces en una edición.

## 7. Autocomprobación ANTES de publicar (el periódico se corrige solo)
Revisar y no publicar si algo falla:
1. El JSON de la edición es **válido** (se puede leer sin errores).
2. Hay **exactamente 6 noticias** y todas tienen titular, entradilla, fuente con URL y foto.
3. Cada **foto referida existe** en `assets/fotos/`.
4. Cada **URL de fuente responde** (no enlaces rotos).
5. Los **hechos clave tienen dos fuentes**; lo dudoso va como «sin confirmar» o se descarta.
6. Las **fechas** de las noticias están dentro de la ventana de la edición.
7. **No se repite** una noticia de ediciones anteriores.
8. Tono **neutral** y sin sesgo hacia ninguna empresa.
Si tras corregir sigue habiendo un problema grave, **es preferible publicar menos noticias (bien verificadas) que publicar algo dudoso**.

**Validación automática obligatoria (paso final antes de publicar):** ejecuta
`node validar-edicion.js data/ediciones/AAAA-MM-DD.json`.
- Si el resultado es **ERROR**, NO publiques: corrige lo que indique y vuelve a ejecutarlo.
- Si no consigues dejarlo en **OK**, **no hagas commit ni push**, y deja constancia del error en el resumen final (paso 8 de tu tarea).
- Los **avisos** (por ejemplo, un enlace que responde con «acceso denegado» a programas automáticos) NO bloquean; conviene revisarlos, pero puedes publicar.

## 8. Publicación
- **Solo si la validación ha dado OK:**
- Guardar la edición y actualizar el índice.
- Subir los cambios al repositorio (esto reconstruye la web sola).
- **Avisar** a Víctor con una notificación cuando la edición esté publicada.

## 9. Si algo va mal
- Si una fuente clave no está disponible o hay dudas serias, **no publicar una edición defectuosa**: publicar lo verificable o avisar del problema, nunca inventar para rellenar.
