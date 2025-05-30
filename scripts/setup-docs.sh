#!/bin/bash

# Script para configurar la documentación

# Crear directorio de documentación si no existe
mkdir -p docs

# Mover archivos de documentación al directorio docs
echo "Moviendo archivos de documentación..."

# Lista de archivos a mover
files=(
  "README.md"
  "OKTA_SETUP.md"
  "ENVIRONMENT_VARIABLES.md"
  "ARCHITECTURE.md"
  "API_ENDPOINTS.md"
  "TROUBLESHOOTING.md"
  "TESTING.md"
)

# Verificar y mover cada archivo
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Moviendo $file a docs/"
    mv "$file" "docs/"
  else
    echo "Advertencia: $file no encontrado"
  fi
done

echo "Configuración de documentación completada"
