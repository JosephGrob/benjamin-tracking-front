# Suivi de navigation – Benjamin Senften

Ce dépôt contient le **frontend** du projet de suivi de navigation de Benjamin :

- une **carte publique** pour suivre la traversée en temps (quasi) réel ;
- une page **GPS** pour que Benjamin envoie sa position depuis son téléphone.

> Carte publique :  
> https://josephgrob.github.io/benjamin-tracking-front/

> Page GPS (Benjamin uniquement) :  
> https://josephgrob.github.io/benjamin-tracking-front/GPS.html


---

## 1. Résumé ultra-court

- Pour **suivre la traversée** :  
  ouvrir la carte publique :  
  `https://josephgrob.github.io/benjamin-tracking-front/`

- Pour **envoyer sa position (Benjamin)** :  
  ouvrir la page GPS sur téléphone :  
  `https://josephgrob.github.io/benjamin-tracking-front/GPS.html`  
  accepter la géolocalisation  
  appuyer sur **Start**  
  laisser la page ouverte pendant la navigation

La carte se met alors à jour automatiquement quand le téléphone a du réseau.

---

## 2. Pour les proches / observateurs : voir la carte

### 2.1. Accéder à la carte

1. Ouvrir un navigateur (Chrome, Firefox, Safari, Edge…).
2. Aller sur :  
   `https://josephgrob.github.io/benjamin-tracking-front/`
3. La carte s’affiche avec :
   - un fond océan/relief en tons gris,
   - les traces historiques (Trace 1, Trace 2),
   - la **trace en direct** (ligne jaune) si Benjamin envoie sa position,
   - un marqueur pour la **position actuelle**.

### 2.2. Interagir avec la carte

- **Zoom** : molette de la souris ou boutons + / –.
- **Déplacement** : cliquer-glisser.
- **Basculer les couches** : panneau en haut à droite (fond GEBCO / fond clair / traces).
- **Position actuelle** : clic sur le marqueur pour voir une petite info.

> Si la trace jaune ne bouge plus :  
> - soit le téléphone de Benjamin n’a plus de réseau,  
> - soit la page GPS n’est plus ouverte / plus en mode “Start”.

---

## 3. Pour Benjamin : envoyer la position depuis le bateau

### 3.1. Conditions

- Un **smartphone** (iOS ou Android) avec :
  - GPS activé,
  - un accès Internet au moins de temps en temps  
    (4G/5G, WiFi du port, téléphone satellite, routeur à bord, etc.).
- Le téléphone doit pouvoir ouvrir une page web en **HTTPS**.

> Important :  
> La page GPS ne stocke pas les positions en local.  
> Tant qu’il n’y a **aucun réseau**, les positions ne peuvent **pas** être envoyées  
> (et ne seront donc pas visibles sur la carte).

---

### 3.2. Première utilisation (test à terre)

Avant le départ, faire un test simple :

1. Sur le téléphone, ouvrir :  
   `https://josephgrob.github.io/benjamin-tracking-front/gps.html`
2. Accepter l’autorisation de localisation si elle apparaît.
3. Appuyer sur **Start**.
4. Se déplacer un peu ou attendre quelques secondes.
5. Vérifier qu’un message de ce type apparaît dans la zone de statut :

   > Position envoyée : lat=…, lng=…, précision ~… m (total: N)

6. Sur un ordinateur, ouvrir la carte :  
   `https://josephgrob.github.io/benjamin-tracking-front/`  
   La trace jaune et le point “position actuelle” doivent apparaître.

Si ce test fonctionne à terre, le système est prêt pour la navigation.

---

### 3.3. Procédure à suivre AVANT CHAQUE DÉPART

1. Vérifier que le téléphone a un **minimum de réseau**.
2. Ouvrir la page GPS :  
   `https://josephgrob.github.io/benjamin-tracking-front/gps.html`
3. Vérifier que la localisation est bien autorisée :
   - si une demande apparaît → accepter,
   - sinon, vérifier dans les réglages du téléphone que le navigateur
     a l’autorisation “Localisation : Autorisée pendant l’utilisation”.
