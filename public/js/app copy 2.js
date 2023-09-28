import { OpenStreetMapProvider } from "leaflet-geosearch";
///MEJORA////////////////////////////////////////////////
// instancia
const geocoding = require("esri-leaflet-geocoder");
// usando la instancia
const geocodeService = geocoding.geocodeService();
///MEJORA////////////////////////////////////////////////
const lat = 7.7736305;
const lng = -72.2220345;
const map = L.map("mapa").setView([lat, lng], 13);
let markers = new L.FeatureGroup().addTo(map);
let marker;

document.addEventListener("DOMContentLoaded", function () {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  //Buscar la direccion
  const buscador = document.querySelector("#formbuscador");
  buscador.addEventListener("input", buscarDireccion);
});

function buscarDireccion(e) {
  if (e.target.value.length > 8) {
    // console.log("buscando e.target.value", e.target.value);
    //Si existe un pin anterior limpiarlo
    markers.clearLayers();
    //Utilizar el provider y GeoCoder
    // // const geocodeService = L.esri.Geocoding.geocodeService();
    const geocodeService = geocoding.geocodeService();
    const provider = new OpenStreetMapProvider();
    console.log("provider", provider);
    provider.search({ query: e.target.value }).then((resultado) => {
      llenarInputs(result);

      geocodeService
        .reverse()
        .latlng(resultado[0].bounds[0], 15)
        .run(function (error, result) {
          console.log("result", result);
          //Mostrar el mapa
          map.setView(resultado[0].bounds[0], 15);
          //Agregar el pin
          marker = new L.marker(resultado[0].bounds[0], {
            draggable: true,
            autoPan: true,
          })
            .addTo(map)
            .bindPopup(resultado[0].label)
            .openPopup();
          //Asignar a contenedor
          // markers.addLayer(marker);
          //Detectar el movimiento del market
          marker.on("moveend", function (e) {
            marker = e.target;
            console.log("marker", marker);
            console.log("marker.getLatLng", marker.getLatLng());
            const posicion = marker.getLatLng();
            map.panTo(new L.LatLng(posicion.lat, posicion.lng));

            //Para llenar los inputs
            llenarInputs(result);
            //Reverse geocoding, cuando el usuario reubica el pin
            try {
              geocodeService
                .reverse()
                .latlng(posicion, 15)
                .run(function (error, result) {
                  console.log("result2:", result);
                });
            } catch (error) {
              console.log("puto error", error);
            }

            /////
          });
        });
    });
  }
}

function llenarInputs(resultado) {
  console.log("resultado", resultado);
}

// Agrega una capa de mosaico (tiles) para mostrar el mapa base (por ejemplo, OpenStreetMap).

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

// // // Agrega un marcador en una ubicación específica.
// var marker = L.marker([lat, lng]).addTo(map);

// // // Agrega un popup al marcador.
// marker.bindPopup("<b>Hello World!</b><br>I am a popup.").openPopup();
