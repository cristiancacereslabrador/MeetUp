document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("#ubicacion-meeti")) {
    mostrarMapa();
  }
});

function mostrarMapa() {
  const lat = document.querySelector("#lat").value || 7.7736305;
  // const lat = 7.7736305;
  const lng = document.querySelector("#lng").value || -72.2220345;
  // const lng = -72.2220345;
  const direccion = document.querySelector("#direccion").value;

  const map = L.map("ubicacion-meeti").setView([lat, lng], 16);
  // let markers = new L.FeatureGroup().addTo(map);
  let marker;

  // var map = L.map("map").setView([lat, lng], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([lat, lng]).addTo(map).bindPopup(direccion).openPopup();
}
