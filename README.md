# Suivi de navigation – Benjamin Senften

Ce dépôt contient le frontend de la carte web réalisée pour visualiser les routes de navigation de Benjamin Senften.

La carte affiche :
- un fond océan en tons gris ;
- différentes traces GPX (Trace 1, Trace 2) ;
- des informations interactives en cliquant sur les tracés.

## Carte publique

La carte est accessible ici :

https://josephgrob.github.io/benjamin-tracking-front/

Elle fonctionne sur ordinateur, tablette et téléphone.  
Il est possible de zoomer, déplacer la carte et cliquer sur les tracés pour obtenir des informations.

## Structure du projet

Le dépôt contient les fichiers suivants :

- `index.html` — page principale affichant la carte ;
- `script.js` — logique Leaflet (fond de carte, chargement des GPX, interactions) ;
- `style.css` — style visuel ;
- `data/` — dossier contenant les fichiers GPX.

## Développement local

1. Cloner le dépôt :


git clone https://github.com/JosephGrob/benjamin-tracking-front.git

2. Ouvrir le dossier dans Visual Studio Code.
3. Installer l’extension “Live Server”.
4. Ouvrir `index.html` avec Live Server pour visualiser la carte localement.

## Objectif

Ce projet sert de support visuel pour illustrer les itinéraires de navigation réalisés.  
De futures évolutions pourront inclure :  
- l’ajout de photos ou vidéos associées à certains points des traces ;
- l’enrichissement des couches ou des informations affichées.

---

