// --- CONFIGURACIÓN DE RUTAS ---
var URL_ASISTENCIA = "https://script.google.com/macros/s/AKfycbwN4p7bHI2VbinITdjffPGoOQzQxpscdZLjkTXjn4d6BTHbX3wkD9nzGbOHYWe55FB_hA/exec";
var URL_FOTOS = "https://script.google.com/macros/s/AKfycbzqAmczsKY0dzkIlqpIy0Df8wZAZi4qfr8vG582E6I7-yVtsBjiF3CA96xCEPBkumfOSA/exec";

// HORA ACTUALIZADA: 15:45 hrs (3:45 PM)
var FECHA_BODA = new Date("2026-09-18T15:45:00-04:00");
// HORA HABILITACIÓN FOTOS: 15:45 hrs del día de la boda
var FECHA_HABILITACION_FOTOS = new Date("2026-09-18T15:45:00-04:00"); 

var fotoSeleccionada = null;

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", function () {
  iniciarContador();
  prepararAnimaciones();
  prepararInputsFoto();
  generarFloresCayendo();
});

// --- GENERAR FLORES ---
function generarFloresCayendo() {
  const contenedor = document.getElementById("contenedorFlores");
  if (!contenedor) return;
  
  const colores = ['#F9D0C4', '#E89B8C', '#EFE4D3']; // Salmon claro, Salmon oscuro, Champagne
  const cantidad = 15; // Cantidad de pétalos en pantalla

  for (let i = 0; i < cantidad; i++) {
    let petalo = document.createElement("div");
    petalo.classList.add("petalo");
    
    // Propiedades aleatorias para naturalidad
    petalo.style.left = Math.random() * 100 + "vw";
    petalo.style.animationDuration = (Math.random() * 6 + 6) + "s";
    petalo.style.animationDelay = (Math.random() * 5) + "s";
    petalo.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
    
    // Tamaños variados
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
  if (audio.paused) {
    audio.play();
    if (boton) boton.classList.add("activa");
  } else {
    audio.pause();
    if (boton) boton.classList.remove("activa");
  }
}

// --- CONTADOR ---
function iniciarContador() {
  actualizarContador();
  setInterval(actualizarContador, 1000);
}

function actualizarContador() {
  var ahora = new Date();
  var distancia = FECHA_BODA.getTime() - ahora.getTime();

  if (distancia <= 0) {
    escribirTiempo("dias", "00");
    escribirTiempo("horas", "00");
    escribirTiempo("minutos", "00");
    escribirTiempo("segundos", "00");
    return;
  }

  var dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
  var horas = Math.floor((distancia / (1000 * 60 * 60)) % 24);
  var minutos = Math.floor((distancia / (1000 * 60)) % 60);
  var segundos = Math.floor((distancia / 1000) % 60);

  escribirTiempo("dias", dias);
  escribirTiempo("horas", horas);
  escribirTiempo("minutos", minutos);
  escribirTiempo("segundos", segundos);
}

function escribirTiempo(id, valor) {
  var elemento = document.getElementById(id);
  if (elemento) {
    elemento.innerText = String(valor).padStart(2, "0");
  }
}

// --- ANIMACIONES FLUIDAS (Scroll) ---
function prepararAnimaciones() {
  var secciones = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    secciones.forEach(s => s.classList.add("visible"));
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });

  secciones.forEach(s => observador.observe(s));
}

// --- CONFIRMACIÓN DE ASISTENCIA ---
function confirmarAsistencia() {
  var nombre = document.getElementById("nombreCompleto").value.trim();
  var boton = document.getElementById("botonConfirmar");

  if (nombre === "") {
    alert("Por favor escribe tu nombre completo.");
    return;
  }

  var datos = { tipo: "asistencia", nombre: nombre };

  boton.disabled = true;
  boton.innerText = "Enviando...";

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
    alert("No se pudo enviar. Inténtalo de nuevo.");
    boton.disabled = false;
    boton.innerText = "Confirmar asistencia";
  });
}

