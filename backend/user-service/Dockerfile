FROM node:20

WORKDIR /app

# 1) installer curl pour le healthcheck
RUN apt-get update && apt-get install -y curl

# 2) dépendances
COPY package*.json ./
RUN npm install -g nodemon && npm install

# 3) code
COPY . .

EXPOSE 5000

# 4) healthcheck : teste la racine HTTP
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:5000/ || exit 1

# 5) démarrage en dev (nodemon)
CMD ["npm", "run", "dev"]
