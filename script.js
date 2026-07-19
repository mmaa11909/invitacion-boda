// --- CONFIGURACIÓN DE RUTAS ---
var URL_ASISTENCIA = "https://script.google.com/macros/s/AKfycbwN4p7bHI2VbinITdjffPGoOQzQxpscdZLjkTXjn4d6BTHbX3wkD9nzGbOHYWe55FB_hA/exec";
var URL_FOTOS = "https://script.google.com/macros/s/AKfycbzqAmczsKY0dzkIlqpIy0Df8wZAZi4qfr8vG582E6I7-yVtsBjiF3CA96xCEPBkumfOSA/exec";

// FECHAS IMPORTANTES
var FECHA_BODA = new Date("2026-09-18T15:45:00-04:00");
var FECHA_HABILITACION_FOTOS = new Date("2026-09-18T15:45:00-04:00"); 
var FECHA_LIMITE_RSVP = new Date("2026-09-10T23:59:59-04:00"); // 10 de Septiembre a medianoche

var fotoSeleccionada = null;

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", function () {
  iniciarContador();
  prepararAnimaciones();
  prepararInputsFoto();
  generarFloresCayendo();
  manejarFormularioRSVP();
});

// --- LÓGICA DE MAPAS EN MODAL ---
function abrirMapa(url) {
  var modal = document.getElementById("modalMapa");
  var iframe = document.getElementById("iframeMapaModal");
  iframe.src = url;
  modal.classList.remove("oculto");
  // Evitar que el fondo de la página haga scroll cuando el modal está abierto
  document.body.style.overflow = "hidden";
}

function cerrarMapa() {
  var modal = document.getElementById("modalMapa");
  var iframe = document.getElementById("iframeMapaModal");
  modal.classList.add("oculto");
  iframe.src = ""; // Limpiar src para detener la carga
  // Restaurar el scroll del fondo
  document.body.style.overflow = "auto";
}

// Cerrar el modal al tocar fuera del contenido blanco
document.getElementById('modalMapa').addEventListener('click', function(e) {
  if (e.target === this) { cerrarMapa(); }
});

// --- GENERAR FLORES ---
function generarFloresCayendo() {
  const contenedor = document.getElementById("contenedorFlores");
  if (!contenedor) return;
  
  const colores = ['#FAD6D0', '#E88B7B', '#F5F0E1'];
  const cantidad = 15;

  for (let i = 0; i < cantidad; i++) {
    let petalo = document.createElement("div");
    petalo.classList.add("petalo");
    petalo.style.left = Math.random() * 100 + "vw";
    petalo.style.animationDuration = (Math.random() * 6 + 6) + "s";
    petalo.style.animationDelay = (Math.random() * 5) + "s";
    petalo.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
    let escala = Math.random() * 0.6 + 0.6;
    petalo.style.transform = `scale(${escala})`;
    contenedor.appendChild(petalo);
  }
}

// --- MÚSICA ---
var audio = document.getElementById("musicaBoda");
var boton = document.querySelector(".boton-musica");

function reproducirAutonomo() {
  if (!audio) return;
  audio.play().then(function () {
    if (boton) boton.classList.add("activa");
    document.removeEventListener('click', reproducirAutonomo);
    document.removeEventListener('touchstart', reproducirAutonomo);
  }).catch(function (error) {
    console.log("Esperando interacción para música.");
  });
}
window.addEventListener('load', reproducirAutonomo);
document.addEventListener('click', reproducirAutonomo);
document.addEventListener('touchstart', reproducirAutonomo); 

function controlarMusica() {
  if (audio.paused) { audio.play(); if (boton) boton.classList.add("activa"); } 
  else { audio.pause(); if (boton) boton.classList.remove("activa"); }
}
function pausarMusicaForzado() { if (audio && !audio.paused) { audio.pause(); } }

