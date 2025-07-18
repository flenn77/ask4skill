#!/bin/bash

# Nom du projet
PROJECT_NAME="ask4skill"
mkdir $PROJECT_NAME && cd $PROJECT_NAME

# Dossiers principaux
mkdir frontend backend docker

#########################################
# FRONTEND - React + Vite + TailwindCSS
#########################################
echo "Creating frontend..."
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Config Tailwind (vite + tailwind)
cat > tailwind.config.js <<EOL
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

cd ..

#########################################
# BACKEND - Microservices Node.js
#########################################

SERVICES=("auth-service" "user-service" "coach-service" "booking-service" "chat-service" "payment-service" "admin-service" "notification-service")

echo "Creating backend microservices..."

for service in "${SERVICES[@]}"; do
  mkdir -p backend/$service/src
  cd backend/$service
  npm init -y

  # Dépendances générales
  npm install express dotenv cors
  npm install --save-dev nodemon

  # Dépendances spécifiques
  if [[ "$service" == "auth-service" ]]; then
    npm install bcrypt jsonwebtoken
  fi

  if [[ "$service" == "payment-service" ]]; then
    npm install stripe
  fi

  if [[ "$service" == "chat-service" ]]; then
    npm install socket.io
  fi

  if [[ "$service" == "notification-service" ]]; then
    npm install nodemailer
  fi

  # Script de démarrage
  npx json -I -f package.json -e 'this.scripts = { "dev": "nodemon src/index.js" }'

  cd ../../
done

#########################################
# DATABASE + TOOLS via Docker
#########################################

echo "Creating docker environment..."
cd docker

cat > docker-compose.yml <<'EOL'
version: '3.8'
services:
  mysql:
    image: mysql:8
    container_name: mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ask4skill
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  phpmyadmin:
    image: phpmyadmin
    restart: always
    ports:
      - "8080:80"
    environment:
      PMA_HOST: mysql
      MYSQL_ROOT_PASSWORD: root
    depends_on:
      - mysql

  maildev:
    image: maildev/maildev
    ports:
      - "1080:1080"
      - "1025:1025"

volumes:
  mysql_data:
EOL

cd ..

#########################################
# FIN
#########################################

echo "✅ Projet $PROJECT_NAME initialisé avec succès !"
echo "📂 Structure :"
echo " - frontend (React + Tailwind)"
echo " - backend (8 microservices Node.js)"
echo " - docker (MySQL + phpMyAdmin + Maildev)"

echo ""
echo "🚀 Prochaines étapes :"
echo "1. cd $PROJECT_NAME"
echo "2. docker compose -f docker/docker-compose.yml up -d"
echo "3. Lance tes services avec : cd backend/auth-service && npm run dev"
