import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
  const formsEliminar = document.querySelectorAll(".eliminar-comentario");
  //Revisar que exitan los formularios
  if (formsEliminar.length > 0) {
    formsEliminar.forEach((form) => {
      form.addEventListener("submit", eliminarComentario);
    });
  }
});

function eliminarComentario(e) {
  e.preventDefault();
  // console.log("this.action", this.action);
  Swal.fire({
    title: "¿Eliminar Comentario?",
    text: "Un comentario eliminado no se puede recuperar!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, borrar!",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      //Tomar el id del comentario
      // console.log("this.children", this.children);
      const comentarioId = this.children[0].value;
      // console.log("this.children[0].value", this.children[0].value);
      //Crear el objeto
      const datos = { comentarioId };

      //Ejecutar axios y pasar los datos
      axios
        .post(this.action, datos)
        .then((respuesta) => {
          // console.log("respuesta", respuesta);
          Swal.fire("Eliminado!", respuesta.data, "success");
          //Eliminar del DOm
          this.parentElement.parentElement.remove();
        })
        .catch((error) => {
          console.log("error.response", error.response);
          if (error.response.status === 403 || error.response.status === 404) {
            Swal.fire("Error", error.response.data, "error");
          }
        });
    }
  });
}
