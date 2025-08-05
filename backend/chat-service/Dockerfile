FROM node:20

WORKDIR /app

# Installer curl pour le healthcheck
RUN apt-get update && apt-get install -y curl

# Installer nodemon et les dépendances
COPY package*.json ./
RUN npm install -g nodemon && npm install

# Copier le code
COPY . .

EXPOSE 5000

# Healthcheck : teste l’endpoint racine
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:5000/ || exit 1

# Démarrage en dev (hot-reload)
CMD ["npm", "run", "dev"]
