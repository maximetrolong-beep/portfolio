# Portfolio de Maxime

Site statique : HTML, CSS et JavaScript, sans framework ni installation.
Direction artistique : sombre, rouge et bleu adoucis, avec un menu de console pour les projets.

Chaque langage a son rôle :

- **HTML** : tout le contenu (textes, projets, liens, images). C'est là qu'on modifie le site.
- **CSS** (`css/style.css`) : toute l'apparence.
- **JavaScript** (`js/main.js`) : seulement les interactions (menu de console, fond du projet, sons, heure,
  formulaire). Il n'écrit aucun texte : le site reste lisible même si le JavaScript ne se charge pas.

## Les fichiers

```
portfolio/
├── index.html           Accueil
├── projets.html         Mes projets (menu de console)
├── a-propos.html        À propos
├── contact.html         Contact
├── projets/             Une page par projet (cycleup-pyrenees.html, affiche-1.html…)
│   └── _modele.html     Modèle vide pour un nouveau projet
├── css/style.css        Tout le style
├── js/main.js           Les interactions
├── js/theme.js          Applique le thème clair ou sombre avant l'affichage
└── assets/
    ├── icones.svg       Toutes les icônes (une seule image, chaque page pioche dedans)
    ├── cv.pdf           Mon CV, ouvert dans un nouvel onglet
    └── projets/<id>/    Les images de chaque projet
```

### Dans `js/main.js` (sections numérotées)

1. Petits outils · 2. Images manquantes · 3. Sons du menu · 4. Fond du projet
5. Barre du haut (heure, batterie) · 6. Dock (bouton des sons)
7. Pages : menu de console, fiche projet, contact, pied de page · 8. Démarrage

### Dans `css/style.css` (sections numérotées)

1. Variables (couleurs, polices, tailles) — **pour changer une couleur, c'est ici**
2. Base · 3. Éléments communs · 4. Fond du projet · 5. Barre du haut · 6. Dock
7. Accueil · 8. Projets · 9. Fiche projet · 10. À propos · 11. Contact · 12. Pied de page
13. Animations · 14. Tablette · 15. Mobile

Préfixes des classes : `os-` interface commune, `ac-` accueil, `cs-` console Projets,
`pj-` fiche projet, `osp-` pied de page.

## Voir le site en local

```
py -3 -m http.server 5520 --directory portfolio
```

puis ouvrir http://localhost:5520. Passe par ce serveur : en double-cliquant un fichier HTML,
le navigateur bloque les icônes (`assets/icones.svg`).

## Modifier le contenu

Ouvre la page concernée et change le texte entre les balises. Cherche « TODO » dans les fichiers HTML :
chaque occurrence est une info à compléter (e-mail, durée du stage, années, rôles…).

Les parties communes (barre du haut, dock, pied de page) sont répétées dans chaque page :
pour changer l'e-mail ou un lien, fais un « Rechercher et remplacer dans tous les fichiers » de ton éditeur.

### Ajouter un projet

1. Copie `projets/_modele.html` en `projets/mon-projet.html` (nom sans espace ni accent).
   Retire la ligne `<meta name="robots" content="noindex">`, remplace partout `MODELE` par `mon-projet`
   et écris les textes.
2. Mets les images dans `assets/projets/mon-projet/` (voir le tableau plus bas).
3. Dans `projets.html`, copie un bloc `<li data-cat="...">` de la rangée et adapte-le : lien, catégories
   (`3d`, `affiches`, `web`, séparées par un espace), `data-info` (le texte sous le titre),
   image et titre.
4. Mets à jour les liens « projet précédent / suivant » en bas des fiches voisines.
5. Pour le montrer sur l'accueil, copie une carte `<li>` dans « Quelques projets » de `index.html`.

### Formulaire de contact

Sans rien faire, il ouvre la messagerie du visiteur avec le message rempli (adresse dans `data-email`).
Pour recevoir les messages directement : crée un formulaire sur formspree.io et ajoute
`action="https://formspree.io/f/xxxx" method="POST"` sur la balise `<form>` de `contact.html`.

## Les visuels

Une image absente affiche un bloc rayé avec ses dimensions et son chemin : il suffit de déposer le fichier.

| Image | Dimensions | Chemin |
| --- | --- | --- |
| Jaquette (2:3) | 1200 × 1800 | `assets/projets/<id>/jaquette.jpg` |
| Vignette carrée (facultatif) | 1000 × 1000 | `assets/projets/<id>/vignette.jpg` |
| Grande image (3:2) | 1800 × 1200 | `assets/projets/<id>/large.jpg` |
| Images de la fiche | 1600 × 1000 | `assets/projets/<id>/1.jpg`, `2.jpg`… |
| Ma photo (À propos, détourée) | 1000 × 1270 | `assets/moi.webp` |
| Image de partage | 1200 × 630 | `assets/og.jpg` |

Remplis le `alt` de chaque `<img>` (une phrase qui décrit l'image) et garde `width` / `height`
aux vraies dimensions : la page ne saute pas pendant le chargement.

## Fond et sons

Sur la fiche d'un projet, son image couvre le haut de l'écran, floutée et assombrie
(attribut `data-fond` : la première image qui existe est prise). Sans image, on voit le fond normal du site.
Le dernier rond du dock coupe ou active les petits sons du menu (coupés par défaut).

## Thème clair ou sombre

Le bouton soleil / lune du dock passe le site en version claire. Le choix est gardé dans le navigateur.
`js/theme.js` (chargé tout en haut de chaque page) l'applique avant l'affichage pour éviter un flash.
Les couleurs claires sont dans la section 12b du CSS.

## Typo des titres

Les grands titres utilisent la variable `--affiche` (Syne pour l'instant) : pour en essayer une autre,
change cette variable dans la section 1 du CSS et la police dans le lien Google Fonts des pages.

## Le CV

`assets/cv.pdf` s'ouvre dans un nouvel onglet depuis tous les boutons « CV ». Pour le mettre à jour,
remplace ce fichier en gardant le même nom. Attention : il contient ton adresse et ton téléphone,
et il sera public une fois le site en ligne.

## Mettre en ligne

Le dossier `portfolio/` se déploie tel quel (GitHub Pages, Netlify drop, Vercel).
Avant : remplacer l'e-mail, ajouter `assets/og.jpg`, vérifier qu'il ne reste pas de « TODO » visibles.
Après chaque modification du CSS ou du JS, monte le numéro `?v=...` dans les pages pour que les
navigateurs rechargent les fichiers.
