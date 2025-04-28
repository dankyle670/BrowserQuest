== Instructions pour corriger Fail2Ban dans BrowserQuest ==

1. Copie le dossier 'fail2ban/' à la racine du projet (à côté de docker-compose.yml).
2. Remplace les volumes de fail2ban dans docker-compose.yml par :

  fail2ban:
    image: crazymax/fail2ban:latest
    container_name: fail2ban
    restart: unless-stopped
    volumes:
      - ./fail2ban/jail.d:/data/jail.d
      - ./fail2ban/filter.d:/data/filter.d
      - ./logs:/var/log/nodeapp:ro

3. Redémarre Fail2Ban :

docker-compose restart fail2ban

4. Vérifie :

docker exec -it fail2ban fail2ban-client status
