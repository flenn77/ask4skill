#!/usr/bin/env bash
# tests_register.sh
# Script de tests pour POST /auth/register

BASE_URL="http://localhost:5000/auth/register"

echo
echo "=== 1) Inscription valide ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test.user@example.com",
    "password":"Secur3$Pass!",
    "pseudo":"test_user",
    "prenom":"Test",
    "nom":"User",
    "avatar_url":"https://example.com/avatar.png",
    "sexe":"H",
    "date_naissance":"1990-01-01",
    "telephone":"+33123456789"
  }'
echo; echo

echo "=== 2) Email déjà utilisé ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test.user@example.com",
    "password":"Secur3$Pass!",
    "pseudo":"other_user",
    "prenom":"Other",
    "nom":"User"
  }'
echo; echo

echo "=== 3) Mot de passe trop faible ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"weak.pass@example.com",
    "password":"weak",
    "pseudo":"weakpass",
    "prenom":"Weak",
    "nom":"Pass"
  }'
echo; echo

echo "=== 4) Pseudo invalide (trop court) ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"short.user@example.com",
    "password":"Secur3$Pass!",
    "pseudo":"ab",
    "prenom":"Short",
    "nom":"User"
  }'
echo; echo

echo "=== 5) Email invalide ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"not-an-email",
    "password":"Secur3$Pass!",
    "pseudo":"foo_user",
    "prenom":"Foo",
    "nom":"Bar"
  }'
echo; echo

echo "=== 6) Date de naissance format invalide ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"bad.date@example.com",
    "password":"Secur3$Pass!",
    "pseudo":"bad_date",
    "prenom":"Bad",
    "nom":"Date",
    "date_naissance":"31-12-2010"
  }'
echo; echo

echo "=== 7) Trop jeune (âge < 13) ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"too.young@example.com",
    "password":"Secur3$Pass!",
    "pseudo":"too_young",
    "prenom":"Too",
    "nom":"Young",
    "date_naissance":"2015-01-01"
  }'
echo; echo

echo "=== 8) Téléphone invalide ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"bad.phone@example.com",
    "password":"Secur3$Pass!",
    "pseudo":"bad_phone",
    "prenom":"Bad",
    "nom":"Phone",
    "telephone":"012345"
  }'
echo; echo

echo "=== 9) Champs manquants ==="
curl -i -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{}'
echo; echo
