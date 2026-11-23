/* ATLAS · pages Projets, Moi et Contact (chargé après app.js, qui fournit window.ATLAS) */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const A = window.ATLAS || { calme: true, page: "" };

  /* ---------- Projets : bibliothèque ---------- */
  const biblio = $(".biblio");
  if (biblio) {
    const fichiers = $$(".fichier", biblio);
    const etatNb = $(".etat-nb"), etatSurvol = $(".etat-survol");
    const filtres = $$(".filtres button");
    const nbTexte = n => `${n} élément${n > 1 ? "s" : ""}`;

    // Nombre de projets par catégorie, écrit à côté de chaque filtre
    filtres.forEach(b => {
      const n = b.dataset.filtre === "tout" ? fichiers.length : fichiers.filter(f => f.dataset.cat === b.dataset.filtre).length;
      $(".nb", b).textContent = n;
    });

    const filtrer = cat => {
      filtres.forEach(b => b.setAttribute("aria-selected", String(b.dataset.filtre === cat)));
      const visibles = fichiers.filter(f => {
        const ok = cat === "tout" || f.dataset.cat === cat;
        f.hidden = !ok;
        return ok;
      });
      etatNb.textContent = nbTexte(visibles.length);
      if (window.gsap && !A.calme) gsap.fromTo(visibles, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, stagger: .04, ease: "expo.out", clearProps: "all" });
    };
    filtres.forEach(b => b.addEventListener("click", () => filtrer(b.dataset.filtre)));

    const vues = $$(".vues button");
    const changerVue = v => {
      vues.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.vue === v)));
      biblio.dataset.vue = v;
      localStorage.setItem("atlas-vue", v);
    };
    vues.forEach(b => b.addEventListener("click", () => changerVue(b.dataset.vue)));
    const vueGardee = localStorage.getItem("atlas-vue");
    if (vueGardee === "liste") { biblio.dataset.vue = "liste"; vues.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.vue === "liste"))); }

    // Barre d'état : le fichier survolé
    fichiers.forEach(f => {
      const a = $("a", f);
      const nom = a.dataset.sel.split(" · ")[0];
      const montrer = () => { etatSurvol.textContent = `${nom} · ${$(".fichier-titre", f).textContent}`; };
      a.addEventListener("pointerenter", montrer);
      a.addEventListener("focus", montrer);
      a.addEventListener("pointerleave", () => (etatSurvol.textContent = ""));
      if (a.getAttribute("aria-disabled") === "true") a.addEventListener("click", e => e.preventDefault());
    });

    A.clavierPage = e => {
      const k = e.key.toLowerCase();
      if (["1", "2", "3", "4"].includes(k)) { filtrer(["tout", "web", "affiches", "3d"][+k - 1]); return true; }
      if (k === "g") { changerVue("grille"); return true; }
      if (k === "l") { changerVue("liste"); return true; }
      return false;
    };
    etatNb.textContent = nbTexte(fichiers.length);

    if (window.gsap && !A.calme) {
      gsap.fromTo(fichiers, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .9, stagger: .06, ease: "expo.out", delay: .1, clearProps: "all" });
    }
  }

  /* ---------- Fiche projet : ← → pour passer au projet voisin ---------- */
  const suite = $(".pj-suite");
  if (suite) {
    const prec = $('a[rel="prev"]', suite), suiv = $('a[rel="next"]', suite);
    A.clavierPage = e => {
      const lien = e.key === "ArrowLeft" ? prec : e.key === "ArrowRight" ? suiv : null;
      if (!lien) return false;
      setTimeout(() => (location.href = lien.href), 100);
      return true;
    };
    /* Plan de travail : l'image de gauche suit la partie du texte qu'on lit */
    const calques = $$(".pj-calque"), vignettes = $$(".pj-vignettes button");
    const blocs = $$(".pj-bloc"), liensSommaire = $$(".pj-sommaire a");
    const nomPlan = $(".pj-plan-nom"), taillePlan = $(".pj-plan-taille"), numPlan = $(".pj-plan-num");
    const total = String(Math.max(calques.length, 1)).padStart(2, "0");
    let imgActive = 0;
    const montrer = k => {
      if (k === imgActive || !calques[k]) return;
      imgActive = k;
      calques.forEach((c, j) => c.classList.toggle("actif", j === k));
      vignettes.forEach((b, j) => b.setAttribute("aria-pressed", String(j === k)));
      nomPlan.textContent = calques[k].dataset.nom;
      taillePlan.textContent = calques[k].dataset.taille;
      numPlan.textContent = `${String(k + 1).padStart(2, "0")} / ${total}`;
    };
    vignettes.forEach(b => b.addEventListener("click", () => {
      const k = +b.dataset.img;
      montrer(k);
      // amène le texte qui parle de cette image
      const bloc = blocs.find(s => +s.dataset.img === k);
      if (bloc && matchMedia("(min-width: 961px)").matches) bloc.scrollIntoView({ behavior: A.calme ? "auto" : "smooth", block: "start" });
    }));
    const ioBlocs = new IntersectionObserver(entrees => {
      entrees.forEach(en => {
        if (!en.isIntersecting) return;
        const b = en.target;
        blocs.forEach(x => x.classList.toggle("actif", x === b));
        liensSommaire.forEach(a => a.classList.toggle("actif", a.getAttribute("href") === `#${$("h2", b).id}`));
        montrer(+b.dataset.img);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    blocs.forEach(b => ioBlocs.observe(b));
    // revenu en haut de la fiche : plus aucune partie surlignée, première image
    new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      blocs.forEach(x => x.classList.remove("actif"));
      liensSommaire.forEach(a => a.classList.remove("actif"));
      montrer(0);
    }, { rootMargin: "-40% 0px -55% 0px" }).observe($(".pj-tete"));

    if (window.gsap && !A.calme) {
      gsap.fromTo(".pj-tete > *, .pj-fiche, .pj-atelier, .pj-sommaire", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .05, ease: "expo.out", clearProps: "all" });
      gsap.fromTo(".pj-plan", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: .15, clearProps: "all" });
    }
  }

  /* ---------- Moi : réglage d'exposition sur la photo ---------- */
  const expo = $("#expo");
  if (expo) {
    const img = $(".tirage-img"), val = $(".reglage-val");
    const appliquer = () => {
      const v = parseFloat(expo.value);
      // une exposition « photo » : luminosité en puissance de 2, un peu de contraste en plus quand on éclaircit
      img.style.filter = `brightness(${Math.pow(2, v).toFixed(3)}) contrast(${(1 + Math.max(0, v) * .08).toFixed(3)})`;
      val.textContent = (v > 0 ? "+" : "") + v.toFixed(2).replace(".", ",");
      expo.style.setProperty("--p", `${((v - expo.min) / (expo.max - expo.min)) * 100}%`);
    };
    expo.addEventListener("input", appliquer);
    // double-clic : remise à zéro, comme dans les logiciels
    expo.addEventListener("dblclick", () => { expo.value = 0; appliquer(); });
    appliquer();
    if (window.gsap && !A.calme) {
      gsap.fromTo(".tirage-cadre", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "expo.inOut", clearProps: "clipPath" });
      gsap.fromTo(".moi-texte > :not(.titre-section)",{ opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .05, ease: "expo.out", delay: .3, clearProps: "all" });
    }
  }

  /* ---------- Contact : le formulaire « Exporter » ---------- */
  const form = $(".export");
  if (form) {
    const jauge = $(".export-jauge"), pct = $(".export-pct"), erreur = $(".export-erreur");
    const bouton = $("button[type=submit]", form);
    let enCours = false;

    const envoyer = () => {
      if (enCours) return;
      erreur.textContent = "";
      const champ = $$("input[required], textarea[required]", form).find(c => !c.checkValidity());
      if (champ) {
        champ.closest(".champ").classList.add("manque");
        erreur.textContent = champ.type === "email" && champ.value ? "Cette adresse e-mail n'a pas l'air complète." : "Il manque un champ.";
        champ.focus();
        return;
      }
      enCours = true;
      bouton.classList.add("enfonce");
      const d = new FormData(form);
      const sujet = `[Portfolio] ${d.get("sujet")} · ${d.get("nom")}`;
      const corps = `${d.get("message")}\n\n${d.get("nom")}\n${d.get("email")}`;
      const lien = `mailto:${form.dataset.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
      const finir = () => {
        pct.textContent = "exporté";
        form.classList.add("fini");
        location.href = lien;
        setTimeout(() => { enCours = false; bouton.classList.remove("enfonce"); }, 600);
      };
      if (A.calme || !window.gsap) { jauge.style.width = "100%"; finir(); return; }
      const o = { p: 0 };
      gsap.to(o, {
        p: 100, duration: 1.1, ease: "power2.inOut",
        onUpdate() {
          jauge.style.width = `${o.p}%`;
          pct.textContent = `${Math.round(o.p)} %`;
        },
        onComplete: finir
      });
    };

    form.addEventListener("submit", e => { e.preventDefault(); envoyer(); });
    form.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); envoyer(); } });
    form.addEventListener("input", e => {
      e.target.closest(".champ")?.classList.remove("manque");
      if (form.classList.contains("fini")) { form.classList.remove("fini"); jauge.style.width = "0%"; pct.textContent = "prêt"; }
    });

    if (window.gsap && !A.calme) {
      const mot = $(".contact-tete .ecris-mot");
      gsap.fromTo(mot, { "--w": 50, opacity: 0 }, {
        "--w": innerWidth < 760 ? 85 : 112, opacity: 1, duration: 1.2, ease: "expo.out",
        onUpdate() { mot.style.fontVariationSettings = `"wdth" ${gsap.getProperty(mot, "--w")}`; }
      });
      gsap.fromTo([".contact-intro", ".export", ".contact-infos"], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, stagger: .08, ease: "expo.out", delay: .25, clearProps: "all" });
    }
  }
})();
