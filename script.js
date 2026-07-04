// --- CONFIGURACIÓN DE RUTAS ---
var URL_ASISTENCIA = "https://script.google.com/macros/s/AKfycbwN4p7bHI2VbinITdjffPGoOQzQxpscdZLjkTXjn4d6BTHbX3wkD9nzGbOHYWe55FB_hA/exec";
var URL_FOTOS = "https://script.google.com/macros/s/AKfycbzqAmczsKY0dzkIlqpIy0Df8wZAZi4qfr8vG582E6I7-yVtsBjiF3CA96xCEPBkumfOSA/exec";

var FECHA_BODA = new Date("2026-09-18T19:30:00-04:00");
var fotoSeleccionada = null;

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", function () {
  iniciarContador();
  prepararAnimaciones();
  prepararInputsFoto();
});

// --- MÚSICA (NUEVA LÓGICA INTELIGENTE) ---
var audio = document.getElementById("musicaBoda");
var boton = document.querySelector(".boton-musica");

function reproducirAutonomo() {
  if (!audio) return;
  audio.play().then(function () {
    if (boton) boton.classList.add("activa");
    // Si ya logró sonar, removemos los listeners de interacción para no saturar memoria
    document.removeEventListener('click', reproducirAutonomo);
    document.removeEventListener('touchstart', reproducirAutonomo);
  }).catch(function (error) {
    console.log("El navegador bloqueó el autoplay. Esperando clic...");
  });
}

// 1. Intentos de inicio automático al cargar o al primer clic
window.addEventListener('load', reproducirAutonomo);
document.addEventListener('click', reproducirAutonomo);
document.addEventListener('touchstart', reproducirAutonomo); // Para teléfonos móviles

// 2. Control de Visibilidad: Pausar al salir de la página
document.addEventListener("visibilitychange", function() {
  if (document.hidden) {
    if (audio) audio.pause();
  } else {
    // Si regresa, forzamos reproducción autónoma
    reproducirAutonomo();
  }
});

// 3. Control manual del botón
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

// --- ANIMACIONES (Intersection Observer) ---
function prepararAnimaciones() {
  var secciones = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    secciones.forEach(function (seccion) {
      seccion.classList.add("visible");
    });
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.18
  });

  secciones.forEach(function (seccion) {
    observador.observe(seccion);
  });
}

// --- ASISTENCIA ---
function confirmarAsistencia() {
  var nombre = document.getElementById("nombreCompleto").value.trim();
  var boton = document.getElementById("botonConfirmar");

  if (nombre === "") {
    alert("Por favor escribe tu nombre completo.");
    return;
  }

  var datos = {
    tipo: "asistencia",
    nombre: nombre
  };

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
    console.error("Error en la conexión:", error);
    alert("Hubo un error al enviar. Intenta de nuevo.");
    boton.disabled = false;
    boton.innerText = "Confirmar asistencia";
  });
}

function mostrarPaginaConfirmacion() {
  var paginaInvitacion = document.getElementById("paginaInvitacion");
  var paginaConfirmacion = document.getElementById("paginaConfirmacion");

  paginaInvitacion.style.display = "none";
  paginaConfirmacion.classList.remove("oculto");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- MANEJO DE FOTOS ---
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
        mensaje.style.color = "#153c68";
      }
    });
  });
}

function procesarFoto() {
  var mensaje = document.getElementById("mensajeFoto");
  var archivo = fotoSeleccionada;

  if (!archivo) {
    mensaje.innerText = "Selecciona una foto o toma una desde tu celular primero.";
    mensaje.style.color = "#b4334b";
    return;
  }

  if (archivo.size > 4000000) {
    mensaje.innerText = "La foto es muy pesada. Máximo 4MB.";
    mensaje.style.color = "#b4334b";
    return;
  }

  var lector = new FileReader();

  mensaje.innerText = "Subiendo archivo a la nube...";
  mensaje.style.color = "#153c68";

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
      mensaje.innerText = "¡Foto subida con éxito al álbum!";
      mensaje.style.color = "#1f6f56";
      agregarFotoAGaleria(evento.target.result, archivo.name);
      limpiarFotos();
    })
    .catch(function (error) {
      console.error("Error al subir:", error);
      mensaje.innerText = "Error al subir la foto. Intenta otra vez.";
      mensaje.style.color = "#b4334b";
    });
  };

  lector.readAsDataURL(archivo);
}

function agregarFotoAGaleria(src, nombre) {
  var galeria = document.getElementById("galeriaFotos");
  var divWrapper = document.createElement("div");
  var img = document.createElement("img");

  img.src = src;
  img.alt = nombre || "Foto subida por invitado";
  
  divWrapper.appendChild(img);
  galeria.prepend(divWrapper); 
}

function limpiarFotos() {
  fotoSeleccionada = null;
  var inputGaleria = document.getElementById("subirFoto");
  var inputCamara = document.getElementById("tomarFoto");
  
  if(inputGaleria) inputGaleria.value = "";
  if(inputCamara) inputCamara.value = "";
}
