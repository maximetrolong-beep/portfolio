/* ATLAS · page projet façon logiciel 3D (vue orbitale, arborescence, frise, espaces) */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const zone = $(".ap-zone");
  const vue = $(".vue"), objet = $(".vue-objet-3d"), image = $(".vue-image");
  const nom = $(".vue-nom"), numVue = $(".vue-objet"), legende = $(".vue-legende");
  const listeArbre = $(".arbre-images"), listeFrise = $(".frise-cles"), tete = $(".frise-tete");
  const fActuel = $(".f-actuel"), fTotal = $(".f-total");
  const lecture = $(".frise-lecture");

  /* ---------- Images du projet (lues dans le <template>) ---------- */
  const images = $$("figure", $("#images-projet").content).map(f => ({
    nom: f.dataset.nom, src: f.dataset.src, w: +f.dataset.w, h: +f.dataset.h, texte: f.textContent.trim()
  }));
  const n = images.length;
  fTotal.textContent = n;

  images.forEach((im, i) => {
    const li = document.createElement("li");
    li.setAttribute("role", "treeitem");
    li.innerHTML = `<button class="arbre-ligne" data-i="${i}"><i class="ico ico-image"></i>${im.nom}</button>`;
    listeArbre.append(li);

    const cle = document.createElement("li");
    cle.style.left = `${n > 1 ? (i / (n - 1)) * 100 : 50}%`;
    cle.innerHTML = `<button class="cle" data-i="${i}" aria-label="Image ${i + 1} : ${im.nom}"><span class="cle-losange"></span><img class="cle-vignette" src="${im.src}" alt=""><span class="cle-nom">${String(i + 1).padStart(2, "0")}</span></button>`;
    listeFrise.append(cle);
  });
  $$("[data-i]").forEach(b => b.addEventListener("click", () => montrer(+b.dataset.i)));

  /* ---------- Afficher une image ---------- */
  let actuel = -1;
  function montrer(i, anime = true) {
    i = (i + n) % n;
    if (i === actuel) return;
    const im = images[i];
    actuel = i;
    const poser = () => {
      image.src = im.src; image.width = im.w; image.height = im.h;
      image.alt = im.texte;
      objet.style.setProperty("--ratio", (im.w / im.h).toFixed(3));
    };
    if (anime && window.gsap && !calme) {
      gsap.timeline()
        .to(image, { opacity: 0, y: -12, duration: .18, ease: "power2.in", onComplete: poser })
        .fromTo(image, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .45, ease: "expo.out" });
    } else poser();
    nom.textContent = im.nom;
    numVue.firstChild.textContent = `(${i + 1}) `;
    legende.textContent = im.texte;
    fActuel.textContent = i + 1;
    tete.style.left = `calc(var(--bord) + (100% - 2 * var(--bord)) * ${n > 1 ? i / (n - 1) : .5} - 1px)`;
    $$(".arbre-ligne[data-i], .cle").forEach(b => b.classList.toggle("actif", +b.dataset.i === i));
  }

  /* ---------- Vue orbitale ---------- */
  const VUES = { face: [0, 0], cote: [0, -55], dessus: [62, 0], reset: [6, -12] };
  let rx = 6, ry = -12, zoom = 1;
  function appliquer() {
    objet.style.setProperty("--rx", `${rx}deg`);
    objet.style.setProperty("--ry", `${ry}deg`);
    objet.style.setProperty("--zoom", zoom);
    const g = $(".gizmo");
    g.style.setProperty("--ax", `${-ry * .9}deg`);
    g.style.setProperty("--ay", `${-62 + rx * .5}deg`);
    g.style.setProperty("--az", `${-90 + ry * .4 + rx * .6}deg`);
  }
  function poserVue(cle) {
    [rx, ry] = VUES[cle];
    if (cle === "reset") zoom = 1;
    appliquer();
    $$(".vue-btn").forEach(b => b.classList.toggle("actif", b.dataset.vue === cle));
  }
  $$(".vue-btn").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); poserVue(b.dataset.vue); }));

  let depart = null;
  vue.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return;
    depart = { x: e.clientX, y: e.clientY, rx, ry };
    vue.setPointerCapture(e.pointerId);
    vue.classList.add("tourne");
  });
  vue.addEventListener("pointermove", e => {
    if (!depart) return;
    ry = Math.max(-75, Math.min(75, depart.ry + (e.clientX - depart.x) * .3));
    rx = Math.max(-60, Math.min(75, depart.rx - (e.clientY - depart.y) * .3));
    appliquer();
  });
  const finTour = () => { depart = null; vue.classList.remove("tourne"); };
  vue.addEventListener("pointerup", finTour);
  vue.addEventListener("pointercancel", finTour);
  vue.addEventListener("wheel", e => {
    e.preventDefault();
    zoom = Math.max(.5, Math.min(2.2, zoom * (1 - e.deltaY * .0012)));
    vue.classList.add("tourne");
    appliquer();
    clearTimeout(vue._t);
    vue._t = setTimeout(() => vue.classList.remove("tourne"), 120);
  }, { passive: false });
  vue.addEventListener("dblclick", () => poserVue("reset"));

  /* ---------- Espaces de travail ---------- */
  function espace(nomEspace) {
    zone.dataset.espace = nomEspace;
    $$(".ap-espaces button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.espace === nomEspace)));
  }
  $$(".ap-espaces button").forEach(b => b.addEventListener("click", () => espace(b.dataset.espace)));

  /* Arborescence → blocs de texte */
  $$("[data-aller]").forEach(b => b.addEventListener("click", () => {
    if (zone.dataset.espace === "images") espace("apercu");
    const bloc = document.getElementById(b.dataset.aller);
    bloc.scrollIntoView({ behavior: calme ? "auto" : "smooth", block: "start" });
    bloc.classList.remove("eclaire"); void bloc.offsetWidth; bloc.classList.add("eclaire");
    $$("[data-aller]").forEach(x => x.classList.toggle("actif", x === b));
  }));

  /* ---------- Lecture ---------- */
  let minuterie = 0;
  function lire(oui) {
    lecture.setAttribute("aria-pressed", String(oui));
    lecture.setAttribute("aria-label", oui ? "Mettre en pause" : "Lire le diaporama");
    clearInterval(minuterie);
    if (oui) minuterie = setInterval(() => montrer(actuel + 1), 2600);
  }
  lecture.addEventListener("click", () => lire(lecture.getAttribute("aria-pressed") !== "true"));
  $("[data-frise=prec]").addEventListener("click", () => { lire(false); montrer(actuel - 1); });
  $("[data-frise=suiv]").addEventListener("click", () => { lire(false); montrer(actuel + 1); });

  /* ---------- Clavier ---------- */
  addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); lire(false); montrer(actuel + 1); break;
      case "ArrowLeft": e.preventDefault(); lire(false); montrer(actuel - 1); break;
      case " ": if (e.target.closest?.("button, a")) return; e.preventDefault(); lire(lecture.getAttribute("aria-pressed") !== "true"); break;
      case "Escape": location.href = "projet-cycleup.html"; break;
      case "1": poserVue("face"); break;
      case "3": poserVue("cote"); break;
      case "7": poserVue("dessus"); break;
      case ".": poserVue("reset"); break;
    }
  });

  /* ---------- Démarrage ---------- */
  montrer(0, false);
  appliquer();
  if (window.gsap && !calme) {
    const o = { rx: 70, ry: -12, z: .55 };
    vue.classList.add("tourne");
    gsap.from(objet, { opacity: 0, duration: .6, clearProps: "opacity" });
    gsap.to(o, {
      rx: 6, z: 1, duration: 1.4, ease: "expo.out",
      onUpdate() { rx = o.rx; ry = o.ry; zoom = o.z; appliquer(); },
      onComplete() { vue.classList.remove("tourne"); }
    });
    gsap.from(".gizmo", { rotate: -180, scale: .4, opacity: 0, duration: 1.2, ease: "expo.out", delay: .2, clearProps: "all" });
  }
})();
