Ajoute ce bloc dans ton docker-compose.yml à la fin des services :

  fail2ban:
    image: crazymax/fail2ban:latest
    container_name: fail2ban
    restart: unless-stopped
    volumes:
      - ./fail2ban/jail.local:/data/jail.local
      - ./fail2ban/filter.d:/data/filter.d
      - ./logs:/var/log/nodeapp:ro
