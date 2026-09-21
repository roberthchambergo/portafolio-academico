/* =========================================================
   CONFIGURACIÓN DE GITHUB
   ========================================================= */

const GITHUB_USUARIO = "TU_USUARIO";
const GITHUB_REPOSITORIO = "TU_REPOSITORIO";


/* =========================================================
   OBTENER UNIDAD DESDE LA PÁGINA
   ========================================================= */

function obtenerUnidad() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    return parametros.get("unidad") || "1";
}


/* =========================================================
   OBTENER SEMANA DESDE LA PÁGINA
   ========================================================= */

function obtenerSemana() {

    const parametros = new URLSearchParams(
        window.location.search
    );

    return parametros.get("semana") || "1";
}


/* =========================================================
   OBTENER CURSO
   ========================================================= */

function obtenerCurso() {

    return document.body.dataset.curso ||
           "taller-viii";

}


/* =========================================================
   CREAR RUTA DE GITHUB
   ========================================================= */

function obtenerRutaGitHub() {

    const curso = obtenerCurso();
    const unidad = obtenerUnidad();
    const semana = obtenerSemana();

    return (
        "archivos/" +
        curso +
        "/unidad" +
        unidad +
        "/semana" +
        semana
    );

}


/* =========================================================
   CARGAR ARCHIVOS DESDE GITHUB
   ========================================================= */

async function obtenerArchivosGitHub() {

    const ruta = obtenerRutaGitHub();

    const url =
        "https://api.github.com/repos/" +
        GITHUB_USUARIO +
        "/" +
        GITHUB_REPOSITORIO +
        "/contents/" +
        ruta;


    try {

        const respuesta = await fetch(url);


        if (!respuesta.ok) {

            throw new Error(
                "No se encontraron archivos."
            );

        }


        const archivos = await respuesta.json();


        return archivos.filter(function(item) {

            return item.type === "file";

        });


    } catch (error) {

        console.error(
            "Error al obtener archivos:",
            error
        );

        return [];

    }

}


/* =========================================================
   OBTENER ICONO SEGÚN TIPO DE ARCHIVO
   ========================================================= */

function obtenerIcono(nombre) {

    const extension =
        nombre
            .split(".")
            .pop()
            .toLowerCase();


    if (extension === "pdf") {

        return "fa-file-pdf";

    }


    if (
        extension === "jpg" ||
        extension === "jpeg" ||
        extension === "png" ||
        extension === "gif" ||
        extension === "webp"
    ) {

        return "fa-file-image";

    }


    if (
        extension === "doc" ||
        extension === "docx"
    ) {

        return "fa-file-word";

    }


    if (
        extension === "xls" ||
        extension === "xlsx"
    ) {

        return "fa-file-excel";

    }


    if (
        extension === "ppt" ||
        extension === "pptx"
    ) {

        return "fa-file-powerpoint";

    }


    if (
        extension === "zip" ||
        extension === "rar"
    ) {

        return "fa-file-zipper";

    }


    if (
        extension === "html" ||
        extension === "css" ||
        extension === "js"
    ) {

        return "fa-file-code";

    }


    return "fa-file";

}


/* =========================================================
   MOSTRAR ARCHIVOS
   ========================================================= */

async function mostrarArchivos(contenedor) {

    if (!contenedor) {
        return;
    }


    contenedor.innerHTML =
        "<p>Cargando archivos...</p>";


    const archivos =
        await obtenerArchivosGitHub();


    contenedor.innerHTML = "";


    if (archivos.length === 0) {

        contenedor.innerHTML =
            "<p>No hay archivos disponibles.</p>";

        return;

    }


    archivos.forEach(function(item) {

        const caja =
            document.createElement("div");


        caja.style.marginTop = "10px";
        caja.style.padding = "12px";
        caja.style.background = "#1b1b1b";
        caja.style.borderRadius = "10px";
        caja.style.display = "flex";
        caja.style.alignItems = "center";
        caja.style.justifyContent = "space-between";
        caja.style.gap = "10px";
        caja.style.flexWrap = "wrap";


        /* ===============================
           NOMBRE DEL ARCHIVO
           =============================== */

        const nombre =
            document.createElement("div");


        nombre.style.wordBreak =
            "break-word";

        nombre.style.flex = "1";


        const icono =
            document.createElement("i");


        icono.className =
            "fa-solid " +
            obtenerIcono(item.name);


        icono.style.color =
            "#b74b4b";


        icono.style.marginRight =
            "8px";


        const texto =
            document.createElement("span");


        texto.textContent =
            item.name;


        nombre.appendChild(icono);
        nombre.appendChild(texto);


        /* ===============================
           CONTENEDOR DE BOTONES
           =============================== */

        const botones =
            document.createElement("div");


        /* ===============================
           BOTÓN ABRIR
           =============================== */

        const botonAbrir =
            document.createElement("a");


        botonAbrir.textContent =
            "Abrir";


        botonAbrir.href =
            item.download_url;


        botonAbrir.target =
            "_blank";


        botonAbrir.rel =
            "noopener noreferrer";


        botonAbrir.style.background =
            "#b74b4b";


        botonAbrir.style.color =
            "white";


        botonAbrir.style.textDecoration =
            "none";


        botonAbrir.style.display =
            "inline-block";


        botonAbrir.style.padding =
            "6px 12px";


        botonAbrir.style.borderRadius =
            "15px";


        botonAbrir.style.marginRight =
            "5px";


        /* ===============================
           BOTÓN DESCARGAR
           =============================== */

        const botonDescargar =
            document.createElement("a");


        botonDescargar.textContent =
            "Descargar";


        botonDescargar.href =
            item.download_url;


        botonDescargar.download =
            item.name;


        botonDescargar.style.background =
            "#333";


        botonDescargar.style.color =
            "white";


        botonDescargar.style.textDecoration =
            "none";


        botonDescargar.style.display =
            "inline-block";


        botonDescargar.style.padding =
            "6px 12px";


        botonDescargar.style.borderRadius =
            "15px";


        /* ===============================
           AGREGAR ELEMENTOS
           =============================== */

        botones.appendChild(
            botonAbrir
        );


        botones.appendChild(
            botonDescargar
        );


        caja.appendChild(
            nombre
        );


        caja.appendChild(
            botones
        );


        contenedor.appendChild(
            caja
        );

    });

}


/* =========================================================
   INICIAR
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const contenedores =
            document.querySelectorAll(
                ".archivo"
            );


        contenedores.forEach(
            function(contenedor) {

                mostrarArchivos(
                    contenedor
                );

            }
        );

    }
);