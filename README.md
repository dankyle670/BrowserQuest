Parfait, alors je vais tout t’envoyer **propre et complet** ! 🚀

---

# 📜 Voici ton **README.md final corrigé et enrichi**

(Copie **tout ça** pour remplacer ton README actuel)

---

# 🎮 BrowserQuest – Version Dockerisée (Frontend + Backend + Load Balancing)

Ce projet est une version dockerisée complète de [BrowserQuest](https://github.com/mozilla/BrowserQuest), un jeu multijoueur inspiré des Zelda-like, avec serveur Node.js, client HTML5/JS, Redis pour les données, **et un Load Balancer NGINX** pour la haute disponibilité.

---

## Contenu

- Serveur Node.js (`/server`) – plusieurs instances via Docker
- Client HTML5/JS (`/client`)
- Redis pour stocker l’état du jeu
- NGINX comme Load Balancer avec support WebSocket et failover automatique
- Fail2Ban intégré pour protection anti-bruteforce
- Configuration Docker complète pour tout lancer facilement

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
docker-compose up -d
```

Accès au client (jeu) :
👉 [http://localhost:81/client](http://localhost:81/client)

Connexion WebSocket :
👉 `ws://localhost:81`

Le backend tourne sur 2 instances internes (`app1` et `app2`) sur le port `8000`, load balancées par NGINX.  
Redis tourne sur le port `6379`.

---

## ⚙️ Fichiers modifiés / ajouts importants

### 🔧 Docker

- `Dockerfile.client` pour le client
- `Dockerfile` pour le backend
- `docker-compose.yml` : déploiement multi-instance + redis + nginx + fail2ban
- `nginx.conf` : configuration du proxy WebSocket avec failover et load balancing

### 🔧 Backend

- Ajout d'un endpoint `/health` pour les healthchecks Docker/NGINX
- Mise en place de logs d'accès dans `logs/access.log`

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
├── fail2ban/          # Config Fail2Ban (anti-bruteforce)
│   ├── jail.d/
│   │   └── nodeapp.local
│   ├── filter.d/
│   │   └── nodeapp.conf
│   └── restart_and_test.sh
├── logs/              # Dossier pour stocker les accès logs
```

---

## 🔒 Sécurisation de l'Application

- Mise en place d’un pare-feu PF sur macOS pour bloquer toutes les connexions entrantes sauf les ports utiles (8080, 81...).
- Activation de Fail2Ban avec surveillance automatique des accès HTTP au serveur.
- Jail `nodeapp` active pour bannir automatiquement les IPs en cas d'abus.
- Surveillances sur `/logs/access.log`.

---

## 🛡️ Ajout de Fail2Ban (Protection Anti-Bruteforce)

- Intégration de Fail2Ban dans Docker via `crazymax/fail2ban:latest`
- Configuration montée via :
  - `fail2ban/jail.d/nodeapp.local`
  - `fail2ban/filter.d/nodeapp.conf`
- Surveillance du fichier `/logs/access.log`
- Bannissement après 3 accès suspects (tentatives massives de connexion par exemple).
- Durée du bannissement par défaut : **600 secondes** (10 minutes).

### 📜 Script d'automatisation

- **`restart_and_test.sh`** : script Bash pour :
  - Rebuild complet du projet
  - Relancer Docker
  - Simuler 10 attaques
  - Vérifier l'état Fail2Ban
  - Débannir automatiquement l'IP locale si nécessaire

Utilisation rapide :

```bash
chmod +x restart_and_test.sh
./restart_and_test.sh
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
- Détection automatique d'attaques plus avancée (fail2ban regex + honeypots)

---

## Crédits

Projet original : [Mozilla BrowserQuest](https://github.com/mozilla/BrowserQuest)  
Dockerisation & Sécurisation Fail2Ban : Ousmane Sacko 🚀

---

## Licence

MIT – open source

---

# 🎖️ Bonus

**Badge de protection Fail2Ban actif** que tu peux aussi rajouter dans le haut du README :

```markdown
![Fail2Ban Protection](https://img.shields.io/badge/Fail2Ban-Protection%20Active-brightgreen)
```

Exemple visuel :

![Fail2Ban Protection](https://img.shields.io/badge/Fail2Ban-Protection%20Active-brightgreen)

---

# ✅ Voilà tout est prêt !
