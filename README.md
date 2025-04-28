Parfait !  
Je vais t'intégrer **tout ce qu'on vient d'expliquer** et te livrer un **README FINAL**, à jour **et ultra propre** ✅.

---

# 📄 Voici ton **nouveau README complet et mis à jour**

(Remplace tout ton `README.md` actuel par ceci)

---

# 🎮 BrowserQuest – Version Dockerisée (Frontend + Backend + Load Balancing + Sécurisation)

Ce projet est une version dockerisée complète de [BrowserQuest](https://github.com/mozilla/BrowserQuest), un jeu multijoueur inspiré des Zelda-like, avec serveur Node.js, client HTML5/JS, Redis pour les données, **et un Load Balancer NGINX** pour la haute disponibilité.

---

## Contenu

- Serveur Node.js (`/server`) – plusieurs instances via Docker
- Client HTML5/JS (`/client`)
- Redis pour stocker l’état du jeu
- NGINX comme Load Balancer avec support WebSocket et failover automatique
- Fail2Ban intégré pour protection anti-bruteforce
- Logs d'accès HTTP pour la détection d'attaques
- Scripts Bash pour automatiser la sécurisation et les tests

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
- Ajout d'un système de **logs d'accès** dans `/logs/access.log` pour surveillance Fail2Ban

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

## 📦 Structure du projet

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
├── fail2ban/          # Config Fail2Ban
│   ├── jail.d/
│   │   └── nodeapp.local
│   ├── filter.d/
│   │   └── nodeapp.conf
│   └── restart_and_test.sh
│   └── unban.sh
├── logs/              # Dossier pour stocker les accès logs
```

---

## 🔒 Sécurisation de l'Application

- Pare-feu PF sur macOS pour limiter les ports ouverts.
- **Fail2Ban intégré dans Docker** pour protection contre le bruteforce sur l'application web.
- Surveillance en temps réel des accès à `/logs/access.log`.
- Jail spécifique `nodeapp` active : bannissement automatique après 3 comportements suspects détectés.
- Bannissement temporaire de 10 minutes (bantime = 600).
- Scripts automatiques pour tester, vérifier, et débannir facilement.

---

## 🛡️ Détail complet Fail2Ban

### 🛠️ Fichiers de configuration Fail2Ban

| Fichier | Description |
|:---|:---|
| `fail2ban/jail.d/nodeapp.local` | Paramètres de bannissement spécifiques à BrowserQuest |
| `fail2ban/filter.d/nodeapp.conf` | Filtres pour détecter les attaques dans `access.log` |
| `logs/access.log` | Fichier journalisé des connexions HTTP |

### ⚙️ Paramètres Fail2Ban utilisés

- **Bantime** : 600 secondes
- **Maxretry** : 3 tentatives
- **Findtime** : 10 secondes
- **Logpath** : `/var/log/nodeapp/access.log`

### 🚀 Scripts disponibles

- `restart_and_test.sh` : Redémarre Docker, simule 10 attaques, teste Fail2Ban, débannit IP automatiquement si besoin.
- `unban.sh` : Script rapide pour débannir ton IP.

### 🔥 Exemple rapide

```bash
chmod +x restart_and_test.sh unban.sh
./restart_and_test.sh
```

---

## 🔧 Dépannage

- Si `Connecting to the server...` reste affiché :
  - Vérifie la config WebSocket (`ws://localhost:81`)
  - Vérifie `nginx.conf` (proxy WebSocket actif)
  - Redémarre avec `docker-compose build --no-cache && docker-compose up -d`
  - Teste la santé des services :
    ```bash
    curl http://localhost:8001/health
    curl http://localhost:8002/health
    ```

- Si ton IP est bannie par erreur :
    ```bash
    ./unban.sh
    ```

---

## 🏗️ Évolutions possibles

- Ajouter HTTPS et `wss://` sécurisé
- Load balancing basé sur IP (`ip_hash`) ou charge (`least_conn`)
- Monitoring complet avec Prometheus & Grafana
- Détection avancée de pattern d'attaques réseau
- Passage futur en Docker Swarm ou Kubernetes

---

## 🎖️ Badges

![Dockerized](https://img.shields.io/badge/Docker-Ready-blue)
![Fail2Ban Protection](https://img.shields.io/badge/Fail2Ban-Protection%20Active-brightgreen)

---

## Crédits

Projet original : [Mozilla BrowserQuest](https://github.com/mozilla/BrowserQuest)  
Ousmane Sacko
Christ-Yvann
Killian izatoola
Daniel Komoe
Amadou Aliou Samake 
---

## Licence

MIT – open source

---
