const NOMBRE_BASE_DATOS = "PortafolioRoberth";
const VERSION_BASE_DATOS = 1;
const NOMBRE_TABLA = "archivos";


function abrirBaseDatos() {

    return new Promise(function(resolve, reject) {

        const solicitud = indexedDB.open(
            NOMBRE_BASE_DATOS,
            VERSION_BASE_DATOS
        );

        solicitud.onupgradeneeded = function(evento) {

            const baseDatos = evento.target.result;

            if (!baseDatos.objectStoreNames.contains(NOMBRE_TABLA)) {

                const tabla = baseDatos.createObjectStore(
                    NOMBRE_TABLA,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

                tabla.createIndex(
                    "curso",
                    "curso",
                    { unique: false }
                );

                tabla.createIndex(
                    "unidad",
                    "unidad",
                    { unique: false }
                );
            }
        };

        solicitud.onsuccess = function(evento) {
            resolve(evento.target.result);
        };

        solicitud.onerror = function() {
            reject(solicitud.error);
        };

    });

}


/* GUARDAR ARCHIVO */

function guardarArchivo(baseDatos, archivo, curso, unidad) {

    return new Promise(function(resolve, reject) {

        const transaccion = baseDatos.transaction(
            NOMBRE_TABLA,
            "readwrite"
        );

        const tabla = transaccion.objectStore(NOMBRE_TABLA);

        const datos = {
            nombre: archivo.name,
            tipo: archivo.type,
            tamaño: archivo.size,
            archivo: archivo,
            curso: curso,
            unidad: unidad,
            fecha: new Date().toISOString()
        };

        const solicitud = tabla.add(datos);

        solicitud.onsuccess = function() {
            resolve();
        };

        solicitud.onerror = function() {
            reject(solicitud.error);
        };

    });

}


/* OBTENER ARCHIVOS DE UNA UNIDAD */

function obtenerArchivos(baseDatos, curso, unidad) {

    return new Promise(function(resolve, reject) {

        const transaccion = baseDatos.transaction(
            NOMBRE_TABLA,
            "readonly"
        );

        const tabla = transaccion.objectStore(NOMBRE_TABLA);

        const solicitud = tabla.getAll();

        solicitud.onsuccess = function() {

            const todos = solicitud.result;

            const archivos = todos.filter(function(item) {

                return item.curso === curso &&
                       item.unidad === unidad;

            });

            resolve(archivos);
        };

        solicitud.onerror = function() {
            reject(solicitud.error);
        };

    });

}


/* ELIMINAR ARCHIVO */

function eliminarArchivo(baseDatos, id) {

    return new Promise(function(resolve, reject) {

        const transaccion = baseDatos.transaction(
            NOMBRE_TABLA,
            "readwrite"
        );

        const tabla = transaccion.objectStore(NOMBRE_TABLA);

        const solicitud = tabla.delete(id);

        solicitud.onsuccess = function() {
            resolve();
        };

        solicitud.onerror = function() {
            reject(solicitud.error);
        };

    });

}


/* MOSTRAR ARCHIVOS */

function mostrarArchivos(baseDatos, curso, unidad, contenedor) {

    obtenerArchivos(
        baseDatos,
        curso,
        unidad
    ).then(function(archivos) {

        contenedor.innerHTML = "";

        if (archivos.length === 0) {

            contenedor.textContent =
                "Ningún archivo seleccionado";

            return;
        }


        archivos.forEach(function(item) {

            const caja = document.createElement("div");

            caja.style.marginTop = "10px";
            caja.style.padding = "10px";
            caja.style.background = "#1b1b1b";
            caja.style.borderRadius = "10px";


            const nombre = document.createElement("div");

            nombre.style.wordBreak = "break-word";
            nombre.style.marginBottom = "8px";


            const icono = document.createElement("i");

            icono.className = "fa-solid fa-file";
            icono.style.color = "#b74b4b";
            icono.style.marginRight = "7px";


            const texto = document.createElement("span");

            texto.textContent = item.nombre;


            nombre.appendChild(icono);
            nombre.appendChild(texto);


            /* BOTÓN ABRIR */

            const botonAbrir = document.createElement("button");

            botonAbrir.textContent = "Abrir";

            botonAbrir.style.background = "#b74b4b";
            botonAbrir.style.color = "white";
            botonAbrir.style.border = "none";
            botonAbrir.style.padding = "6px 12px";
            botonAbrir.style.borderRadius = "15px";
            botonAbrir.style.cursor = "pointer";
            botonAbrir.style.marginRight = "5px";


            botonAbrir.onclick = function() {

                const url = URL.createObjectURL(
                    item.archivo
                );

                window.open(url, "_blank");

            };


            /* BOTÓN ELIMINAR */

            const botonEliminar = document.createElement("button");

            botonEliminar.textContent = "Eliminar";

            botonEliminar.style.background = "#333";
            botonEliminar.style.color = "white";
            botonEliminar.style.border = "none";
            botonEliminar.style.padding = "6px 12px";
            botonEliminar.style.borderRadius = "15px";
            botonEliminar.style.cursor = "pointer";


            botonEliminar.onclick = function() {

                const confirmar = confirm(
                    "¿Quieres eliminar este archivo?"
                );

                if (!confirmar) {
                    return;
                }

                eliminarArchivo(
                    baseDatos,
                    item.id
                ).then(function() {

                    mostrarArchivos(
                        baseDatos,
                        curso,
                        unidad,
                        contenedor
                    );

                });

            };


            caja.appendChild(nombre);
            caja.appendChild(botonAbrir);
            caja.appendChild(botonEliminar);

            contenedor.appendChild(caja);

        });

    });

}


/* INICIAR TODO */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        abrirBaseDatos().then(function(baseDatos) {

            const curso =
                document.body.dataset.curso;

            const unidades =
                document.querySelectorAll(".unidad");


            unidades.forEach(function(unidadElemento, indice) {

                const numeroUnidad =
                    String(indice + 1);

                const input =
                    unidadElemento.querySelector(
                        'input[type="file"]'
                    );

                const contenedor =
                    unidadElemento.querySelector(
                        ".archivo"
                    );


                /* MOSTRAR ARCHIVOS GUARDADOS */

                mostrarArchivos(
                    baseDatos,
                    curso,
                    numeroUnidad,
                    contenedor
                );


                /* CUANDO SE SUBE UN ARCHIVO */

                input.addEventListener(
                    "change",
                    function() {

                        const archivos =
                            Array.from(input.files);


                        if (archivos.length === 0) {
                            return;
                        }


                        const promesas =
                            archivos.map(function(archivo) {

                                return guardarArchivo(
                                    baseDatos,
                                    archivo,
                                    curso,
                                    numeroUnidad
                                );

                            });


                        Promise.all(promesas)
                            .then(function() {

                                input.value = "";

                                mostrarArchivos(
                                    baseDatos,
                                    curso,
                                    numeroUnidad,
                                    contenedor
                                );

                            })
                            .catch(function(error) {

                                console.error(
                                    "Error al guardar:",
                                    error
                                );

                                alert(
                                    "No se pudo guardar el archivo."
                                );

                            });

                    }
                );

            });

        }).catch(function(error) {

            console.error(
                "Error con IndexedDB:",
                error
            );

            alert(
                "No se pudo iniciar el almacenamiento."
            );

        });

    }
);