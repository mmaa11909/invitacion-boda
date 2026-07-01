var URL_SERVIDOR_GOOGLE = "https://script.google.com/macros/s/AKfycbwN4p7bHI2VbinITdjffPGoOQzQxpscdZLjkTXjn4d6BTHbX3wkD9nzGbOHYWe55FB_hA/exec";

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

    // Usamos mode: 'no-cors' para evitar el bloqueo del navegador
    fetch(URL_SERVIDOR_GOOGLE, {
        method: 'POST',
        mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(function() {
        // Al usar no-cors, asumimos éxito tras el envío
        document.getElementById('mensajeConfirmacion').style.display = 'block';
        document.getElementById('mensajeConfirmacion').innerText = "¡Confirmado con éxito!";
        document.getElementById('formularioAsistencia').reset();
    })
    .catch(function(error) {
        console.error("Error en la conexión:", error);
        alert("Hubo un error al enviar. Intenta de nuevo.");
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
    
    if (archivo.size > 4000000) {
        mensaje.innerText = "La foto es muy pesada. Máximo 4MB.";
        mensaje.style.color = "red";
        return;
    }

    var lector = new FileReader();
    mensaje.innerText = "Subiendo archivo...";
    
    lector.onload = function(evento) {
        var datos = {
            tipo: "foto",
            nombreArchivo: archivo.name,
            archivoB64: evento.target.result
        };

        fetch(URL_SERVIDOR_GOOGLE, {
            method: 'POST',
            mode: 'no-cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(function() {
            mensaje.innerText = "¡Foto subida con éxito!";
            mensaje.style.color = "green";
            // Agregar a galería
            var img = document.createElement('img');
            img.src = evento.target.result;
            img.style.width = "100px"; 
            document.getElementById('galeriaFotos').appendChild(img);
        })
        .catch(function(error) {
            console.error("Error al subir:", error);
            mensaje.innerText = "Error al subir la foto.";
        });
    };
    
    lector.readAsDataURL(archivo);
}
