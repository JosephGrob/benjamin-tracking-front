// Initialiser la carte centrée sur l'Atlantique
const map = L.map("map").setView([20, -30], 3);

// --- 1) Fond GEBCO gris ---
const gebcoGray = L.tileLayer(
  "https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_grayscale_basemap_NCEI/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 12,
    opacity: 0.9,
    attribution: "GEBCO & NOAA NCEI"
  }
).addTo(map);

// Fond alternatif clair
const cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; Carto'
  }
);



// --- 2) Groupe pour les traces ---
const tracesGroup = L.layerGroup().addTo(map);


// Petite fonction utilitaire pour ajouter une trace GPX
function addGpx(path, color, name) {
  const gpxLayer = new L.GPX(path, {
    async: true,
    marker_options: {
      startIconUrl: null,
      endIconUrl: null,
      shadowUrl: null
    },
    polyline_options: {
      color: color,
      weight: 3,
      opacity: 0.9
    }
  })
    .on("loaded", function (e) {
      const gpx = e.target;

      // Ajouter la trace au groupe
      tracesGroup.addLayer(gpx);

      // Adapter le zoom à la 1ère trace chargée
      if (tracesGroup.getLayers().length === 1) {
        map.fitBounds(gpx.getBounds());
      }

      // ---- Infos pour la popup ----
      const distanceKm = (gpx.get_distance() / 1000).toFixed(1); // m -> km

      const start = gpx.get_start_time();
      const end = gpx.get_end_time();

      const startStr = start
        ? start.toLocaleDateString("fr-CH")
        : "date inconnue";
      const endStr = end ? end.toLocaleDateString("fr-CH") : "date inconnue";

      const html = `
        <strong>${name}</strong><br>
        Distance : ${distanceKm} km<br>
        Du : ${startStr}<br>
        Au : ${endStr}
      `;

      // On lie la popup au groupe de la trace :
      // un clic sur n'importe quelle portion de la trace ouvrira la popup
      gpx.bindPopup(html);
    })
    .addTo(map);

  gpxLayer.name = name;
}

// --- 3) Ajouter tes deux fichiers GPX ---
// adapte les noms si besoin (trace1.gpx / trace2.gpx)
addGpx("data/trace1.gpx", "#ff6600", "Trace 1");
addGpx("data/trace2.gpx", "#00bcd4", "Trace 2");

// --- 4) Contrôle des couches ---
const baseLayers = {
  "GEBCO gris (NOAA)": gebcoGray,
  "Fond clair (Carto)": cartoLight
};

const overlays = {
  "Traces bateau": tracesGroup
};

L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);

// --- 5) Trace LIVE de Benjamin ---

let liveCoords = [];
let liveLine = null;
let liveMarker = null;

async function updateLiveTrack() {
  try {
    const response = await fetch(
      `${API_BASE}/api/live-track?track_id=live`
    );

    if (!response.ok) {
      console.warn("Réponse non OK du serveur live-track");
      return;
    }

    const data = await response.json();
    if (!data.points || data.points.length === 0) {
      // Pas encore de points : ce n'est pas une erreur
      return;
    }

    // Tableau [lat, lng] pour Leaflet
    liveCoords = data.points.map((p) => [p.lat, p.lng]);

    // Polyline du trajet en direct
    if (!liveLine) {
      liveLine = L.polyline(liveCoords, {
        color: "#ffdd00",
        weight: 4,
        opacity: 0.95
      }).addTo(map);
      tracesGroup.addLayer(liveLine);
    } else {
      liveLine.setLatLngs(liveCoords);
    }

    // Dernier point = position actuelle
    const lastPoint = liveCoords[liveCoords.length - 1];

    if (!liveMarker) {
      liveMarker = L.circleMarker(lastPoint, {
        radius: 6,
        color: "#000",
        fillColor: "#ffdd00",
        fillOpacity: 1
      })
        .bindPopup("Position actuelle de Benjamin")
        .addTo(map);
      tracesGroup.addLayer(liveMarker);

      // Centrer la carte la première fois
      map.setView(lastPoint, 5);
    } else {
      liveMarker.setLatLng(lastPoint);
    }
  } catch (err) {
    console.error("Erreur lors de updateLiveTrack:", err);
  }
}

// Premier appel au chargement
updateLiveTrack();

// Mise à jour toutes les 10 secondes (10000 ms)
setInterval(updateLiveTrack, 10000);

