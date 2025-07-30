#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:5000/auth/login"
CONTENT="-H \"Content-Type: application/json\""

echo "=== 1) Connexion réussie ==="
curl -i -X POST $BASE_URL $CONTENT -d '{
  "email":    "test.user@example.com",
  "password": "Secur3$Pass!"
}'
echo -e "\n\n"

echo "=== 2) Mauvais mot de passe ==="
curl -i -X POST $BASE_URL $CONTENT -d '{
  "email":    "test.user@example.com",
  "password": "WrongPass123!"
}'
echo -e "\n\n"

echo "=== 3) Email inconnu ==="
curl -i -X POST $BASE_URL $CONTENT -d '{
  "email":    "unknown@example.com",
  "password": "DoesntMatter1!"
}'
echo -e "\n\n"

echo "=== 4) Email non confirmé ==="
# On suppose ici qu'on vient de créer un user non confirmé, ex. : new.pending@example.com
curl -i -X POST $BASE_URL $CONTENT -d '{
  "email":    "new.pending@example.com",
  "password": "Secur3$Pass!"
}'
echo -e "\n\n"

echo "=== 5) Format d’email invalide ==="
curl -i -X POST $BASE_URL $CONTENT -d '{
  "email":    "not-an-email",
  "password": "Whatever123!"
}'
echo -e "\n\n"

echo "=== 6) Champs manquants ==="
curl -i -X POST $BASE_URL $CONTENT -d '{}'
echo -e "\n\n"
