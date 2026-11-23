# Portfolio de Maxime Trolong

Site statique (HTML, CSS, JS sans outil de build), publié sur GitHub Pages :
https://maximetrolong-beep.github.io/portfolio/

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Accueil : la planche (nom, accroche) et le menu des projets |
| `projets.html` | Tous les projets (filtres, vue grille ou liste) |
| `moi.html`, `contact.html` | À propos, formulaire de contact (mailto) |
| `projet-*.html` | Une fiche par projet |
| `atelier-cycleup.html` | Cycle'Up en « mode atelier 3D » (option) |
| `style.css`, `app.js` | Commun à toutes les pages + accueil |
| `pages.css`, `pages.js` | Projets, Moi, Contact, fiches projet |
| `projet.css`, `projet.js` | Mode atelier 3D |
| `img/` | Images en WebP, `cv.pdf` |

## Ajouter un projet

1. Copier une fiche `projet-*.html` et changer textes et images.
2. L'ajouter dans `projets.html` et, s'il doit être en avant, dans le menu de `index.html`.
3. Mettre à jour les liens précédent / suivant des fiches voisines.

## Après une modification

Monter le numéro `?v=` des CSS/JS modifiés dans les pages, sinon le navigateur garde l'ancienne version.

## Voir en local

```
py -3 -m http.server 5520 --directory portfolio
```

puis http://127.0.0.1:5520/
