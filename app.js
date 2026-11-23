/* ATLAS · interactions communes à toutes les pages (règles, viseur, sélection, palette)
   + l'accueil (nom, menu des projets). Projets, Moi et Contact ont leur code dans pages.js. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const souris = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const CASE = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--case")) || 24;
  const REGLE = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--regle")) || 0;

  const page = document.body.dataset.page || "accueil";

  /* ---------- Règles du tapis ---------- */
  const regleH = $(".regle--h"), regleV = $(".regle--v");
  const chiffresH = $(".regle-chiffres", regleH), chiffresV = $(".regle-chiffres", regleV);
  function dessinerRegles() {
    if (!REGLE()) return;
    const pas = CASE() * 5;
    let html = "";
    for (let i = 0, x = 0; x < innerWidth; i++, x += pas) html += `<span style="left:${x}px">${i * 5}</span>`;
    chiffresH.innerHTML = html;
    majRegleV();
  }
  function majRegleV() {
    if (!REGLE()) return;
    const pas = CASE() * 5, y0 = scrollY, debut = Math.floor(y0 / pas);
    let html = "";
    for (let i = debut; i * pas - y0 < innerHeight; i++) html += `<span style="top:${i * pas - y0}px">${i * 5}</span>`;
    chiffresV.innerHTML = html;
    regleV.style.backgroundPositionY = `${-y0}px, ${-y0}px`;
  }

  /* ---------- Viseur et coordonnées ---------- */
  const viseur = $(".viseur"), vH = $(".viseur-h"), vV = $(".viseur-v"), vXY = $(".viseur-xy");
  const marqueH = $(".regle-marque", regleH), marqueV = $(".regle-marque", regleV);
  const piedXY = $(".pied-xy");
  let mx = -100, my = -100;
  const pad = n => String(Math.max(0, Math.round(n))).padStart(4, "0");
  function majViseur() {
    const r = REGLE();
    vH.style.transform = `translateY(${my}px)`;
    vV.style.transform = `translateX(${mx}px)`;
    const px = mx - r, py = my + scrollY - r;
    vXY.textContent = `x ${pad(px)} · y ${pad(py)}`;
    const dx = mx + 14 + 120 > innerWidth ? -134 : 14;
    vXY.style.transform = `translate(${mx + dx}px, ${my + 14}px)`;
    marqueH.style.left = `${mx - r}px`;
    marqueV.style.top = `${my - r}px`;
    if (piedXY) piedXY.textContent = `x ${pad(px)}, y ${pad(py)}`;
  }
  if (souris) {
    document.body.classList.add("souris");
    addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; requestAnimationFrame(majViseur); }, { passive: true });
    document.addEventListener("pointerleave", () => document.body.classList.remove("souris"));
    document.addEventListener("pointerenter", () => document.body.classList.add("souris"));
  }

  /* ---------- Sélection façon logiciel de création ---------- */
  const sel = $(".selection"), selNom = $(".selection-nom");
  let cible = null;
  function placerSelection() {
    if (!cible) return;
    const r = cible.getBoundingClientRect();
    sel.style.transform = `translate(${r.left - 4}px, ${r.top - 4}px)`;
    sel.style.width = `${r.width + 8}px`;
    sel.style.height = `${r.height + 8}px`;
    selNom.textContent = `${cible.dataset.sel}  ${Math.round(r.width)} × ${Math.round(r.height)}`;
  }
  if (souris) {
    $$("[data-sel]").forEach(el => {
      el.addEventListener("pointerenter", () => { cible = el; placerSelection(); sel.classList.add("visible"); });
      el.addEventListener("pointerleave", () => { if (cible === el) { cible = null; sel.classList.remove("visible"); } });
    });
  }

  /* ---------- Le nom : lettres à largeur variable ---------- */
  const lettres = [];
  $$(".nom-ligne").forEach(ligne => {
    const mot = ligne.textContent;
    ligne.textContent = "";
    [...mot].forEach(c => {
      const s = document.createElement("span");
      s.className = "lettre"; s.textContent = c;
      s.style.setProperty("--l", 100); s.style.setProperty("--g", 800);
      ligne.append(s); lettres.push(s);
    });
  });
  const planche = $(".planche");
  let centres = [];
  const mesurerLettres = () => { centres = lettres.map(l => { const r = l.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); };
  const nomEl = $(".nom");
  const repos = () => lettres.forEach(l => { l.style.setProperty("--l", 100); l.style.setProperty("--g", 800); });
  // L'effet ne joue que quand la souris est vraiment sur les lettres du nom
  if (nomEl && souris && !calme) {
    let raf = 0, dessus = false;
    nomEl.addEventListener("pointermove", e => {
      const surLettres = !!e.target.closest(".nom-ligne");
      if (!surLettres) { if (dessus) { dessus = false; repos(); } return; }
      dessus = true;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!dessus) return;
        lettres.forEach((l, i) => {
          const [cx, cy] = centres[i] || [0, 0];
          const d = Math.hypot(e.clientX - cx, (e.clientY - cy) * 1.6);
          const p = Math.max(0, 1 - d / 420);
          l.style.setProperty("--l", (72 + p * 72).toFixed(1));
          l.style.setProperty("--g", (700 + p * 200).toFixed(0));
        });
      });
    });
    nomEl.addEventListener("pointerleave", () => { dessus = false; repos(); });
  }

  /* ---------- Menu des projets (accueil) ---------- */
  const menu = $(".menu");
  let placerMenu = () => {};
  let toucheMenu = () => false;
  if (menu) {
  const bande = $(".bande");
  const cartes = $$(".carte");
  const fiche = {
    actuel: $(".c-actuel"), total: $(".c-total"), titre: $(".fiche-titre"), texte: $(".fiche-texte"),
    annee: $(".i-annee"), cadre: $(".i-cadre"), outils: $(".i-outils"), lien: $(".fiche-lien")
  };
  const cadreSel = document.createElement("div");
  cadreSel.className = "menu-sel";
  cadreSel.innerHTML = '<i class="poignee p1"></i><i class="poignee p2"></i><i class="poignee p3"></i><i class="poignee p4"></i><span class="menu-sel-nom"></span><span class="menu-sel-taille"></span>';
  menu.append(cadreSel);
  let base = { l: 0, t: 0, w: 0, h: 0 };

  /* Poignées : on peut agrandir ou rétrécir le projet choisi, comme dans un logiciel */
  function echelle(s) {
    const carte = visibles[index];
    if (!carte) return;
    const w = (base.w - 20) * s + 20, h = (base.h - 20) * s + 20;
    cadreSel.style.left = `${base.l + (base.w - w) / 2}px`;
    cadreSel.style.top = `${base.t + (base.h - h) / 2}px`;
    cadreSel.style.width = `${w}px`;
    cadreSel.style.height = `${h}px`;
    $("figure", carte).style.scale = s;
    const img = $("img", carte);
    const nw = img ? +img.getAttribute("width") : 0, nh = img ? +img.getAttribute("height") : 0;
    $(".menu-sel-taille", cadreSel).textContent = img
      ? `${Math.round(nw * s)} × ${Math.round(nh * s)} · ${Math.round(s * 100)} %`
      : `${Math.round(s * 100)} %`;
  }
  $$(".poignee", cadreSel).forEach(p => {
    p.addEventListener("pointerdown", e => {
      e.stopPropagation();
      e.preventDefault();
      try { p.setPointerCapture(e.pointerId); } catch {}
      const carte = visibles[index], fig = $("figure", carte);
      const r = carte.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d0 = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
      cadreSel.classList.add("etire");
      fig.style.transition = "none";
      let s = 1;
      const bouger = ev => {
        s = Math.min(1.35, Math.max(.6, Math.hypot(ev.clientX - cx, ev.clientY - cy) / d0));
        echelle(s);
      };
      const lacher = () => {
        p.removeEventListener("pointermove", bouger);
        cadreSel.classList.remove("etire");
        fig.style.transition = "";
        const o = { s };
        const fin = () => { fig.style.scale = ""; placerMenu(); };
        if (window.gsap && !calme) gsap.to(o, { s: 1, duration: .9, ease: "elastic.out(1, .45)", onUpdate: () => echelle(o.s), onComplete: fin });
        else fin();
      };
      p.addEventListener("pointermove", bouger);
      p.addEventListener("pointerup", lacher, { once: true });
      p.addEventListener("pointercancel", lacher, { once: true });
    });
  });
  let visibles = cartes.slice(), index = 0;
  const deux = n => String(n).padStart(2, "0");

  placerMenu = function () {
    const carte = visibles[index];
    if (!carte) return;
    cartes.forEach(c => c.classList.toggle("choisie", c === carte));
    const x = menu.clientWidth / 2 - (carte.offsetLeft + carte.offsetWidth / 2);
    bande.style.setProperty("--x", `${x}px`);
    base = { l: x + carte.offsetLeft - 10, t: carte.offsetTop - 10, w: carte.offsetWidth + 20, h: carte.offsetHeight + 20 };
    cadreSel.style.left = `${base.l}px`;
    cadreSel.style.top = `${base.t}px`;
    cadreSel.style.width = `${base.w}px`;
    cadreSel.style.height = `${base.h}px`;
    const img = $("img", carte);
    const fichier = img ? img.getAttribute("src").split("/").pop() : "à-venir";
    $(".menu-sel-nom", cadreSel).textContent = `${fichier} · ${carte.dataset.cat}`;
    $(".menu-sel-taille", cadreSel).textContent = img ? `${img.getAttribute("width")} × ${img.getAttribute("height")}` : "— × —";
  };

  function remplirFiche(anime) {
    const c = visibles[index];
    if (!c) return;
    fiche.actuel.textContent = deux(index + 1);
    fiche.total.textContent = deux(visibles.length);
    fiche.titre.textContent = c.dataset.titre;
    fiche.texte.textContent = c.dataset.texte;
    fiche.annee.textContent = c.dataset.annee;
    fiche.cadre.textContent = c.dataset.cadre;
    fiche.outils.textContent = c.dataset.outils;
    fiche.lien.href = c.dataset.lien;
    if (anime && window.gsap && !calme) {
      gsap.fromTo(fiche.titre, { "--w": 50, opacity: 0, y: 10 }, {
        "--w": 100, opacity: 1, y: 0, duration: .55, ease: "expo.out",
        onUpdate() { fiche.titre.style.fontVariationSettings = `"wdth" ${gsap.getProperty(fiche.titre, "--w")}`; }
      });
      gsap.fromTo([fiche.texte, ".fiche-infos"], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .4, stagger: .05, ease: "power2.out" });
    }
  }

  function choisir(i) {
    const n = visibles.length;
    const nouvel = Math.max(0, Math.min(n - 1, i));
    if (nouvel === index) return;
    index = nouvel;
    placerMenu();
    remplirFiche(true);
  }

  function filtrer(cat) {
    $$(".filtres button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.filtre === cat)));
    cartes.forEach(c => c.classList.toggle("cachee", cat !== "tout" && c.dataset.cat !== cat));
    visibles = cartes.filter(c => !c.classList.contains("cachee"));
    index = 0;
    bande.style.transition = "none";
    placerMenu();
    bande.offsetWidth;
    bande.style.transition = "";
    remplirFiche(true);
  }
  $$(".filtres button").forEach(b => b.addEventListener("click", () => filtrer(b.dataset.filtre)));

  cartes.forEach(c => c.addEventListener("click", () => {
    if (glisse) return;
    const i = visibles.indexOf(c);
    if (i === index) ouvrir(); else choisir(i);
  }));

  function ouvrir() {
    const href = fiche.lien.getAttribute("href");
    fiche.lien.classList.add("enfonce");
    setTimeout(() => { fiche.lien.classList.remove("enfonce"); if (href && href !== "#") location.href = href; }, 160);
  }

  // Glisser (souris ou doigt)
  let x0 = null, glisse = false;
  menu.addEventListener("pointerdown", e => { x0 = e.clientX; glisse = false; });
  addEventListener("pointerup", e => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) { glisse = true; choisir(index + (dx < 0 ? 1 : -1)); setTimeout(() => (glisse = false), 50); }
  });
  // Molette horizontale ou verticale sur le menu
  let attenteMolette = 0;
  menu.addEventListener("wheel", e => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
    if (!d) return;
    e.preventDefault();
    const t = performance.now();
    if (t - attenteMolette < 280) return;
    attenteMolette = t;
    choisir(index + (d > 0 ? 1 : -1));
  }, { passive: false });

  /* Clavier du menu : seulement quand le menu est à l'écran */
  let menuVisible = false;
  new IntersectionObserver(([e]) => (menuVisible = e.intersectionRatio > .35), { threshold: [0, .35, .6] }).observe($("#projets"));
  const aides = $$(".aides kbd");
  const appuyer = touche => { const k = aides.find(a => a.textContent === touche); if (!k) return; k.classList.add("enfonce"); setTimeout(() => k.classList.remove("enfonce"), 140); };
  toucheMenu = e => {
    if (!menuVisible && document.activeElement !== menu) return false;
    const k = e.key.toLowerCase();
    if (e.key === "ArrowRight") { e.preventDefault(); appuyer("→"); choisir(index + 1); return true; }
    if (e.key === "ArrowLeft") { e.preventDefault(); appuyer("←"); choisir(index - 1); return true; }
    if (e.key === "Enter" && (document.activeElement === menu || document.activeElement === document.body)) { e.preventDefault(); appuyer("Entrée"); ouvrir(); return true; }
    if (["1", "2", "3", "4"].includes(k)) { appuyer(k); filtrer(["tout", "web", "affiches", "3d"][+k - 1]); return true; }
    return false;
  };
  remplirFiche(false);
  $$(".carte img").forEach(img => img.complete || img.addEventListener("load", placerMenu, { once: true }));
  } // fin du menu

  /* ---------- Clavier : H P M C changent de page ---------- */
  const PAGES = { h: "index.html", p: "projets.html", m: "moi.html", c: "contact.html" };
  window.ATLAS = { calme, souris, page, clavierPage: null };
  addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.("input, textarea, select")) return;
    if (toucheMenu(e)) return;
    if (window.ATLAS.clavierPage && window.ATLAS.clavierPage(e)) return;
    const k = e.key.toLowerCase();
    if (!PAGES[k]) return;
    const lien = $(`.palette a[data-touche="${k}"]`);
    if (lien?.classList.contains("actif")) { scrollTo({ top: 0, behavior: calme ? "auto" : "smooth" }); return; }
    lien?.classList.add("actif");
    setTimeout(() => (location.href = PAGES[k]), 120);
  });

  /* ---------- Palette : page en cours ---------- */
  const liensPalette = $$(".palette a[data-touche]");
  liensPalette.forEach(a => {
    const ici = a.dataset.page === page;
    a.classList.toggle("actif", ici);
    if (ici) a.setAttribute("aria-current", "page");
  });

  /* Trait orange sous la page en cours (barre du bas sur téléphone).
     Il part de la page qu'on vient de quitter et glisse jusqu'à la nouvelle. */
  const palette = $(".palette");
  if (palette) {
    const trait = document.createElement("i");
    trait.className = "palette-trait";
    trait.setAttribute("aria-hidden", "true");
    palette.append(trait);
    const poser = (a, anime) => {
      if (!a) { trait.style.opacity = "0"; return; }
      trait.style.transition = anime && !calme ? "" : "none";
      trait.style.opacity = "1";
      trait.style.transform = `translateX(${a.offsetLeft + a.offsetWidth / 2 - 10}px)`;
    };
    const actif = liensPalette.find(a => a.classList.contains("actif"));
    const depart = liensPalette.find(a => a.dataset.page === sessionStorage.getItem("atlas-trait"));
    sessionStorage.removeItem("atlas-trait");
    poser(depart && depart !== actif ? depart : actif, false);
    requestAnimationFrame(() => requestAnimationFrame(() => poser(actif, true)));
    addEventListener("resize", () => poser(actif, false));
    liensPalette.forEach(a => a.addEventListener("click", () => {
      if (actif) sessionStorage.setItem("atlas-trait", actif.dataset.page);
    }));
  }

  /* ---------- Démarrage ---------- */
  function toutMesurer() { dessinerRegles(); mesurerLettres(); placerMenu(); placerSelection(); }
  addEventListener("resize", toutMesurer);
  addEventListener("scroll", () => { majRegleV(); mesurerLettres(); placerSelection(); if (souris) majViseur(); }, { passive: true });
  placerMenu();
  dessinerRegles();
  document.fonts.ready.then(() => { toutMesurer(); intro(); });
  function intro() {
    if (!window.gsap || calme) return;
    gsap.registerPlugin(ScrollTrigger);
    if (planche) {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: mesurerLettres });
    tl.fromTo(lettres, { yPercent: 110, opacity: 0, "--l": 50 }, { yPercent: 0, opacity: 1, "--l": 100, duration: 1.1, stagger: .045 })
      .from(".accroche", { opacity: 0, y: 14, duration: .8 }, "-=.7")
      .from(".etiquette", { opacity: 0, y: -40, rotate: -18, duration: 1, ease: "back.out(1.6)" }, "-=.6")
      .from(".angles line, .angles path", { opacity: 0, duration: 1.2, stagger: .08 }, 0)
      .from(".palette", { opacity: 0, y: -8, duration: .6 }, "-=.8")
      .fromTo(".descendre", { opacity: 0 }, { opacity: 1, duration: .8 }, "-=.4");
    }

    $$(".titre-section").forEach(t => {
      gsap.fromTo(t, { "--w": 50, opacity: 0 }, {
        "--w": 70, opacity: 1, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: t, start: "top 85%" },
        onUpdate() { t.style.fontVariationSettings = `"wdth" ${gsap.getProperty(t, "--w")}`; }
      });
    });
    if (menu) gsap.from(".carte figure", { y: 60, opacity: 0, duration: .9, stagger: .07, ease: "expo.out", scrollTrigger: { trigger: ".menu", start: "top 80%" }, clearProps: "all" });
    const ecris = $(".contact-bas .ecris-mot");
    if (ecris) gsap.fromTo(ecris, { "--w": 50 }, {
      "--w": innerWidth < 760 ? 85 : 118, ease: "none",
      scrollTrigger: { trigger: ".contact-bas", start: "top bottom", end: "bottom bottom", scrub: .4 },
      onUpdate() { ecris.style.fontVariationSettings = `"wdth" ${gsap.getProperty(ecris, "--w")}`; }
    });
  }
})();
