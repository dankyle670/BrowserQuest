#!/bin/bash

# Variables
CONTAINER_NAME=fail2ban
JAIL_NAME=nodeapp
LOCAL_IP="172.17.0.1"  # À ajuster selon ton réseau Docker si besoin

# Fonction pour obtenir ton IP locale automatiquement (plus propre)
get_ip() {
  ip=$(ipconfig getifaddr en0 2>/dev/null) # MacOS
  if [ -z "$ip" ]; then
    ip=$(hostname -I | awk '{print $1}') # Linux fallback
  fi
  echo "$ip"
}

LOCAL_IP=$(get_ip)

# Script principal
echo "➡️  [1] Arrêt et suppression de tous les conteneurs..."
docker-compose down --volumes --remove-orphans

echo "➡️  [2] Reconstruction des images Docker sans cache..."
docker-compose build --no-cache

echo "➡️  [3] Redémarrage de tout Docker Compose..."
docker-compose up -d

echo "⏳ Attente de 10 secondes que les services soient prêts..."
sleep 10

echo "➡️  [4] Test d'attaque (10 requêtes sur localhost:8005)..."
for i in {1..10}; do curl -s http://localhost:8005 > /dev/null; done

echo "➡️  [5] Vérification de l'état de Fail2Ban..."
docker exec -it $CONTAINER_NAME fail2ban-client status $JAIL_NAME

echo "➡️  [6] Vérification si ton IP $LOCAL_IP est bannie..."
BANNED=$(docker exec -it $CONTAINER_NAME fail2ban-client status $JAIL_NAME | grep "$LOCAL_IP")

if [ -n "$BANNED" ]; then
  echo "🚫 Ton IP est bannie !"
  echo "✅ Débannissement automatique..."
  docker exec -it $CONTAINER_NAME fail2ban-client set $JAIL_NAME unbanip $LOCAL_IP
  echo "✅ Ton IP a été débannie."
else
  echo "✅ Ton IP n'est pas bannie, tout est OK."
fi

echo "🎉 Fin du script."
