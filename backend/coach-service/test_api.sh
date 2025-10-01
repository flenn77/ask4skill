#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:5002"
CT="Content-Type: application/json"

# Helper: urlencode via jq (pas de python requis)
urlencode() { jq -sRr @uri <<< "$1"; }

# --- TOKENS (signés avec 'your_jwt_secret') ---
TOKEN_COACH1="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMjIyMjIyMi0yMjIyLTIyMjItMjIyMi0yMjIyMjIyMjIyMjIiLCJyb2xlX2lkIjoyLCJyb2xlIjoiQ09BQ0giLCJpYXQiOjE3NTc4ODQwOTl9.tF9XQNb3YwaXKylCWnEVKWoLJMXhTy1mxNza8DDaups"
TOKEN_PLAYER1="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS0xMTExLTQxMTEtODExMS0xMTExMTExMTExMTEiLCJyb2xlX2lkIjoxLCJyb2xlIjoiUExBWUVSIiwiaWF0IjoxNzU3ODg0MDk5fQ.OLxfY-3_WLOEaMmKFPyGCqkyYYm8K4pr3uwisOG48uU"
TOKEN_ADMIN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYWFhYWFhYS1hYWFhLTRhYWEtOGFhYS1hYWFhYWFhYWFhYWEiLCJyb2xlX2lkIjozLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NTc4ODQwOTl9.WM85iuEnYJ7rR4bsF-0sob5M3-25WnF0qbrex_aEnQw"

AUTH_COACH1="Authorization: Bearer ${TOKEN_COACH1}"
AUTH_PLAYER1="Authorization: Bearer ${TOKEN_PLAYER1}"
AUTH_ADMIN="Authorization: Bearer ${TOKEN_ADMIN}"

# --- IDs des coach_profiles seeded ---
CP1="c1111111-1111-4111-8111-111111111111"
CP2="c2222222-2222-4222-8222-222222222222"
CP3="c3333333-3333-4333-8333-333333333333"

echo "== Health =="
curl -sS "${BASE}/health" | jq .
curl -sS "${BASE}/" | cat; echo; echo

echo "== Public: liste & détails coachs =="
curl -sS "${BASE}/coachs?game=Valorant&specialty=individuel&priceField=heure&priceMin=10&priceMax=60&sort=price_asc" | jq '.[0:3]'
curl -sS "${BASE}/coachs/${CP1}" | jq .

echo
echo "== Coach: GET /coach/profile (coach1) =="
curl -sS -H "$AUTH_COACH1" "${BASE}/coach/profile" | jq .

echo
echo "== Coach: PATCH /coach/profile (maj titre + dispo) =="
curl -sS -X PATCH -H "$CT" -H "$AUTH_COACH1" \
  -d '{"titre":"FPS & Aim Coaching (updated)","disponible_actuellement":true}' \
  "${BASE}/coach/profile" | jq .

echo
echo "== Coach: Games =="
echo "GET"
curl -sS -H "$AUTH_COACH1" "${BASE}/coach/games" | jq .
echo "POST (Apex Legends)"
curl -sS -X POST -H "$CT" -H "$AUTH_COACH1" \
  -d '{"game":"Apex Legends"}' \
  "${BASE}/coach/games" | jq .
echo "DELETE (Apex Legends)"
GAME_DEL=$(urlencode "Apex Legends")
curl -sS -X DELETE -H "$AUTH_COACH1" \
  "${BASE}/coach/games/${GAME_DEL}" | jq .

echo
echo "== Coach: Spécialités =="
echo "GET"
curl -sS -H "$AUTH_COACH1" "${BASE}/coach/specialites" | jq .
echo "POST (analyse)"
curl -sS -X POST -H "$CT" -H "$AUTH_COACH1" \
  -d '{"specialty":"analyse"}' \
  "${BASE}/coach/specialites" | jq .
echo "DELETE (analyse)"
curl -sS -X DELETE -H "$AUTH_COACH1" \
  "${BASE}/coach/specialites/analyse" | jq .

echo
echo "== Coach: Palmarès =="
echo "GET"
curl -sS -H "$AUTH_COACH1" "${BASE}/coach/palmares" | jq '.[0:3]'
echo "POST -> capture ID"
PID=$(curl -sS -X POST -H "$CT" -H "$AUTH_COACH1" \
  -d '{"titre":"Top 500 Aim Routine","description":"test api","annee":2025}' \
  "${BASE}/coach/palmares" | jq -r '.id')
echo "PID=$PID"
echo "PATCH"
curl -sS -X PATCH -H "$CT" -H "$AUTH_COACH1" \
  -d '{"description":"maj via curl"}' \
  "${BASE}/coach/palmares/${PID}" | jq .
