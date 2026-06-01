#!/bin/bash

# Nombre del contenedor Docker
CONTAINER_NAME="angular_portal_pacientes"

# Ruta del proyecto en la máquina host
PROJECT_PATH="$(pwd)"

# Nombre de la carpeta del proyecto (último segmento de la ruta)
PROJECT_NAME="$(basename "$PROJECT_PATH")"

# Ruta dentro del contenedor (ajústala si tu docker-compose usa otra)
CONTAINER_PATH="/var/www/html/$PROJECT_NAME"

echo "➡️  Entrando al contenedor '$CONTAINER_NAME' en: $CONTAINER_PATH"

# Ejecutar bash dentro del contenedor y moverse a la carpeta del proyecto
docker exec -it "$CONTAINER_NAME" bash