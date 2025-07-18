#!/bin/bash

# Liste des services avec leurs noms de conteneur et ports à tester
declare -A services=(
  [ask4skill-mysql]=3306
  [ask4skill-phpmyadmin]=8080
  [ask4skill-maildev]=1080
  [ask4skill-auth-service]=5001
  [ask4skill-user-service]=5002
  [ask4skill-coach-service]=5003
  [ask4skill-booking-service]=5004
  [ask4skill-chat-service]=5005
  [ask4skill-payment-service]=5006
  [ask4skill-admin-service]=5007
  [ask4skill-notification-service]=5008
  [ask4skill-frontend]=3000
)

echo "📦 Vérification des services Docker..."

for container in "${!services[@]}"; do
  port=${services[$container]}

  # Vérifie si le conteneur est up
  if docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null | grep true > /dev/null; then
    echo "✅ $container est en cours d'exécution."
    
    # Teste l'accessibilité du port
    if nc -z localhost $port; then
      echo "   🔗 Port $port est ouvert et accessible."
    else
      echo "   ⚠️  Port $port n'est pas accessible (vérifie l'application dans le conteneur)."
    fi
  else
    echo "❌ $container n'est pas démarré ou n'existe pas."
  fi
done
