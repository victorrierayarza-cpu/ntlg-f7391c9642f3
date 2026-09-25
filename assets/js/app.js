/* ============================================================
   LA INTELIGENCIA — app.js
   El "montador": lee los archivos de datos (JSON) y arma la página.
   No necesitas tocar esto para publicar una edición nueva: solo
   añades un archivo en data/ediciones/ y una línea en data/index.json.
   ============================================================ */

// Punto de entrada. Detecta qué vista pedir según data-vista del HTML.
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const vista = app.getAttribute('data-vista');
  const params = new URLSearchParams(window.location.search);
  const fechaPedida = params.get('f'); // ?f=2026-09-24

  if (vista === 'hemeroteca' && !fechaPedida) {
    montarHemeroteca(app);
  } else {
    // Portada (última edición) o una edición concreta si hay ?f=
    montarEdicion(app, fechaPedida);
  }

  registrarServiceWorker();
});

// Al volver a la app (reabrirla o cambiar de pestaña), recargar la PORTADA
// para mostrar siempre la última edición. No toca la vista de una edición
// concreta (?f=) ni la hemeroteca, para no interrumpir la lectura.
let _ultimoRefresco = Date.now();
function refrescarSiPortada() {
  const app = document.getElementById('app');
  if (!app) return;
  const params = new URLSearchParams(window.location.search);
  if (app.getAttribute('data-vista') === 'portada' && !params.get('f')) {
    if (Date.now() - _ultimoRefresco > 30000) { // como mucho una vez cada 30 s
      _ultimoRefresco = Date.now();
      montarEdicion(app, null);
    }
  }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) refrescarSiPortada(); });
window.addEventListener('pageshow', (e) => { if (e.persisted) refrescarSiPortada(); });

/* --- Utilidades --- */