echo "DELETE"
curl -sS -X DELETE -H "$AUTH_COACH1" \
  "${BASE}/coach/palmares/${PID}" | jq .

echo
echo "== Joueur: créer 2 demandes (INDIVIDUEL & REPLAY) =="
DATE_IN_2H="$(date -u -d '+2 hours' +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+2H +"%Y-%m-%dT%H:%M:%SZ")"
D1=$(curl -sS -X POST -H "$CT" -H "$AUTH_PLAYER1" \
  -d "{\"coach_id\":\"${CP1}\",\"type\":\"INDIVIDUEL\",\"date_debut\":\"${DATE_IN_2H}\",\"duree_min\":60,\"message_joueur\":\"session aim\"}" \
  "${BASE}/demandes" | jq -r '.id')
echo "D1=${D1}"

D2=$(curl -sS -X POST -H "$CT" -H "$AUTH_PLAYER1" \
  -d "{\"coach_id\":\"${CP1}\",\"type\":\"REPLAY\",\"message_joueur\":\"analyse VOD\"}" \
  "${BASE}/demandes" | jq -r '.id')
echo "D2=${D2}"

echo
echo "== Joueur: GET /demandes/moi =="
curl -sS -H "$AUTH_PLAYER1" "${BASE}/demandes/moi" | jq '.[0:5] | map({id, type, statut, date_debut, prix_centimes})'

echo
echo "== Détail d’une demande (participant) =="
curl -sS -H "$AUTH_PLAYER1" "${BASE}/demandes/${D1}" | jq .

echo
echo "== Coach: lister les demandes reçues (EN_ATTENTE) =="
curl -sS -H "$AUTH_COACH1" "${BASE}/coach/demandes?statut=EN_ATTENTE" | jq '.[0:5] | map({id, type, statut, date_debut})'

echo
echo "== Coach: accepter D1 (avec conversation_id) =="
curl -sS -X POST -H "$CT" -H "$AUTH_COACH1" \
  -d '{"conversation_id":"conv_demo_from_curl"}' \
  "${BASE}/coach/demandes/${D1}/accepter" | jq .

echo
echo "== Coach: refuser D2 (avec raison) =="
curl -sS -X POST -H "$CT" -H "$AUTH_COACH1" \
  -d '{"raison_refus":"créneau incompatible"}' \
  "${BASE}/coach/demandes/${D2}/refuser" | jq .

echo
echo "== Joueur: archiver D2 (statut devient ARCHIVEE) =="
curl -sS -X POST -H "$CT" -H "$AUTH_PLAYER1" \
  -d '{"commentaire": "ok pour archiver"}' \
  "${BASE}/demandes/${D2}/archiver" | jq .

echo
echo "== Négatif (attendu 403): joueur tente d’aller sur /coach/games =="
curl -sS -i -H "$AUTH_PLAYER1" "${BASE}/coach/games" | sed -n '1,10p'


echo
echo "== Coach: Offers =="
echo "LIST (vide au début ?)"
curl -sS -H "$AUTH_COACH1" "${BASE}/coach/offers?page=1&perPage=5" | jq .

echo "POST -> créer 2 offres"
O1=$(curl -sS -X POST -H "$CT" -H "$AUTH_COACH1" \
  -d '{"type":"INDIVIDUEL","titre":"Aim 1h","description":"routine crosshair + tracking","duree_min":60,"prix_centimes":4500,"devise":"EUR"}' \
  "${BASE}/coach/offers" | jq -r '.id')
echo "O1=${O1}"

O2=$(curl -sS -X POST -H "$CT" -H "$AUTH_COACH1" \
  -d '{"type":"REPLAY","titre":"Analyse VOD 20 min","prix_centimes":2500,"devise":"EUR"}' \
  "${BASE}/coach/offers" | jq -r '.id')
echo "O2=${O2}"

echo "LIST filtrée actif=true, tri prix asc"
curl -sS -H "$AUTH_COACH1" "${BASE}/coach/offers?actif=true&sort=prix_centimes:asc" | jq .

echo "PATCH O1 (déscription + prix)"
curl -sS -X PATCH -H "$CT" -H "$AUTH_COACH1" \
  -d '{"description":"routine + VOD courte","prix_centimes":5000}' \
  "${BASE}/coach/offers/${O1}" | jq .

echo "DESACTIVER O2"
curl -sS -X POST -H "$AUTH_COACH1" "${BASE}/coach/offers/${O2}/desactiver" | jq .

echo "DELETE O1"
curl -sS -X DELETE -H "$AUTH_COACH1" "${BASE}/coach/offers/${O1}" | jq .



echo
echo "✅ Tests cURL terminés."
