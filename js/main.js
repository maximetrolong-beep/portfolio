/* =====================================================================
   PORTFOLIO DE MAXIME : LE JAVASCRIPT DU SITE
   ---------------------------------------------------------------------
   Tout le contenu est écrit dans les pages HTML. Ce fichier ne fait que
   les interactions : il n'invente aucun texte.

   Chaque page a un <body data-page="..."> : à la fin du fichier, on
   lance seulement ce dont la page a besoin.

   Plan du fichier :
     1. Petits outils
     2. Images manquantes (bloc « TODO » avec le chemin du fichier)
     3. Sons du menu
     4. Fond du projet (Projets et fiches projet)
     4b. Lumière qui suit la souris
     5. Barre du haut (heure, batterie)
     6. Dock (bouton des sons)
     7. Pages : projets (menu de console), projet, contact, pied de page
     8. Démarrage
   ===================================================================== */
(function () {
  "use strict";

  /* ===== 1. PETITS OUTILS ===== */

  /* Vrai si le visiteur a demandé moins d'animations à son système. */
  const calme = matchMedia("(prefers-reduced-motion: reduce)");
  const doux = () => (calme.matches ? "auto" : "smooth");

  /* Mémoire du navigateur. try/catch : elle peut être bloquée (navigation privée). */
  const lire = (cle, defaut) => { try { return localStorage.getItem(cle) || defaut; } catch (e) { return defaut; } };
  const ecrire = (cle, valeur) => { try { localStorage.setItem(cle, valeur); } catch (e) {} };
  /* Mémoire de l'onglet : retient le projet choisi dans le menu. */
  const lireSession = (cle) => { try { return sessionStorage.getItem(cle); } catch (e) { return null; } };
  const ecrireSession = (cle, valeur) => { try { sessionStorage.setItem(cle, valeur); } catch (e) {} };


  /* ===== 2. IMAGES MANQUANTES ===== */
  /* Une image dont le fichier n'existe pas encore est remplacée par un bloc qui dit
     quel fichier déposer et à quelle taille. Sur une couverture, on garde le titre. */
  function remplacer(img) {
    const taille = `TODO · ${img.getAttribute("width")} × ${img.getAttribute("height")}`;
    const chemin = img.getAttribute("src").replace(/^(\.\.\/)+/, "");
    if (img.closest(".vis-couv-zone")) {
      const etiquette = document.createElement("span");
      etiquette.className = "vis-todo";
      etiquette.append(taille, document.createElement("br"), chemin);
      img.replaceWith(etiquette);
      return;
    }
    const bloc = document.createElement("div");
    bloc.className = "remplacant";
    bloc.setAttribute("role", "img");
    bloc.setAttribute("aria-label", img.alt || "Visuel à venir");
    bloc.style.aspectRatio = `${img.getAttribute("width")} / ${img.getAttribute("height")}`;
    bloc.innerHTML = "<span></span><span></span>";
    bloc.children[0].textContent = taille;
    bloc.children[1].textContent = chemin;
    img.replaceWith(bloc);
  }
  function surveillerImages() {
    document.querySelectorAll("main img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("loading") !== "lazy") remplacer(img); /* déjà en échec */
      else img.addEventListener("error", () => remplacer(img), { once: true });
    });
  }


  /* ===== 3. SONS DU MENU ===== */
  /* Petits sons fabriqués par le navigateur (Web Audio), coupés par défaut.
     Chaque note : [fréquence en Hz, départ en s, durée en s]. */
  const NOTES = {
    choix: [[880, 0, 0.04]],
    filtre: [[540, 0, 0.05]],
    ouvrir: [[660, 0, 0.05], [990, 0.055, 0.09]],
    retour: [[720, 0, 0.045], [480, 0.05, 0.07]],
    son: [[880, 0, 0.05], [1320, 0.05, 0.08]]
  };
  const sonsActifs = () => lire("sons", "0") === "1";
  let audio = null;
  function bip(type) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!sonsActifs() || !AC) return;
    audio = audio || new AC();
    const t = audio.currentTime;
    NOTES[type].forEach(([freq, depart, duree]) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + depart);
      gain.gain.exponentialRampToValueAtTime(0.07, t + depart + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + depart + duree);
      osc.connect(gain).connect(audio.destination);
      osc.start(t + depart);
      osc.stop(t + depart + duree + 0.02);
    });
  }

  /* Quitte la page, après le son s'il est activé. */
  function partir(href, son) {
    bip(son);
    if (sonsActifs()) setTimeout(() => { location.href = href; }, 150);
    else location.href = href;
  }


  /* ===== 4. FOND DU PROJET ===== */
  /* L'image du projet couvre tout l'écran, assombrie (styles en section 4 du CSS).
     « sources » = liste de chemins séparés par des espaces (attribut data-fond) :
     on prend la première image qui existe. Deux calques se relaient pour un fondu. */
  let fond = null;
  let jetonFond = 0;
  function poserFond(sources) {
    if (!fond) {
      fond = document.createElement("div");
      fond.className = "os-fond";
      fond.setAttribute("aria-hidden", "true");
      fond.innerHTML = "<span></span><span></span>";
      document.body.prepend(fond);
    }
    const liste = (sources || "").split(" ").filter(Boolean);
    const moi = ++jetonFond;
    const essayer = (i) => {
      if (moi !== jetonFond) return; /* un autre fond a été demandé entre-temps */
      const [a, b] = fond.children;
      const vu = a.classList.contains("visible") ? a : b;
      const autre = vu === a ? b : a;
      if (i >= liste.length) { vu.classList.remove("visible"); return; }
      const im = new Image(); /* on attend que l'image soit chargée avant le fondu */
      im.onload = () => {
        if (moi !== jetonFond) return;
        autre.style.backgroundImage = `url("${im.src}")`;
        autre.classList.add("visible");
        vu.classList.remove("visible");
      };
      im.onerror = () => essayer(i + 1);
      im.src = liste[i];
    };
    essayer(0);
  }


  /* ===== 4b. LUMIÈRE QUI SUIT LA SOURIS ===== */
  /* Une lueur sous la souris, bleue à gauche de l'écran et rouge à droite (styles en section 4 du CSS).
     Seulement avec une vraie souris, et pas si le visiteur a demandé moins d'animations. */
  function lumiere() {
    if (calme.matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = document.createElement("div");
    el.className = "lumiere";
    el.setAttribute("aria-hidden", "true");
    document.body.append(el);
    let x = 0, y = 0, raf = 0;
    const poser = () => {
      raf = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.setProperty("--mix", `${Math.round((x / innerWidth) * 100)}%`);
    };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      el.classList.add("allumee");
      if (!raf) raf = requestAnimationFrame(poser);
    }, { passive: true });
    document.addEventListener("mouseleave", () => el.classList.remove("allumee"));
  }


  /* ===== 5. BARRE DU HAUT ===== */
  function barreHaut() {
    const heure = document.getElementById("os-heure");
    const majHeure = () => { heure.textContent = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); };
    majHeure();
    setInterval(majHeure, 20000);

    /* Le vrai niveau de batterie, si le navigateur le donne (Chrome, Edge). */
    const batterie = document.getElementById("os-batterie");
    if (navigator.getBattery) navigator.getBattery().then((b) => {
      const niveau = () => { batterie.hidden = false; batterie.style.setProperty("--niv", b.level); };
      niveau();
      b.addEventListener("levelchange", niveau);
    }).catch(() => {});
  }


  /* ===== 6a. THÈME CLAIR OU SOMBRE ===== */
  /* Le bouton soleil / lune du dock. Le choix est gardé ; js/theme.js l'applique au chargement. */
  function theme() {
    const bouton = document.getElementById("os-theme");
    const use = bouton.querySelector("use");
    const nom = bouton.querySelector(".os-dock-nom");
    const html = document.documentElement;
    const maj = () => {
      const clair = html.dataset.theme === "clair";
      bouton.setAttribute("aria-pressed", clair);
      use.setAttribute("href", use.getAttribute("href").replace(/#.*/, clair ? "#lune" : "#soleil"));
      nom.textContent = clair ? "Version sombre" : "Version claire";
    };
    maj();
    bouton.hidden = false;
    bouton.addEventListener("click", () => {
      if (html.dataset.theme === "clair") delete html.dataset.theme;
      else html.dataset.theme = "clair";
      ecrire("theme", html.dataset.theme || "sombre");
      maj();
    });
  }


  /* ===== 6. DOCK ===== */
  /* Le bouton des sons est caché dans le HTML : il n'apparaît que si le JavaScript marche. */
  function dock() {
    const bouton = document.getElementById("os-son");
    const use = bouton.querySelector("use");
    const nom = bouton.querySelector(".os-dock-nom");
    const maj = () => {
      const actifs = sonsActifs();
      bouton.setAttribute("aria-pressed", actifs);
      use.setAttribute("href", use.getAttribute("href").replace(/#.*/, actifs ? "#son" : "#muet"));
      nom.textContent = actifs ? "Sons activés" : "Sons coupés";
    };
    maj();
    bouton.hidden = false;
    bouton.addEventListener("click", () => {
      ecrire("sons", sonsActifs() ? "0" : "1");
      maj();
      bip("son");
    });
  }


  /* ===== 7a. MES PROJETS (MENU DE CONSOLE) ===== */
  /* Une rangée de vignettes qu'on parcourt aux flèches, à la molette, en glissant
     à la souris ou au doigt. Les onglets du haut filtrent par catégorie. */
  function projets() {
    const rangee = document.getElementById("rangee");
    const titre = document.getElementById("cs-titre");
    const titreNom = titre.querySelector(".cs-titre-nom");
    const titreInfo = titre.querySelector(".cs-titre-info");
    const vide = rangee.querySelector(".cs-vide");
    const tousItems = [...rangee.querySelectorAll("li[data-cat]")];
    const onglets = [...document.querySelectorAll(".onglet")];
    const cats = onglets.map((b) => b.dataset.cat);
    const main = document.getElementById("contenu");

    let cat = cats.includes(new URLSearchParams(location.search).get("cat")) ? new URLSearchParams(location.search).get("cat") : "";
    let items = [];        /* les <li> visibles (après filtre) */
    let tuiles = [];       /* leurs liens .tuile */
    let sel = -1;          /* numéro de la tuile choisie */
    let entree = "souris"; /* dernier moyen utilisé : souris, touch, glisse, clavier */
    let programme = false; /* vrai pendant un défilement lancé par le code */

    const marge = () => parseFloat(getComputedStyle(rangee).paddingLeft) || 16;

    /* Le titre du projet suit la tuile choisie (sans sortir de l'écran). */
    function placerTitre() {
      if (!tuiles[sel]) return;
      const r = tuiles[sel].getBoundingClientRect();
      const z = rangee.getBoundingClientRect();
      const m = marge();
      const max = z.width - titre.offsetWidth - m;
      titre.style.setProperty("--x", `${Math.round(Math.max(m, Math.min(r.left - z.left, max)))}px`);
    }

    /* Fait défiler la rangée. Filet de sécurité : si le défilement doux n'a pas bougé, on saute. */
    let jeton = 0;
    function defiler(cible, instant) {
      const avant = rangee.scrollLeft;
      const moi = ++jeton;
      programme = true;
      rangee.scrollTo({ left: cible, behavior: instant ? "auto" : doux() });
      setTimeout(() => {
        if (moi === jeton && rangee.scrollLeft === avant && Math.abs(avant - cible) > 2) rangee.scrollLeft = cible;
      }, 450);
    }

    /* Fait défiler juste ce qu'il faut pour que la tuile n soit entièrement visible. */
    function montrer(n, instant) {
      const li = items[n];
      if (!li) return;
      const m = marge();
      const fin = rangee.scrollWidth - rangee.clientWidth;
      const debut = Math.min(li.offsetLeft - m, fin);
      const besoin = li.offsetLeft + li.offsetWidth + m - rangee.clientWidth;
      let cible = null;
      if (debut < rangee.scrollLeft) cible = debut;
      else if (besoin > rangee.scrollLeft) cible = Math.min(items.map((x) => x.offsetLeft - m).find((s) => s >= besoin) ?? fin, fin);
      if (cible !== null) defiler(cible, instant);
    }

    /* Choisit la tuile n : contour, titre, mémoire de l'onglet. */
    function choisir(n, { focus = false, avecDefilement = true, instant = false } = {}) {
      if (!tuiles.length) return;
      n = Math.max(0, Math.min(tuiles.length - 1, n));
      if (n !== sel) {
        if (sel >= 0) bip("choix");
        tuiles.forEach((t, k) => {
          t.classList.toggle("choisie", k === n);
          t.tabIndex = k === n ? 0 : -1; /* une seule tuile dans l'ordre de tabulation */
        });
        sel = n;
        const t = tuiles[n];
        titreNom.textContent = t.querySelector(".cache").textContent;
        titreInfo.textContent = t.dataset.info;
        ecrireSession("projets-choix", t.getAttribute("href"));
      }
      if (avecDefilement) montrer(n, instant);
      if (focus) tuiles[n].focus({ preventScroll: true });
      placerTitre();
    }

    /* Montre seulement les projets de la catégorie choisie. */
    function filtrer() {
      items = tousItems.filter((li) => !cat || li.dataset.cat.split(" ").includes(cat));
      tousItems.forEach((li) => { li.hidden = !items.includes(li); });
      items.forEach((li, k) => li.style.setProperty("--d", k)); /* délai de l'arrivée en cascade */
      tuiles = items.map((li) => li.querySelector(".tuile"));
      tuiles.forEach((t, k) => { t.dataset.i = k; });
      vide.hidden = items.length > 0;
      titre.hidden = !items.length;
      onglets.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === cat)));
      sel = -1;
      rangee.scrollLeft = 0;
      const garde = tuiles.findIndex((t) => t.getAttribute("href") === lireSession("projets-choix"));
      choisir(garde < 0 ? 0 : garde, { instant: true });
    }

    function premiereVisible() {
      const g = rangee.scrollLeft + marge() - 4;
      const k = items.findIndex((li) => li.offsetLeft >= g);
      return k < 0 ? items.length - 1 : k;
    }
    function estVisible(n) {
      const li = items[n];
      return li && li.offsetLeft >= rangee.scrollLeft && li.offsetLeft + li.offsetWidth <= rangee.scrollLeft + rangee.clientWidth;
    }

    /* Après un défilement à la main (doigt, trackpad), on choisit la première tuile visible. */
    let attente = 0;
    let raf = 0;
    let glisse = null; /* glisser à la souris en cours : { x, s, bouge } */
    rangee.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(placerTitre);
      clearTimeout(attente);
      attente = setTimeout(() => {
        if (programme) { programme = false; return; }
        if (glisse || !tuiles.length) return;
        if (entree === "touch" || entree === "glisse" || !estVisible(sel)) choisir(premiereVisible(), { avecDefilement: false });
      }, 140);
    }, { passive: true });

    /* Molette verticale = tuile suivante ou précédente. */
    let cumul = 0;
    let dernier = 0;
    rangee.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { entree = "glisse"; return; }
      const sens = Math.sign(e.deltaY);
      if ((sens > 0 && sel === tuiles.length - 1) || (sens < 0 && sel === 0)) return;
      e.preventDefault();
      cumul += e.deltaY;
      const t = performance.now();
      if (Math.abs(cumul) >= 40 && t - dernier > 140) {
        choisir(sel + Math.sign(cumul));
        cumul = 0;
        dernier = t;
      }
    }, { passive: false });

    /* Glisser à la souris (le doigt, lui, fait défiler tout seul). */
    let bloquerClic = false;
    rangee.addEventListener("pointerdown", (e) => {
      entree = e.pointerType;
      if (e.pointerType === "mouse" && e.button === 0) glisse = { x: e.clientX, s: rangee.scrollLeft, bouge: false };
    });
    window.addEventListener("pointermove", (e) => {
      if (!glisse) return;
      const dx = e.clientX - glisse.x;
      if (!glisse.bouge && Math.abs(dx) > 6) {
        glisse.bouge = true;
        rangee.classList.add("glisse");
      }
      if (glisse.bouge) rangee.scrollLeft = glisse.s - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!glisse) return;
      const bouge = glisse.bouge;
      glisse = null;
      if (!bouge) return;
      entree = "glisse";
      bloquerClic = true; /* le relâchement ne doit pas ouvrir un projet */
      setTimeout(() => { bloquerClic = false; }, 80);
      /* on se cale sur la tuile la plus proche */
      const m = marge();
      const fin = rangee.scrollWidth - rangee.clientWidth;
      const positions = items.map((x) => Math.min(x.offsetLeft - m, fin));
      const proche = positions.reduce((a, b) => (Math.abs(b - rangee.scrollLeft) < Math.abs(a - rangee.scrollLeft) ? b : a), 0);
      rangee.classList.remove("glisse");
      defiler(proche, false);
      programme = false;
    });

    /* Clic sur une tuile : on la choisit, petit appui, puis on ouvre (après le son s'il y en a). */
    rangee.addEventListener("click", (e) => {
      if (bloquerClic) { e.preventDefault(); e.stopPropagation(); return; }
      const t = e.target.closest(".tuile");
      if (!t) return;
      choisir(+t.dataset.i, { avecDefilement: false });
      t.classList.add("appui");
      if (sonsActifs() && !(e.ctrlKey || e.metaKey || e.shiftKey || e.button)) { e.preventDefault(); partir(t.href, "ouvrir"); }
    }, true);
    rangee.addEventListener("dragstart", (e) => e.preventDefault());

    /* Survol à la souris ou tabulation = choisir. */
    rangee.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || glisse) return;
      const t = e.target.closest(".tuile");
      if (t && +t.dataset.i !== sel) { entree = "souris"; choisir(+t.dataset.i, { avecDefilement: false }); }
    });
    rangee.addEventListener("focusin", (e) => {
      const t = e.target.closest(".tuile");
      if (t && +t.dataset.i !== sel) choisir(+t.dataset.i);
    });

    /* Onglets de filtre. */
    onglets.forEach((b) => b.addEventListener("click", () => {
      cat = b.dataset.cat;
      bip("filtre");
      history.replaceState(null, "", cat ? `projets.html?cat=${cat}` : "projets.html");
      filtrer();
    }));

    /* Clavier : ← → choisir, Entrée ouvrir, Échap accueil, ↓ vers les onglets, ↑ retour aux tuiles. */
    const aides = document.querySelector(".os-aides-bas");
    document.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const a = document.activeElement;
      const dansRangee = rangee.contains(a);
      const libre = !a || a === document.body || a === main || a === document.documentElement;
      const k = onglets.indexOf(a);
      const pas = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (e.key === "Escape") { partir("index.html", "retour"); return; }
      if (dansRangee || libre) {
        if (pas) { e.preventDefault(); entree = "clavier"; choisir(sel + pas, { focus: dansRangee }); }
        else if (dansRangee && e.key === "Home") { e.preventDefault(); choisir(0, { focus: true }); }
        else if (dansRangee && e.key === "End") { e.preventDefault(); choisir(tuiles.length - 1, { focus: true }); }
        else if (e.key === "ArrowDown") { e.preventDefault(); onglets[0].focus(); }
        else if (libre && e.key === "Enter" && tuiles[sel]) { e.preventDefault(); tuiles[sel].click(); }
      } else if (k >= 0) {
        if (pas) { e.preventDefault(); onglets[(k + pas + onglets.length) % onglets.length].focus(); }
        else if (e.key === "ArrowUp" && tuiles[sel]) { e.preventDefault(); tuiles[sel].focus(); }
      }
    });

    /* Les touches dessinées en bas à droite s'enfoncent quand on appuie sur les vraies. */
    const enfoncer = (e) => {
      const touche = aides.querySelector(`kbd[data-k="${e.key}"]`);
      if (touche) touche.classList.toggle("enfoncee", e.type === "keydown");
    };
    document.addEventListener("keydown", enfoncer);
    document.addEventListener("keyup", enfoncer);

    window.addEventListener("resize", () => { montrer(sel, true); placerTitre(); });
    if (document.fonts) document.fonts.ready.then(placerTitre);
    filtrer();
  }


  /* ===== 7b. FICHE D'UN PROJET ===== */
  /* Le menu se souviendra de ce projet, et son image passe en fond. */
  function projet() {
    ecrireSession("projets-choix", `projets/${document.body.dataset.projet}.html`);
    poserFond(document.body.dataset.fond);
  }


  /* ===== 7c. CONTACT ===== */
  /* Sans adresse « action » (Formspree), le formulaire ouvre la messagerie du visiteur. */
  function contact() {
    const f = document.getElementById("formulaire");
    if (f.getAttribute("action")) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(f);
      const sujet = `Contact portfolio : ${d.get("nom")}`;
      const corps = `${d.get("message")}\n\n${d.get("nom")} (${d.get("email")})`;
      location.href = `mailto:${f.dataset.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
      document.getElementById("formulaire-etat").textContent = "Votre messagerie va s'ouvrir avec le message déjà rempli.";
    });
  }


  /* ===== 7d. PIED DE PAGE ===== */
  /* « Revenir en haut » en douceur (le lien marche aussi sans JavaScript). */
  function pied() {
    const lien = document.querySelector(".osp-haut-lien");
    if (!lien) return;
    lien.addEventListener("click", (e) => {
      e.preventDefault();
      scrollTo({ top: 0, behavior: doux() });
    });
  }


  /* ===== 8. DÉMARRAGE ===== */
  const PAGES = { projets, projet, contact };
  surveillerImages();
  barreHaut();
  lumiere();
  dock();
  theme();
  pied();
  (PAGES[document.body.dataset.page] || (() => {}))();
})();
