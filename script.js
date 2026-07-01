var URL_SERVIDOR_GOOGLE = "https://script.google.com/macros/s/AKfycbwN4p7bHI2VbinITdjffPGoOQzQxpscdZLjkTXjn4d6BTHbX3wkD9nzGbOHYWe55FB_hA/exec";

var FECHA_BODA = new Date("2026-09-18T19:30:00-04:00");
var fotoSeleccionada = null;

document.addEventListener("DOMContentLoaded", function () {
  iniciarContador();
  prepararAnimaciones();
  prepararInputsFoto();
});

function controlarMusica() {
  var audio = document.getElementById("musicaBoda");
  var boton = document.querySelector(".boton-musica");

  if (audio.paused) {
    audio.play().then(function () {
      boton.classList.add("activa");
    }).catch(function () {
      alert("Toca nuevamente para activar la música.");
    });
  } else {
    audio.pause();
    boton.classList.remove("activa");
  }
}

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

function confirmarAsistencia() {
  var nombre = document.getElementById("nombreCompleto").value.trim();
  var cantidad = document.getElementById("cantidadAdultos").value;
  var boton = document.getElementById("botonConfirmar");
  var mensaje = document.getElementById("mensajeConfirmacion");

  if (nombre === "" || cantidad === "") {
    alert("Por favor completa los campos.");
    return;
  }

  var datos = {
    tipo: "asistencia",
    nombre: nombre,
    adultos: cantidad
  };

  boton.disabled = true;
  boton.innerText = "Enviando...";

  fetch(URL_SERVIDOR_GOOGLE, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  })
  .then(function () {
    mensaje.style.display = "block";
    mensaje.innerText = "Asistencia confirmada. ¡Gracias por acompañarnos!";

    boton.innerText = "Asistencia confirmada";
    boton.classList.add("confirmado");

    document.getElementById("formularioAsistencia").reset();
  })
  .catch(function (error) {
    console.error("Error en la conexión:", error);
    alert("Hubo un error al enviar. Intenta de nuevo.");

    boton.disabled = false;
    boton.innerText = "Confirmar asistencia";
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

  mensaje.innerText = "Subiendo archivo...";
  mensaje.style.color = "#153c68";

  lector.onload = function (evento) {
    var datos = {
      tipo: "foto",
      nombreArchivo: archivo.name,
      archivoB64: evento.target.result
    };

    fetch(URL_SERVIDOR_GOOGLE, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    })
    .then(function () {
      mensaje.innerText = "¡Foto subida con éxito!";
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
  var img = document.createElement("img");

  img.src = src;
  img.alt = nombre || "Foto subida por invitado";

  galeria.prepend(img);
}

function limpiarFotos() {
  fotoSeleccionada = null;
  document.getElementById("subirFoto").value = "";
  document.getElementById("tomarFoto").value = "";
}