document.addEventListener("visibilitychange", function() {
  if (document.hidden) { pausarMusicaForzado(); } 
  else { if (audio && boton && boton.classList.contains("activa")) { audio.play().catch(e => console.log("Auto-play suspendido.")); } }
});
window.addEventListener("blur", pausarMusicaForzado);
window.addEventListener("focus", function() {
  if (audio && boton && boton.classList.contains("activa")) { audio.play().catch(e => console.log("Auto-play suspendido al enfocar.")); }
});
window.addEventListener("pagehide", pausarMusicaForzado);

// --- CONTADOR ---
function iniciarContador() {
  actualizarContador();
  setInterval(actualizarContador, 1000);
}

function actualizarContador() {
  var ahora = new Date();
  var distancia = FECHA_BODA.getTime() - ahora.getTime();

  if (distancia <= 0) {
    escribirTiempo("dias", "00"); escribirTiempo("horas", "00");
    escribirTiempo("minutos", "00"); escribirTiempo("segundos", "00");
    return;
  }
  var dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
  var horas = Math.floor((distancia / (1000 * 60 * 60)) % 24);
  var minutos = Math.floor((distancia / (1000 * 60)) % 60);
  var segundos = Math.floor((distancia / 1000) % 60);

  escribirTiempo("dias", dias); escribirTiempo("horas", horas);
  escribirTiempo("minutos", minutos); escribirTiempo("segundos", segundos);
}

function escribirTiempo(id, valor) {
  var elemento = document.getElementById(id);
  if (elemento) { elemento.innerText = String(valor).padStart(2, "0"); }
}

// --- ANIMACIONES FLUIDAS ---
function prepararAnimaciones() {
  var secciones = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { secciones.forEach(s => s.classList.add("visible")); return; }
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) { entrada.target.classList.add("visible"); observador.unobserve(entrada.target); }
    });
  }, { threshold: 0.15 });
  secciones.forEach(s => observador.observe(s));
}

// --- CONFIRMACIÓN DE ASISTENCIA ---
function manejarFormularioRSVP() {
  var formulario = document.getElementById("formularioAsistencia");
  if (!formulario) return;

  formulario.addEventListener("submit", function(evento) {
    evento.preventDefault(); // Evita recargar la página con "Enter"
    confirmarAsistencia();
  });
}

