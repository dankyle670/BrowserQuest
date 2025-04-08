# Utilise une image Node.js officielle
FROM node:16

# Dossier de travail dans le conteneur
WORKDIR /app

# Copie tous les fichiers dans le conteneur
COPY . .

# Installation des dépendances dans le dossier server
RUN cd server && npm install

# Port exposé par le serveur (par défaut BrowserQuest utilise le port 8000)
EXPOSE 8000

# Commande de lancement
CMD ["node", "server/js/main.js"]