function mostrarPaginaConfirmacion() {
  if (audio) {
    audio.pause();
    if (boton) boton.classList.remove("activa");
  }

  document.getElementById("paginaInvitacion").style.display = "none";
  document.getElementById("paginaConfirmacion").classList.remove("oculto");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- ENVIAR MAPAS AL CELULAR (WhatsApp Bolivia) ---
function enviarMapasCelular() {
  var celular = document.getElementById("celularMapa").value.trim();
  
  // Expresión regular para validar números de Bolivia (8 dígitos, inician con 6 o 7)
  var regexBolivia = /^[67]\d{7}$/;

  if (!regexBolivia.test(celular)) {
    alert("Por favor, ingresa un número de celular válido de Bolivia (8 dígitos que comiencen con 6 o 7).");
    return;
  }

  const mensaje = "¡Hola! Te comparto la información de la boda:\n\n📅 La boda de Ramiro y Janneth es el 18 de septiembre de 2026 a las 15:45 hrs.\n\n📍 Ubicación Iglesia:\nhttps://maps.app.goo.gl/PhbBfAwMVTSq4HfM7\n\n📍 \n\n📍 Ubicación Salón de Convenciones:\nhttps://maps.app.goo.gl/Kfsjnvcr4CRgxQsc6\n\n¡Te \n\n¡Te esperamos!";
  
  // Formato internacional para Bolivia (+591)
  const urlWhatsapp = "https://wa.me/591" + celular + "?text=" + encodeURIComponent(mensaje);
  
  window.open(urlWhatsapp, "_blank");
}

// --- LÓGICA DE FOTOS (Con restricción de fecha) ---
function verificarFechaFoto(evento) {
  var ahora = new Date();
  if (ahora < FECHA_HABILITACION_FOTOS) {
    evento.preventDefault(); 
    alert("¡Guarda tus mejores ángulos! La subida de fotos se habilitará el día de la boda (18 de septiembre a las 15:45 hrs).");
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

  if (ahora < FECHA_HABILITACION_FOTOS) {
    mensaje.innerText = "La subida se habilita el 18 de septiembre a las 15:45 hrs.";
    mensaje.style.color = "var(--salmon)";
    return;
  }

  var archivo = fotoSeleccionada;
  if (!archivo) {
    mensaje.innerText = "Por favor, selecciona una foto primero.";
    mensaje.style.color = "var(--salmon)";
    return;
  }

  if (archivo.size > 4000000) {
    mensaje.innerText = "El archivo es muy pesado (Máximo 4MB).";
    return;
  }

  var lector = new FileReader();
  mensaje.innerText = "Subiendo recuerdo...";
  mensaje.style.color = "var(--azul-acento)";

  lector.onload = function (evento) {
    var datos = {
      tipo: "foto",
      nombreArchivo: archivo.name,
      archivoB64: evento.target.result
    };

    fetch(URL_FOTOS, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    })
    .then(function () {
      mensaje.innerText = "¡Foto agregada al álbum!";
      mensaje.style.color = "green";
      agregarFotoAGaleria(evento.target.result, archivo.name);
      limpiarFotos();
    })
    .catch(function () {
      mensaje.innerText = "Fallo en la subida. Vuelve a intentarlo.";
      mensaje.style.color = "red";
    });
  };

  lector.readAsDataURL(archivo);
}

function agregarFotoAGaleria(src, nombre) {
  var galeria = document.getElementById("galeriaFotos");
  var img = document.createElement("img");
  img.src = src;
  img.alt = "Recuerdo boda";
  galeria.prepend(img); 
}

function limpiarFotos() {
  fotoSeleccionada = null;
  if(document.getElementById("subirFoto")) document.getElementById("subirFoto").value = "";
  if(document.getElementById("tomarFoto")) document.getElementById("tomarFoto").value = "";
}