// Escapa texto para que no rompa el HTML (seguridad básica).
function esc(t) {
  if (t === undefined || t === null) return '';
  return String(t)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

// Convierte "2026-09-24" en "lunes, 24 de septiembre de 2026".
function fechaLarga(iso) {
  try {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch (e) { return iso; }
}

async function cargarJSON(ruta) {
  const r = await fetch(ruta, { cache: 'no-cache' });
  if (!r.ok) throw new Error('No se pudo cargar ' + ruta);
  return r.json();
}

// Nombre para el saludo: guardado SOLO en este navegador (no se envía a ningún sitio).
function nombreUsuario() {
  try { return localStorage.getItem('li_nombre') || 'Víctor'; } catch (e) { return 'Víctor'; }
}
// Saludo según la hora local.
function saludoTexto() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/* --- Cabecera común --- */
function cabeceraHTML(esPrueba) {
  const aviso = esPrueba
    ? '<div class="aviso-prueba">Edición de prueba · contenido ficticio · solo para revisar el diseño</div>'
    : '';
  return `
  ${aviso}
  <header class="cabecera">
    <div class="contenedor">
      <div class="saludo" id="saludo" title="Pulsa para cambiar tu nombre">${esc(saludoTexto())}, <span class="cambia">${esc(nombreUsuario())}</span></div>
      <div class="cabecera-top">
        <a href="index.html">Portada</a>
        <span>Diario de la era artificial</span>
        <a href="hemeroteca.html">Hemeroteca</a>
      </div>
      <div class="masthead">
        <h1>La Inteligencia<span class="punto">.</span></h1>
        <p class="lema">Diario de la era artificial · Madrid · Lunes, miércoles y viernes</p>
      </div>
    </div>
  </header>`;
}

function pieHTML() {
  return `
  <footer class="pie">
    <div class="contenedor">
      La Inteligencia · Diario personal de la era artificial<br>
      Fotografías con licencia libre · Cada noticia enlaza a su fuente original<br>
      <a href="hemeroteca.html">Hemeroteca</a>
    </div>
  </footer>`;
}

/* --- Vista: una edición (portada o concreta) --- */
async function montarEdicion(app, fechaPedida) {
  try {
    const indice = await cargarJSON('data/index.json');
    const lista = indice.ediciones || [];
    if (lista.length === 0) throw new Error('No hay ediciones todavía.');

    // Ordena por fecha descendente y elige la pedida o la última.
    lista.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    const meta = fechaPedida
      ? lista.find(e => e.fecha === fechaPedida)
      : lista[0];
    if (!meta) throw new Error('No existe la edición ' + fechaPedida);

    const ed = await cargarJSON('data/ediciones/' + meta.fecha + '.json');
    document.title = 'La Inteligencia · ' + fechaLarga(ed.fecha);

    app.innerHTML =
      cabeceraHTML(ed.prueba) +
      '<main class="contenedor">' +
      tiraFechaHTML(ed) +
      noticiasHTML(ed.noticias || []) +
      seccionesFijasHTML(ed) +
      (fechaPedida ? '<a class="volver" href="hemeroteca.html">← Volver a la hemeroteca</a>' : '') +
      '</main>' +
      pieHTML();
    activarSaludo();
    activarAnimaciones();
  } catch (e) {
    app.innerHTML = mensajeError(e);
  }
}

// Permite cambiar el nombre del saludo (se guarda solo en tu navegador).
function activarSaludo() {
  const el = document.getElementById('saludo');
  if (!el) return;
  el.addEventListener('click', () => {
    const nuevo = window.prompt('¿Cómo quieres que te salude?', nombreUsuario());
    if (nuevo && nuevo.trim()) {
      try { localStorage.setItem('li_nombre', nuevo.trim()); } catch (e) {}
      const span = el.querySelector('.cambia');
      if (span) span.textContent = nuevo.trim();
    }
  });
}

// Aparición suave de noticias y secciones al entrar en pantalla.
// Mejora progresiva: si no hay soporte o se pide "menos animación", se ve todo normal.
function activarAnimaciones() {
  const menos = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (menos || !('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('.noticia, .seccion-fija');
  els.forEach(e => e.classList.add('reveal'));
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(e => obs.observe(e));
}

function tiraFechaHTML(ed) {
  return `<div class="tira-fecha">
    <span>${esc(fechaLarga(ed.fecha))}</span>
    <span>Edición ${esc(ed.numero || '0')}</span>
  </div>`;
}

function noticiasHTML(noticias) {
  const partes = noticias.map((n, i) => {
    const destacada = i === 0;
    const foto = n.foto ? `
      <figure>
        <img src="${esc(n.foto.archivo)}" alt="${esc(n.foto.alt || '')}" loading="lazy">
        <figcaption>${esc(n.foto.credito || '')}</figcaption>
      </figure>` : '';

    const reaccion = n.reaccion ? `
      <div class="bloque-reaccion">
        <h3>La reacción</h3>
        <p>${esc(n.reaccion)}</p>
      </div>` : '';

    const porque = n.por_que_importa ? `
      <div class="bloque-porque">
        <h3>Por qué importa</h3>
        <p>${esc(n.por_que_importa)}</p>
      </div>` : '';

    const fuente = n.fuente ? `
      <p class="fuente">Fuente:
        <a href="${esc(n.fuente.url)}" target="_blank" rel="noopener noreferrer">${esc(n.fuente.medio)}</a>
        · ${esc(n.fuente.fecha || '')}</p>` : '';

    // En escritorio, la destacada divide foto+texto en dos columnas.
    const cuerpoDestacada = destacada
      ? `<div class="destacada-cols"><div>${foto}</div><div>
           <p class="entradilla">${esc(n.entradilla || '')}</p>
           ${reaccion}${porque}${fuente}
         </div></div>`
      : `${foto}
         <p class="entradilla">${esc(n.entradilla || '')}</p>
         ${reaccion}${porque}${fuente}`;

    return `<article class="noticia ${destacada ? 'destacada' : ''}">
      <span class="etiqueta">${esc(n.seccion || '')}</span>
      <h2><a href="${esc(n.fuente ? n.fuente.url : '#')}" target="_blank" rel="noopener noreferrer">${esc(n.titular)}</a></h2>
      ${cuerpoDestacada}
    </article>`;
  });
  return `<section class="rejilla">${partes.join('')}</section>`;
}

function seccionesFijasHTML(ed) {
  let html = '<div class="fijas-grid">';

  // Posturas
  if (ed.posturas && ed.posturas.length) {
    const items = ed.posturas.map(p => `
      <div class="postura">
        <span class="quien">${esc(p.quien)}</span>${p.sin_confirmar ? '<span class="sin-confirmar">sin confirmar</span>' : ''}
        <div>${esc(p.que)}</div>
        <div class="meta">${esc(p.cuando || '')}${p.fuente ? ' · ' + esc(p.fuente) : ''}</div>
      </div>`).join('');
    html += `<section class="seccion-fija"><h2>Posturas</h2>${items}</section>`;
  }

  // Mercados (breve financiero: salidas a bolsa, valoraciones, ingresos)
  if (ed.mercados && ed.mercados.items && ed.mercados.items.length) {
    const intro = ed.mercados.intro ? `<p class="mercados-intro">${esc(ed.mercados.intro)}</p>` : '';
    const items = ed.mercados.items.map(m => `
      <div class="postura">
        <span class="quien">${esc(m.empresa)}</span>
        <div>${esc(m.que)}</div>
        <div class="meta">${esc(m.cuando || '')}${m.fuente ? ' · ' + esc(m.fuente) : ''}</div>
      </div>`).join('');
    html += `<section class="seccion-fija"><h2>Mercados</h2>${intro}${items}</section>`;
  }

  // Datos curiosos
  if (ed.datos_curiosos && ed.datos_curiosos.length) {
    const items = ed.datos_curiosos.map(d => `<p class="dato-curioso">${esc(d)}</p>`).join('');
    html += `<section class="seccion-fija"><h2>Datos curiosos</h2>${items}</section>`;
  }

  // Glosario del día
  if (ed.glosario) {
    html += `<section class="seccion-fija glosario"><h2>Glosario del día</h2>
      <p><span class="termino">${esc(ed.glosario.termino)}:</span> ${esc(ed.glosario.definicion)}</p></section>`;
  }

  // El fin de semana (solo lunes)
  if (ed.fin_de_semana) {
    html += `<section class="seccion-fija"><h2>El fin de semana</h2>
      <p>${esc(ed.fin_de_semana)}</p></section>`;
  }

  html += '</div>';
  return html;
}

/* --- Vista: hemeroteca --- */
async function montarHemeroteca(app) {
  try {
    const indice = await cargarJSON('data/index.json');
    const lista = (indice.ediciones || []).slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    const items = lista.map(e => `
      <li><a href="hemeroteca.html?f=${esc(e.fecha)}">
        <span class="h-titulo">${esc(e.titulo || 'Edición del ' + fechaLarga(e.fecha))}</span>
        <span class="h-fecha">${esc(fechaLarga(e.fecha))}</span>
      </a></li>`).join('');

    app.innerHTML =
      cabeceraHTML(false) +
      `<main class="contenedor">
        <div class="tira-fecha"><span>Hemeroteca</span><span>${lista.length} ${lista.length === 1 ? 'edición' : 'ediciones'}</span></div>
        <ul class="hemeroteca-lista">${items}</ul>
        <a class="volver" href="index.html">← Volver a la portada</a>
      </main>` +
      pieHTML();
    activarSaludo();
  } catch (e) {
    app.innerHTML = mensajeError(e);
  }
}

function mensajeError(e) {
  return `<main class="contenedor">
    <p class="cargando">No se pudo cargar el contenido.<br>
    <small>${esc(e.message)}</small></p>
    <a class="volver" href="index.html">← Portada</a>
  </main>`;
}

/* --- PWA: registra el service worker (permite abrir sin conexión) --- */
function registrarServiceWorker() {
  // En local (localhost) NO activamos el service worker: en desarrollo estorba
  // porque sirve copias guardadas. En el servidor real (GitHub Pages) sí se activa.
  const enLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  if (!enLocal && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {/* sin conexión no pasa nada */});
    });
  }
}
