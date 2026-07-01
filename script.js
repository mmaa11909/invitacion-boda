// =====================================================================
// ENLACE A LA BASE DE DATOS (GOOGLE SHEETS / APPS SCRIPT)
// Pega aquí la URL que obtienes al "Implementar" tu código en Google Apps Script.
// Ejemplo: "https://script.google.com/macros/s/AKfycb.../exec"
// =====================================================================
var URL_SERVIDOR_GOOGLE = "PEGA_TU_URL_DE_APPS_SCRIPT_AQUI";

function confirmarAsistencia() {
    var nombre = document.getElementById('nombreCompleto').value;
    var cantidad = document.getElementById('cantidadAdultos').value;

    if (nombre === "" || cantidad === "") {
        alert("Por favor completa los campos.");
        return;
    }

    var datos = {
        tipo: "asistencia",
        nombre: nombre,
        adultos: cantidad
    };

    // Enviar datos al servidor de Google
    fetch(URL_SERVIDOR_GOOGLE, {
        method: 'POST',
        body: JSON.stringify(datos)
    })
    .then(function(respuesta) {
        return respuesta.json();
    })
    .then(function(resultado) {
        if (resultado.status === "success") {
            document.getElementById('mensajeConfirmacion').style.display = 'block';
            document.getElementById('formularioAsistencia').reset();
        }
    })
    .catch(function(error) {
        console.error("Error en la conexión:", error);
    });
}

function procesarFoto() {
    var inputFoto = document.getElementById('subirFoto');
    var mensaje = document.getElementById('mensajeFoto');

    if (inputFoto.files.length === 0) {
        mensaje.innerText = "Selecciona una foto primero.";
        mensaje.style.color = "red";
        return;
    }

    var archivo = inputFoto.files[0];
    
    // Validación de peso máximo para no saturar el servidor gratuito (Ej: 4MB)
    if (archivo.size > 4000000) {
        mensaje.innerText = "La foto es muy pesada. Máximo 4MB.";
        mensaje.style.color = "red";
        return;
    }

    var lector = new FileReader();
    mensaje.innerText = "Subiendo archivo a Google Drive...";
    mensaje.style.color = "#d4af37";
    
    lector.onload = function(evento) {
        var datos = {
            tipo: "foto",
            nombreArchivo: archivo.name,
            mimeType: archivo.type,
            archivoB64: evento.target.result
        };

        fetch(URL_SERVIDOR_GOOGLE, {
            method: 'POST',
            body: JSON.stringify(datos)
        })
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(resultado) {
            if (resultado.status === "success") {
                mensaje.innerText = "¡Foto subida con éxito al álbum!";
                mensaje.style.color = "green";
                
                // Mostrar la foto en la galería HTML
                var img = document.createElement('img');
                img.src = datos.archivoB64;
                document.getElementById('galeriaFotos').appendChild(img);
            } else {
                mensaje.innerText = "Error al subir la foto.";
                mensaje.style.color = "red";
            }
        })
        .catch(function(error) {
            console.error("Error al subir:", error);
        });
    };
    
    lector.readAsDataURL(archivo);
}