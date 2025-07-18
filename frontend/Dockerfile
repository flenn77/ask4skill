FROM node:20

WORKDIR /app

COPY package*.json ./

# Utilise npm ci pour des installs propres
RUN npm ci

COPY . .

# Répare les droits (utile si vite est mal installé)
RUN chmod +x node_modules/.bin/vite || true

EXPOSE 3000

CMD ["npm", "run", "dev"]