function confirmarAsistencia() {
  var ahora = new Date();
  
  // VALIDACIÓN: Límite de fecha
  if (ahora > FECHA_LIMITE_RSVP) {
    alert("Lo sentimos, la fecha límite para confirmar tu asistencia (10 de Septiembre) ha expirado. Por favor contáctate directamente con los novios.");
    return;
  }

  var nombre = document.getElementById("nombreCompleto").value.trim();
  var botonConfirmar = document.getElementById("botonConfirmar");

  if (nombre === "") {
    alert("Por favor escribe tu nombre completo.");
    return;
  }

  var datos = { tipo: "asistencia", nombre: nombre };

  botonConfirmar.disabled = true;
  botonConfirmar.innerText = "Enviando confirmación...";

  fetch(URL_ASISTENCIA, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
  .then(function () {
    mostrarPaginaConfirmacion();
  })
  .catch(function (error) {
    alert("No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.");
    botonConfirmar.disabled = false;
    botonConfirmar.innerText = "Confirmar asistencia";
  });
}

function mostrarPaginaConfirmacion() {
  if (audio) { audio.pause(); if (boton) boton.classList.remove("activa"); }
  document.getElementById("paginaInvitacion").style.display = "none";
  document.getElementById("paginaConfirmacion").classList.remove("oculto");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- ENVIAR MAPAS AL CELULAR ---
function enviarMapasCelular() {
  var celular = document.getElementById("celularMapa").value.trim();
  var regexBolivia = /^[67]\d{7}$/;
  if (!regexBolivia.test(celular)) { alert("Ingresa un número de celular válido de Bolivia (8 dígitos, empezando con 6 o 7)."); return; }
  pausarMusicaForzado();
  const mensaje = "¡Hola! Te comparto la información de la boda:\n\n📅 Ramiro y Janneth, 18 de septiembre de 2026 a las 15:45 hrs.\n\n📍 Iglesia:\nhttps://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1127.8764239176949!2d-66.28188852220772!3d-17.3871757666115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e30b75aa9df8b7%3A0x704745ff1b5c1b06!2sSantisima%20Trinidad!5e1!3m2!1ses!2sbo!4v1784246840403!5m2!1ses!2sbo \n\n📍 Recepción:\nhttps://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d576550.8830327634!2d-66.40967744692608!3d-17.67692788957749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e30b79d780632f%3A0x17bed94d35fc6ab1!2sLA%20VI%C3%91A%20(Quillacollo)!5e1!3m2!1ses!2sbo!4v1784246533184!5m2!1ses!2sbo \n\n¡Te esperamos!";
  const urlWhatsapp = "https://wa.me/591" + celular + "?text=" + encodeURIComponent(mensaje);
  window.open(urlWhatsapp, "_blank");
}

// --- LÓGICA DE FOTOS ---
function verificarFechaFoto(evento) {
  var ahora = new Date();
  if (ahora < FECHA_HABILITACION_FOTOS) {
    evento.preventDefault(); 
    alert("¡Guarda tus mejores ángulos! La subida de fotos se habilitará el 18 de septiembre a las 15:45 hrs.");
  }
}

function prepararInputsFoto() {
  var inputGaleria = document.getElementById("subirFoto");
  var inputCamara = document.getElementById("tomarFoto");
  [inputGaleria, inputCamara].forEach(function (input) {
    if (!input) return;
    input.addEventListener("change", function () {
      fotoSeleccionada = input.files[0] || null;
      if (fotoSeleccionada) {
        var mensaje = document.getElementById("mensajeFoto");
        mensaje.innerText = "Foto lista: " + fotoSeleccionada.name;
        mensaje.style.color = "var(--azul-profundo)";
      }
    });
  });
}

function procesarFoto() {
  var ahora = new Date();
  var mensaje = document.getElementById("mensajeFoto");
  if (ahora < FECHA_HABILITACION_FOTOS) { mensaje.innerText = "Sube tus fotos a partir de las 15:45 del día de la boda."; mensaje.style.color = "var(--salmon-oscuro)"; return; }
  var archivo = fotoSeleccionada;
  if (!archivo) { mensaje.innerText = "Por favor, selecciona una foto primero."; mensaje.style.color = "var(--salmon-oscuro)"; return; }
  if (archivo.size > 4000000) { mensaje.innerText = "El archivo es muy pesado (Máximo 4MB)."; return; }

  var lector = new FileReader();
  mensaje.innerText = "Subiendo recuerdo..."; mensaje.style.color = "var(--azul-acento)";

  lector.onload = function (evento) {
    var datos = { tipo: "foto", nombreArchivo: archivo.name, archivoB64: evento.target.result };
    fetch(URL_FOTOS, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
    .then(function () {
      mensaje.innerText = "¡Foto agregada al álbum!"; mensaje.style.color = "green";
      agregarFotoAGaleria(evento.target.result, archivo.name); limpiarFotos();
    })
    .catch(function () { mensaje.innerText = "Fallo en la subida. Vuelve a intentarlo."; mensaje.style.color = "red"; });
  };
  lector.readAsDataURL(archivo);
}

function agregarFotoAGaleria(src, nombre) {
  var galeria = document.getElementById("galeriaFotos");
  var img = document.createElement("img"); img.src = src; img.alt = "Recuerdo boda"; galeria.prepend(img); 
}

function limpiarFotos() {
  fotoSeleccionada = null;
  if(document.getElementById("subirFoto")) document.getElementById("subirFoto").value = "";
  if(document.getElementById("tomarFoto")) document.getElementById("tomarFoto").value = "";
}