4. Appuyer sur **Start**.
5. Vérifier qu’un premier message de type « Position envoyée » apparaît.
6. Laisser la page **ouverte** (ne pas fermer l’onglet).  
   On peut éteindre l’écran, mais l’onglet doit rester en arrière-plan.

---

### 3.4. Pendant la navigation

- Tant que :
  - la page `gps.html` est ouverte **en mode Start**,  
  - le téléphone a **du réseau**,
  - le GPS est actif,

  ➜ la position est envoyée automatiquement et la trace jaune se dessine sur la carte.

- La zone de statut indique :
  - l’heure (locale du téléphone),
  - la latitude/longitude envoyées,
  - la précision estimée,
  - le nombre total de points envoyés (`total: N`).

Si des messages d’erreur apparaissent :

- `Erreur réseau` : plus de connexion → les positions ne sont **pas** envoyées.
- `Erreur GPS` : le téléphone ne parvient pas à obtenir la position
  (GPS désactivé, téléphone dans une caisse métallique, etc.).

---

## 4. Que se passe-t-il s’il n’y a plus de réseau ?

### 4.1. Important à comprendre

- L’envoi des positions se fait **en direct** vers le serveur.
- La page `gps.html` **ne stocke pas** les points localement pour les envoyer plus tard.
- Donc :
  - si le réseau coupe pendant 1h → les positions de cette heure-là sont perdues,
  - dès que le réseau revient → les points suivants seront à nouveau envoyés.

### 4.2. Recommandations pratiques

- Garder le téléphone dans un endroit où il **capte** le mieux possible
  (près d’un hublot, zone dégagée).
- Quand le réseau revient (port, proximité des côtes, etc.) :
  - vérifier que les messages `Position envoyée` réapparaissent,
  - éventuellement appuyer sur **Stop**, puis de nouveau **Start** pour relancer proprement.
- Avant une longue traversée avec peu de réseau :
  - accepter qu’il y aura des “trous” dans la trace en pleine mer,
  - mais que l’on verra bien les positions aux départs, arrivées et zones couvertes.

---

## 5. Boutons Start / Stop

### Start

- Active l’écoute GPS sur le téléphone.
- Chaque nouvelle position obtenue est envoyée au serveur.
- Le bouton Start devient grisé, Stop devient actif.

### Stop

- Arrête l’écoute GPS (plus d’envoi de positions).
- À utiliser :
  - à l’arrivée,
  - ou en cas de problème (batterie faible, etc.).

---

## 6. Sécurité – Token

Les requêtes envoyées par `gps.html` vers le serveur contiennent un **jeton secret (token)** :

- Ce token est :
  - stocké dans le code de la page,
  - vérifié par le serveur hébergé sur Render.
- Le serveur **refuse** toute écriture (ajout de points, reset, etc.) sans ce token.

Concrètement :

- la **carte publique** peut lire la trace (GET `/api/live-track`) sans token,
- seule la page GPS (ou des outils explicitement autorisés) peuvent **écrire** dans la trace.

---

## 7. En résumé pour Benjamin

1. **Avant le départ :**
   - tester à terre (voir §3.2),
   - s’assurer que la batterie et le réseau sont suffisants.

2. **Avant chaque nav :**
   - ouvrir `gps.html`,
   - accepter la géolocalisation,
   - appuyer sur **Start**,
   - vérifier qu’un message “Position envoyée” apparaît.

3. **Pendant la nav :**
   - laisser la page `gps.html` ouverte,
   - ignorer les périodes sans réseau (les points ne seront simplement pas envoyés).

4. **À l’arrivée :**
   - appuyer sur **Stop**,
   - fermer l’onglet si souhaité.

---

## 8. Notes techniques (pour l’auteur / développeur)

- Frontend : GitHub Pages  
  `https://josephgrob.github.io/benjamin-tracking-front/`
- Backend : FastAPI + Uvicorn, hébergé sur Render  
  `https://benjamin-tracking.onrender.com`
- Endpoints principaux :
  - `POST /api/position` (protégé par token, écriture)  
  - `GET /api/live-track` (lecture publique de la trace)  
  - `GET /api/position_simple` (écriture via query params, protégé par token)  
  - `POST /api/reset-track` (reset d’une trace, protégé par token)
- Les points sont stockés en mémoire (non persistants) et limités à ~2000 points.


