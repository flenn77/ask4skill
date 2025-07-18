FROM node:20

# Crée le dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances (plus rapide pour le cache Docker)
COPY package*.json ./

# Installe nodemon globalement et les dépendances locales
RUN npm install -g nodemon && npm install

# Copie le reste des fichiers du projet
COPY . .

# Port exposé
EXPOSE 5000

# Lancement du service
CMD ["npm", "run", "dev"]
