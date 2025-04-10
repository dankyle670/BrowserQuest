
# 🎮 BrowserQuest – Version Dockerisée (Frontend + Backend)

Ce projet est une version dockerisée complète de [BrowserQuest](https://github.com/mozilla/BrowserQuest), un jeu multijoueur inspiré de Zelda-like, avec serveur Node.js, client HTML5/JS, et Redis comme moteur de données.

---

## Contenu

- Serveur Node.js (`/server`)
- Client HTML5/JS (`/client`)
- Redis pour stocker l’état du jeu
- Configuration Docker pour tout lancer facilement

---

## 🐳 Lancer le projet avec Docker

### 1. Prérequis

- Avoir installé Docker et Docker Compose :
   [Installer Docker](https://docs.docker.com/get-docker/)

### 2. Lancer le projet

Dans le dossier racine du projet (où se trouve `docker-compose.yml`) :

```bash
docker-compose down --volumes --remove-orphans
docker-compose build --no-cache
docker-compose up
```

Accès au client (jeu) :
[http://localhost:8080](http://localhost:8080)

Le backend (serveur de jeu) tourne sur le port : `8000`
Redis tourne sur le port : `6379` (en interne)

---

## ⚙️ Fichiers modifiés / ajouts importants

### 🔧 Docker

- `Dockerfile.client` pour le client (React-like frontend)
- `Dockerfile` pour le backend (Node.js + server.js)
- `docker-compose.yml` : pour lier `client`, `server` et `redis`

### 🔧 Backend

- Aucun changement majeur dans `/server`, sauf installation de ses dépendances via Docker (`npm install`).

### 🔧 Frontend

Dans `client/js/game.js` (ou similaire) :
Nous avons forcé la connexion directe au backend :

```js
var host = window.location.hostname === "localhost" ? "localhost" : "app";
this.client = new GameClient(host, 8000);
this.client.connect(false);
```

## Modifications des dépendances (package.json)
Lors de la Dockerisation et de la mise à jour du projet BrowserQuest, certaines dépendances ont été modifiées pour assurer une meilleure compatibilité et stabilité :

## Anciennes dépendances :

"dependencies": {
  "underscore": ">0",
  "log": ">0",
  "bison": ">0",
  "websocket": ">0",
  "websocket-server": ">0",
  "sanitizer": ">0",
  "memcache": ">0"
}

## Nouvelles dépendances :

"dependencies": {
  "underscore": "^1.13.6",
  "log": "^1.4.0",
  "websocket": "^1.0.34",
  "sanitizer": "^0.1.3",
  "memcached": "^2.2.2"
}

- Passage à des versions spécifiques et stables
- Suppression de:
    bison (non utilisé dans le code actuel ou obsolète)
    websocket-server (fusionné ou obsolète avec websocket)
    memcache (non maintenu)
- Ajout de:
    memcached (lib stable et compatible avec Docker et Redis)

---

## Structure du projet

```
BrowserQuest/
├── client/            # Frontend
├── server/            # Backend
├── shared/            # Code partagé
├── bin/               # Script build.sh + r.js
├── tools/             # config RequireJS
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile
```

---

## Dépannage

- Si le message `Connecting to the server...` reste affiché :
  - Vérifie que le client se connecte bien à `ws://app:8000` dans le code.
  - Assure-toi que le port 8000 du backend est exposé.
  - Lancer un `docker-compose build --no-cache` + `up` pour forcer la reconstruction.

---

## Crédits

Projet original : [Mozilla BrowserQuest](https://github.com/mozilla/BrowserQuest)
Dockerisation & Adaptation : Ton nom / équipe

---

## Licence

MIT – open source
