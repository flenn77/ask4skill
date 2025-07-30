#!/usr/bin/env bash
set -e

# 1) On enregistre un nouvel utilisateur
echo "1) Enregistrement d’un utilisateur de test…"
curl -s -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":      "verifyme@example.com",
    "password":   "Secur3$Pass!",
    "pseudo":     "verify_user",
    "prenom":     "Verify",
    "nom":        "Me",
    "avatar_url": "https://example.com/avatar.png",
    "sexe":       "H",
    "date_naissance":"1990-01-01",
    "telephone":  "+33123456789"
  }' >/dev/null
echo "   → OK"

# Petite attente pour que MailDev reçoive le mail
sleep 1

# 2) On récupère depuis MailDev via son API l’URL de confirmation
echo "2) Extraction du token depuis MailDev…"
MAIL=$(curl -s http://localhost:1080/email)  # liste des emails reçus
# on récupère le premier email et on extrait le lien href
CONFIRM_URL=$(echo "$MAIL" \
  | jq -r '.[0].html' \
  | grep -oE 'http://[^"]+' \
  | grep '/auth/confirm?token=')
echo "   → URL de confirmation : $CONFIRM_URL"

# 3) On appelle l’endpoint de confirmation
echo "3) Appel de l’endpoint de confirmation…"
curl -i -X GET "$CONFIRM_URL"
