# 🎮 BrowserQuest – Version Dockerisée (Frontend + Backend + Load Balancing)

Ce projet est une version dockerisée complète de [BrowserQuest](https://github.com/mozilla/BrowserQuest), un jeu multijoueur inspiré des Zelda-like, avec serveur Node.js, client HTML5/JS, Redis pour les données, **et un Load Balancer NGINX** pour la haute disponibilité.

---

## Contenu

- Serveur Node.js (`/server`) – plusieurs instances via Docker
- Client HTML5/JS (`/client`)
- Redis pour stocker l’état du jeu
- NGINX comme Load Balancer avec support WebSocket et failover automatique
- Configuration Docker pour tout lancer facilement

---

## 🐳 Lancer le projet avec Docker

### 1. Prérequis

- Avoir installé Docker et Docker Compose :
   [Installer Docker](https://docs.docker.com/get-docker/)

### 2. Lancer le projet

Dans le dossier racine du projet (où se trouve `docker-compose.yml`) :

#### Changez le dockerfile.client du client si sur windows powershell

### debut du fichier

FROM node:16-alpine

# Serveur statique
RUN npm install -g serve

WORKDIR /app

# Copie des fichiers nécessaires au build
COPY client/ client/
COPY bin/ bin/
COPY tools/ tools/
COPY shared/ shared/
COPY client/config/config_build.json-dist client/config/config_build.json

# Exécuter directement les commandes de build dans le Dockerfile
RUN BUILDDIR="/app/client-build" && \
    PROJECTDIR="/app/client/js" && \
    RJS="/app/bin/r.js" && \
    echo "Deleting previous build directory" && \
    rm -rf $BUILDDIR && \
    echo "Building client with RequireJS" && \
    cd $PROJECTDIR && \
    node $RJS -o build.js && \
    echo "Removing unnecessary js files from the build directory" && \
    find $BUILDDIR/js -type f -not \( -name "game.js" -o -name "home.js" -o -name "log.js" -o -name "require-jquery.js" -o -name "modernizr.js" -o -name "css3-mediaqueries.js" -o -name "mapworker.js" -o -name "detect.js" -o -name "underscore.min.js" -o -name "text.js" \) -delete && \
    echo "Removing sprites directory" && \
    rm -rf $BUILDDIR/sprites && \
    echo "Removing config directory" && \
    rm -rf $BUILDDIR/config && \
    echo "Moving build.txt to current dir" && \
    mv $BUILDDIR/build.txt /app && \
    echo "Build complete"

# Dossier final de déploiement
WORKDIR /app/client-build

# Lancer le serveur frontend
CMD ["serve", "-s", ".", "-l", "8080"]

### fin du fichier

```bash
sudo docker compose down --volumes --remove-orphans
sudo docker container prune -f
sudo docker-compose up --build
```
```Powershell
docker compose down --volumes --remove-orphans
docker container prune -f
docker-compose up --build
```

Accès au client (jeu) :
👉 [http://localhost:81/client](http://localhost:81/client)
      ou si port 80 libre
👉 [http://localhost:8080](http://localhost:8080)

Connexion WebSocket :
👉 `ws://localhost:81`

Le backend tourne sur 2 instances internes (`app1` et `app2`) sur le port `8000`, load balancées par NGINX.
Redis tourne sur le port `6379`.

---

## ⚙️ Fichiers modifiés / ajouts importants

### 🔧 Docker

- `Dockerfile.client` pour le client
- `Dockerfile` pour le backend
- `docker-compose.yml` : déploiement multi-instance + redis + nginx
- `nginx.conf` : configuration du proxy WebSocket avec failover et load balancing

### 🔧 Backend

- Ajout d'un endpoint `/health` pour les healthchecks Docker/NGINX

### 🔧 Frontend

Dans `client/config/config_build.json` :

```json
{
  "host": "localhost",
  "port": 81,
  "secure": false
}
```

Dans le code client WebSocket (game.js ou équivalent) :

```js
const protocol = config.secure ? 'wss' : 'ws';
const socket = new WebSocket(`${protocol}://${window.location.hostname}:${config.port}`);
```

Cela permet de pointer dynamiquement vers `localhost:81` en dev et `nginx:81` en Docker.

---

## Modifications des dépendances (package.json)

### Anciennes dépendances :
```json
"dependencies": {
  "underscore": ">0",
  "log": ">0",
  "bison": ">0",
  "websocket": ">0",
  "websocket-server": ">0",
  "sanitizer": ">0",
  "memcache": ">0"
}
```

### Nouvelles dépendances :
```json
"dependencies": {
  "underscore": "^1.13.6",
  "log": "^1.4.0",
  "websocket": "^1.0.34",
  "sanitizer": "^0.1.3",
  "memcached": "^2.2.2"
}
```

- Passage à des versions stables
- Suppression de `bison`, `websocket-server`, `memcache` (obsolètes ou non utilisés)
- Ajout de `memcached`

---

## Structure du projet

```
BrowserQuest/
├── client/            # Frontend
├── server/            # Backend (2 instances)
├── shared/            # Code partagé
├── bin/               # Scripts de build
├── tools/             # Config RequireJS
├── nginx.conf         # Config du Load Balancer
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile
```

---

## 🔧 Dépannage

- Si le message `Connecting to the server...` reste affiché :
  - Vérifie que le client appelle bien `ws://localhost:81`
  - Vérifie que `nginx.conf` contient les bons headers WebSocket
  - Redémarre avec `docker-compose build --no-cache && docker-compose up -d`
  - Teste `/health` sur les instances :
    ```bash
    curl http://localhost:8001/health
    curl http://localhost:8002/health
    ```

---

## 🏗️ Évolutions possibles

- Ajouter HTTPS + `wss://`
- Load balancing par IP (`ip_hash`) ou charge (`least_conn`)
- Monitoring via Grafana/Prometheus
- Mise à l’échelle automatique via Docker Swarm ou Kubernetes

---

## Crédits

Projet original : [Mozilla BrowserQuest](https://github.com/mozilla/BrowserQuest)
Dockerisation & Haute dispo : Ton nom / équipe

---

## Licence

MIT – open source