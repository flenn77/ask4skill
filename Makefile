# Variables
FRONT_DIR = frontend
BACKEND_DIR = backend
DOCKER_DIR = docker
DOCKER_COMPOSE = docker compose -f $(DOCKER_DIR)/docker-compose.yml
SERVICES = auth-service user-service coach-service booking-service chat-service payment-service admin-service notification-service

# Lancer tous les services (back + front + db)
start:
	$(DOCKER_COMPOSE) up -d --build

# Arrêter tous les services
stop:
	$(DOCKER_COMPOSE) down

# Redémarrer tous les services
restart:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) up -d --build

# Redémarrer un seul service (ex: make restart-service SERVICE=auth-service)
restart-service:
	$(DOCKER_COMPOSE) restart $(SERVICE)

# Installer les dépendances Node.js
install:
	cd $(FRONT_DIR) && npm install && cd -
	@for service in $(SERVICES); do \
		echo "Installation dans $$service..."; \
		cd $(BACKEND_DIR)/$$service && npm install && cd -; \
	done

# Lancer tous les serveurs en mode dev local (sans Docker)
dev:
	cd $(FRONT_DIR) && npm run dev &
	@for service in $(SERVICES); do \
		cd $(BACKEND_DIR)/$$service && npm run dev & \
	done

# Nettoyage complet des containers, images et volumes
clean:
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans

# Afficher les logs Docker
logs:
	$(DOCKER_COMPOSE) logs -f

# Vérifie que tous les services sont bien montés
check:
	$(DOCKER_COMPOSE) ps
