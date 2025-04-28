#!/bin/bash

# Variables
CONTAINER_NAME=fail2ban
JAIL_NAME=nodeapp

# Fonction pour récupérer ton IP
get_ip() {
  ip=$(ipconfig getifaddr en0 2>/dev/null) # Mac
  if [ -z "$ip" ]; then
    ip=$(hostname -I | awk '{print $1}') # Linux fallback
  fi
  echo "$ip"
}

LOCAL_IP=$(get_ip)

echo "➡️ Débannissement de l'IP $LOCAL_IP dans Fail2Ban..."
docker exec -it $CONTAINER_NAME fail2ban-client set $JAIL_NAME unbanip $LOCAL_IP
echo "✅ IP débannie avec succès."
