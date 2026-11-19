/* Applique le thème choisi (clair ou sombre) AVANT l'affichage de la page, pour éviter un flash.
   Chargé sans « defer » dans le <head>. Le bouton qui change de thème est dans main.js (section 6). */
try {
  if (localStorage.getItem("theme") === "clair") document.documentElement.dataset.theme = "clair";
} catch (e) {}
