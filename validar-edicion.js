/* ============================================================
   Validador de ediciones de «La Inteligencia».
   Comprueba, de forma MECÁNICA, que una edición está bien formada
   antes de publicarla. NO juzga si las noticias son ciertas ni su
   calidad: eso es responsabilidad del redactor (ver INSTRUCCIONES-EDICION.md).

   Uso:  node validar-edicion.js data/ediciones/AAAA-MM-DD.json

   - Termina con código 0 y "RESULTADO: OK" si todo está bien (puede haber avisos).
   - Termina con código 1 y "RESULTADO: NO PUBLICAR" si hay algún error.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;                 // la carpeta del proyecto
const errores = [];
const avisos = [];
const err = (m) => errores.push(m);
const avi = (m) => avisos.push(m);

// Un texto es "válido" si es una cadena no vacía.
const texto = (v) => typeof v === 'string' && v.trim().length > 0;

// --- 1) Leer el archivo de la edición que nos pasan ---
const rel = process.argv[2];
if (!rel) {
  console.error('Falta la ruta. Uso: node validar-edicion.js data/ediciones/AAAA-MM-DD.json');
  process.exit(1);
}
const rutaEdicion = path.isAbsolute(rel) ? rel : path.join(RAIZ, rel);

let ed;
try {
  ed = JSON.parse(fs.readFileSync(rutaEdicion, 'utf8'));
} catch (e) {
  console.error('✗ ERROR: no se puede leer la edición (' + rel + '): ' + e.message);
  console.log('\nRESULTADO: NO PUBLICAR (1 error)');
  process.exit(1);
}

// La fecha esperada sale del nombre del archivo (AAAA-MM-DD.json).
const fechaArchivo = path.basename(rutaEdicion).replace(/\.json$/, '');

// --- 2) Comprobaciones de la edición ---
if (ed.fecha !== fechaArchivo) {
  err(`La fecha de dentro ("${ed.fecha}") no coincide con el nombre del archivo ("${fechaArchivo}").`);
}

// Noticias: exactamente 6 y con todos sus campos.
if (!Array.isArray(ed.noticias) || ed.noticias.length !== 6) {
  err(`Debe haber exactamente 6 noticias (hay ${ed.noticias ? ed.noticias.length : 0}).`);
}
const fotosUsadas = [];
(ed.noticias || []).forEach((n, i) => {
  const et = `Noticia ${i + 1}`;
  ['seccion', 'titular', 'entradilla', 'reaccion', 'por_que_importa'].forEach((c) => {
    if (!texto(n[c])) err(`${et}: falta el campo "${c}".`);
  });
  // Foto
  if (!n.foto || !texto(n.foto.archivo)) {
    err(`${et}: falta la foto (archivo).`);
  } else {
    fotosUsadas.push(n.foto.archivo);
    const rutaFoto = path.join(RAIZ, n.foto.archivo);
    if (!fs.existsSync(rutaFoto)) err(`${et}: la foto "${n.foto.archivo}" no existe en el proyecto.`);
    if (!texto(n.foto.credito)) err(`${et}: la foto no tiene crédito.`);
  }
  // Fuente
  if (!n.fuente) {
    err(`${et}: falta la fuente.`);
  } else {
    if (!texto(n.fuente.medio)) err(`${et}: la fuente no tiene medio.`);
    if (!texto(n.fuente.fecha)) err(`${et}: la fuente no tiene fecha.`);
    if (!texto(n.fuente.url) || !/^https?:\/\//i.test(n.fuente.url)) {
      err(`${et}: la URL de la fuente falta o está mal escrita.`);
    }
  }
});

// Fotos repetidas dentro de la edición (aviso, no bloquea).
const repetidas = fotosUsadas.filter((f, i) => fotosUsadas.indexOf(f) !== i);
if (repetidas.length) avi(`Hay fotos repetidas en la misma edición: ${[...new Set(repetidas)].join(', ')}.`);

// Secciones fijas.
if (!Array.isArray(ed.posturas) || ed.posturas.length < 1) {
  err('Falta la sección "posturas" (al menos una).');
} else {
  if (ed.posturas.length < 3) avi(`Hay pocas posturas (${ed.posturas.length}); la receta sugiere 3-4.`);
  ed.posturas.forEach((p, i) => {
    if (!texto(p.quien) || !texto(p.que)) err(`Postura ${i + 1}: faltan "quien" o "que".`);
  });
}
if (!ed.mercados || !Array.isArray(ed.mercados.items) || ed.mercados.items.length < 1) {
  err('Falta la sección "mercados" (al menos un elemento).');
} else {
  ed.mercados.items.forEach((m, i) => {
    if (!texto(m.empresa) || !texto(m.que)) err(`Mercados ${i + 1}: faltan "empresa" o "que".`);
  });
}
if (!Array.isArray(ed.datos_curiosos) || ed.datos_curiosos.length < 1) {
  err('Falta la sección "datos_curiosos" (al menos uno).');
}
if (!ed.glosario || !texto(ed.glosario.termino) || !texto(ed.glosario.definicion)) {
  err('Falta el "glosario" (término y definición).');
}
// "El fin de semana": obligatorio SOLO los lunes.
const esLunes = (() => { try { return new Date(ed.fecha + 'T12:00:00').getDay() === 1; } catch (e) { return false; } })();
if (esLunes && !texto(ed.fin_de_semana)) {
  err('Es lunes: falta la sección "fin_de_semana".');
}

// --- 3) Comprobar el índice (data/index.json) ---
try {
  const indice = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data/index.json'), 'utf8'));
  const coincidencias = (indice.ediciones || []).filter((e) => e.fecha === ed.fecha);
  if (coincidencias.length === 0) err(`La edición ${ed.fecha} no está añadida en data/index.json.`);
  if (coincidencias.length > 1) err(`La edición ${ed.fecha} está duplicada en data/index.json.`);
} catch (e) {
  err('No se puede leer data/index.json: ' + e.message);
}

// --- 4) Comprobar que los enlaces responden (AVISA, no bloquea) ---
async function comprobarEnlaces() {
  const urls = (ed.noticias || []).map((n) => n.fuente && n.fuente.url).filter((u) => texto(u));
  for (const u of urls) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(u, {
        method: 'GET',
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (validador La Inteligencia)' }
      });
      clearTimeout(t);
      if (r.status >= 400) avi(`El enlace responde ${r.status} (puede ser un bloqueo a programas): ${u}`);
    } catch (e) {
      avi(`No se pudo comprobar el enlace (quizá bloquea a programas): ${u}`);
    }
  }
}

// --- 5) Resultado ---
(async () => {
  await comprobarEnlaces();

  console.log(`Validando: ${rel}\n`);
  if (avisos.length) {
    console.log('AVISOS (no bloquean):');
    avisos.forEach((a) => console.log('  ⚠ ' + a));
    console.log('');
  }
  if (errores.length) {
    console.log('ERRORES:');
    errores.forEach((e) => console.log('  ✗ ' + e));
    console.log(`\nRESULTADO: NO PUBLICAR (${errores.length} ${errores.length === 1 ? 'error' : 'errores'})`);
    process.exit(1);
  } else {
    console.log(`RESULTADO: OK para publicar${avisos.length ? ' (con ' + avisos.length + ' aviso[s] a revisar)' : ''}`);
    process.exit(0);
  }
})();
