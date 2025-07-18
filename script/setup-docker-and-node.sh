#!/bin/bash

# Fonctions pour microservices back-end
setup_backend_service() {
  local dir=$1
  echo "🔧 Configuration du service : $dir"

  cd "$dir" || return

  # Créer package.json si manquant
  if [ ! -f package.json ]; then
    echo "📦 Création de package.json"
    npm init -y
  fi

  # Ajouter script dev dans package.json
  if ! grep -q '"dev":' package.json; then
    echo "🛠️  Ajout du script dev"
    npx npm-add-script -k "dev" -v "nodemon index.js"
  fi

  # Créer index.js minimal si manquant
  if [ ! -f index.js ]; then
    echo "📄 Création de index.js"
    cat <<EOF > index.js
const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Service ${dir##*/} OK");
});

app.listen(port, () => {
  console.log("Service ${dir##*/} lancé sur le port", port);
});
EOF
  fi

  # Créer Dockerfile si manquant
  if [ ! -f Dockerfile ]; then
    echo "🐳 Création du Dockerfile"
    cat <<EOF > Dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
EOF
  fi

  cd - >/dev/null || exit
}

# Traitement des services back-end
echo "🚀 Setup des services back-end"
for service in ./backend/*; do
  if [ -d "$service" ]; then
    setup_backend_service "$service"
  fi
done

# Traitement du front-end
echo "🎨 Setup du front-end"
cd ./frontend || exit

# Créer package.json si manquant
if [ ! -f package.json ]; then
  echo "📦 Création du package.json frontend"
  npm init -y
fi

# Ajouter script dev si manquant
if ! grep -q '"dev":' package.json; then
  echo "🛠️  Ajout du script dev frontend"
  npx npm-add-script -k "dev" -v "vite"
fi

# Créer Dockerfile si manquant
if [ ! -f Dockerfile ]; then
  echo "🐳 Création du Dockerfile frontend"
  cat <<EOF > Dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
EOF
fi

cd - >/dev/null || exit

echo "✅ Script terminé. Tout est prêt."
