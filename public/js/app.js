import { OpenStreetMapProvider } from "leaflet-geosearch";
import asistencia from "./asistencia";
import eliminarComentario from "./eliminarComentario";

const lat = document.querySelector("#lat").value || 7.7736305;
const lng = document.querySelector("#lng").value || -72.2220345;
const map = L.map("mapa").setView([lat, lng], 13);
let markers = new L.FeatureGroup().addTo(map);
let marker;

document.addEventListener("DOMContentLoaded", function () {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Crear el marcador original sin contenido de popup
  marker = new L.marker([lat, lng], {
    draggable: true,
    autoPan: true,
  }).addTo(map);

  // Bind an empty popup to the marker
  marker.bindPopup("").openPopup();

  // Realizar reverse geocoding para la ubicación inicial
  const provider = new OpenStreetMapProvider();
  provider
    .search({ query: `${lat}, ${lng}` })
    .then((results) => {
      if (results && results.length > 0) {
        // Para llenar los inputs
        llenarInputs(results);
        const direccion = results[0].label;
        // console.log("Dirección obtenida:", direccion);
        // console.log("Dirección objeto completo:", results);
        marker.setPopupContent(direccion).openPopup(); // Set and open the popup with the address
      } else {
        console.log("No se pudo obtener la dirección.");
      }
    })
    .catch((error) => {
      console.error("Error al realizar el reverse geocoding:", error);
    });

  // Handle the dragend event to perform reverse geocoding when marker is moved
  marker.on("dragend", function () {
    const posicion = marker.getLatLng();

    // Realizar reverse geocoding con Leaflet-geosearch
    provider
      .search({ query: `${posicion.lat}, ${posicion.lng}` })
      .then((results) => {
        if (results && results.length > 0) {
          // Para llenar los inputs
          llenarInputs(results);
          const direccion = results[0].label;
          // console.log("Dirección obtenida:", direccion);
          // console.log("Dirección objeto completo:", results);
          marker.setPopupContent(direccion).openPopup(); // Set and open the popup with the address
        } else {
          console.log("No se pudo obtener la dirección.");
        }
      })
      .catch((error) => {
        console.error("Error al realizar el reverse geocoding:", error);
      });
  });

  // Buscar la dirección
  const buscador = document.querySelector("#formbuscador");
  buscador.addEventListener("input", buscarDireccion);
});

function buscarDireccion(e) {
  if (e.target.value.length > 8) {
    // Si existe un pin anterior, limpiarlo
    markers.clearLayers();

    // Utilizar el provider de Leaflet-geosearch
    const provider = new OpenStreetMapProvider();
    provider.search({ query: e.target.value }).then((resultado) => {
      // Para llenar los inputs
      llenarInputs(resultado);
      // Mostrar el mapa
      map.setView(resultado[0].bounds[0], 13);

      // Actualizar la posición del marcador original
      marker.setLatLng(resultado[0].bounds[0]);

      // Obtener la dirección
      const direccion = resultado[0].label;

      // Agregar el popup al marcador con la dirección
      marker.setPopupContent(direccion).openPopup();
    });
  }
}

function llenarInputs(resultado) {
  // console.log("resultado", resultado);
  const label = resultado[0].label; // Assuming you have results[0].label as your input

  // Split the label into an array of parts using ', ' as the separator
  const parts = label.split(", ");

  // Extract the individual components
  const pais = parts.pop(); // Remove and get the last element as "País"
  const estado = parts[parts.length - 2].replace(/^(Estado|Estado\sde)\s/i, "");
  const ciudad = parts[parts.length - 3].replace(
    /^(Municipio|Municipio\sde)\s/i,
    ""
  );

  // Join the first two parts to form "Dirección"
  const direccion = parts.slice(0, 2).join(", ");

  // console.log("Dirección:", direccion);
  // console.log("Ciudad:", ciudad);
  // console.log("Estado:", estado);
  // console.log("País:", pais);
  document.querySelector("#direccion").value = direccion || "";
  document.querySelector("#ciudad").value = ciudad || "";
  document.querySelector("#estado").value = estado || "";
  document.querySelector("#pais").value = pais || "";
  document.querySelector("#lat").value = resultado[0].y || "";
  document.querySelector("#lng").value = resultado[0].x || "";
}
