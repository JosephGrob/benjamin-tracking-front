// ===========================
// 1. Carte & fonds
// ===========================

// Initialiser la carte centrée sur l'Atlantique
const map = L.map("map").setView([20, -30], 2);


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

const API_BASE = "https://benjamin-tracking.onrender.com";



// ===========================
// Lightbox pour les médias
// ===========================
const lightbox = document.getElementById("media-lightbox");
const lightboxImg = document.getElementById("media-lightbox-img");
const lightboxCaption = document.getElementById("media-lightbox-caption");
const lightboxClose = document.getElementById("media-lightbox-close");

function openMediaLightbox(url, title) {
  if (!url) return;
  lightboxImg.src = url;
  lightboxCaption.textContent = title || "";
  lightbox.classList.add("visible");
}

function closeMediaLightbox() {
  lightbox.classList.remove("visible");
  lightboxImg.src = "";
}

// Fermer en cliquant sur le fond ou la croix
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox || e.target === lightboxClose) {
    closeMediaLightbox();
  }
});

// ===========================
// 2. Formulaire "Ajouter un média"
// ===========================

const mediaPanel = document.getElementById("media-panel");
const mediaForm = document.getElementById("media-form");
const mediaCancel = document.getElementById("media-cancel");
const mediaStatus = document.getElementById("media-status");
const mediaPosition = document.getElementById("media-position");

let currentMediaContext = {
  trackId: null,
  lat: null,
  lng: null
};

function openMediaForm(trackId, latlng) {
  currentMediaContext.trackId = trackId;
  currentMediaContext.lat = latlng.lat;
  currentMediaContext.lng = latlng.lng;

  mediaPosition.textContent = `Trace : ${trackId} — position : ${latlng.lat.toFixed(
    4
  )}, ${latlng.lng.toFixed(4)}`;
  mediaStatus.textContent = "";
  mediaForm.reset();
  mediaPanel.classList.add("visible");
}

function closeMediaForm() {
  mediaPanel.classList.remove("visible");
}

mediaCancel.addEventListener("click", () => {
  closeMediaForm();
});

mediaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("media-file");
  const titleInput = document.getElementById("media-title");
  const descInput = document.getElementById("media-description");

  if (!fileInput.files || fileInput.files.length === 0) {
    mediaStatus.textContent = "Merci de choisir un fichier.";
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", titleInput.value || "");
  formData.append("description", descInput.value || "");
  formData.append("trackId", currentMediaContext.trackId || "");
  formData.append("lat", currentMediaContext.lat);
  formData.append("lng", currentMediaContext.lng);

  mediaStatus.textContent = "Envoi en cours…";

  try {
    const response = await fetch(`${API_BASE}/api/media`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      mediaStatus.textContent = "Erreur lors de l'envoi du média.";
      return;
    }

    const media = await response.json();
    mediaStatus.textContent = "Média enregistré ✔";

    // Ajouter un marqueur sur la carte pour ce média
    addMediaMarker(media);

    setTimeout(() => {
      closeMediaForm();
    }, 800);
  } catch (err) {
    console.error("Erreur upload media:", err);
    mediaStatus.textContent = "Erreur réseau.";
  }
});


// ===========================
// 3. Couches de médias
// ===========================

const mediaLayer = L.layerGroup().addTo(map);

/**
 * Ajoute un marqueur pour un média renvoyé par l'API
 * media attendu : { id, lat, lng, title, description, url, type, trackId }
 */
function addMediaMarker(media) {
  const pos = [media.lat, media.lng];
  const marker = L.circleMarker(pos, {
    radius: 6,
    color: "#ffffff",
    fillColor: "#ff6600",
    fillOpacity: 1
  });

  let content = `<strong>${media.title || "Média"}</strong><br>`;
  if (media.description) {
    content += `<em>${media.description}</em><br>`;
  }

  // Construire une URL utilisable depuis GitHub Pages
  let url = media.url || "";

  if (url) {
    if (!url.startsWith("http")) {
      if (url.startsWith("/")) {
        url = `${API_BASE}${url}`;
      } else {
        url = `${API_BASE}/uploads/${url}`;
      }
    }

    if (media.type && media.type.startsWith("video/")) {
      content += `<video src="${url}" controls style="max-width: 220px; max-height: 160px; margin-top: 6px;"></video>`;
    } else {
      const safeTitle = (media.title || "Média").replace(/"/g, "&quot;");
      content += `<img src="${url}" alt="" style="max-width: 220px; max-height: 160px; margin-top: 6px; cursor:pointer;" onclick="openMediaLightbox('${url}','${safeTitle}')" />`;
    }
  }


  marker.bindPopup(content);
  marker.addTo(mediaLayer);
}



/**
 * Charge tous les médias existants depuis l'API
 */
async function loadExistingMedia() {
  try {
    const response = await fetch(`${API_BASE}/api/media`);
    if (!response.ok) return;
    const items = await response.json();
    if (!Array.isArray(items)) return;
    items.forEach(addMediaMarker);
  } catch (err) {
    console.error("Erreur lors du chargement des médias:", err);
  }
}

loadExistingMedia();


// ===========================
// 4. Traces GPX (Trace 1, Trace 2)
// ===========================

// Groupe pour les traces
const tracesGroup = L.layerGroup().addTo(map);

/**
 * Ajoute une trace GPX, avec popup d'info + clic pour ouvrir le formulaire média
 */
function addGpx(path, name) {
  const gpxLayer = new L.GPX(path, {
    async: true,
    marker_options: {
      startIconUrl: null,
      endIconUrl: null,
      shadowUrl: null
    },
    polyline_options: {
      color: "#0033ff",
      weight: 3,
      opacity: 0.75
    }
  })
    .on("loaded", function (e) {
      const gpx = e.target;

      // Ajouter la trace au groupe
      tracesGroup.addLayer(gpx);

      // Adapter le zoom à la 1ère trace chargée
      if (tracesGroup.getLayers().length === 1) {
        map.fitBounds(gpx.getBounds());

        // Dézoomer légèrement pour avoir plus de contexte
        const currentZoom = map.getZoom();
        map.setZoom(currentZoom - 3); // essaie -1, ou -2 si tu veux encore plus large
      }


      // ---- Infos pour la popup "stats" ----
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
        Au : ${endStr}<br>
        <small>Clique sur la trace pour ajouter un média à un endroit précis.</small>
      `;

      gpx.bindPopup(html);

      // Quand on clique sur la trace → ouvrir le formulaire média à l'endroit cliqué
      gpx.on("click", function (evt) {
        openMediaForm(name, evt.latlng);
      });
    })
    .addTo(map);

  gpxLayer.name = name;
}

// Ajouter les deux fichiers GPX
addGpx("data/trace1.gpx", "Trace 1");
addGpx("data/trace2.gpx", "Trace 2");


// ===========================
// 5. Contrôle des couches
// ===========================

const baseLayers = {
  "GEBCO gris (NOAA)": gebcoGray,
  "Fond clair (Carto)": cartoLight
};

const overlays = {
  "Traces bateau": tracesGroup,
  "Médias": mediaLayer
};

L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);


// ===========================
// 6. Trace LIVE de Benjamin
// ===========================

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
        color: "#0033ff",
        weight: 4,
        opacity: 0.75
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
        fillColor: "#0033ff",
        fillOpacity: 0.75
      })
        .bindPopup("Position actuelle de Benjamin")
        .addTo(map);
      tracesGroup.addLayer(liveMarker);

      // Centrer la carte la première fois
      map.setView(lastPoint, 3);
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
