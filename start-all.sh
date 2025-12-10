#!/bin/bash

# Script para ejecutar todo el stack de AtlasERP
# Backend (NestJS) + Frontend (React) + POS (React)

echo "🚀 Iniciando AtlasERP..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AtlasERP - Sistema ERP Integrado  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "pos" ]; then
    echo -e "${RED}Error: Debe ejecutar este script desde la raíz del proyecto${NC}"
    echo "Estructura esperada: backend/, frontend/, pos/"
    exit 1
fi

# Función para ejecutar en terminal
run_in_terminal() {
    local name=$1
    local dir=$2
    local command=$3
    
    echo -e "${GREEN}▶ Iniciando ${name}...${NC}"
    cd "$dir"
    eval "$command" &
    cd - > /dev/null
}

# Iniciar Backend
echo -e "${YELLOW}[1/3] Backend (http://localhost:3000)${NC}"
run_in_terminal "Backend" "backend" "npm run start:dev"
sleep 3

# Iniciar Frontend
echo -e "${YELLOW}[2/3] Frontend (http://localhost:5173)${NC}"
run_in_terminal "Frontend" "frontend" "npm run dev"
sleep 3

# Iniciar POS
echo -e "${YELLOW}[3/3] POS (http://localhost:5174)${NC}"
run_in_terminal "POS" "pos" "npm run dev"

echo ""
echo -e "${GREEN}✅ Todos los servicios iniciados!${NC}"
echo ""
echo -e "${BLUE}URLs disponibles:${NC}"
echo -e "  📊 Backend API:      ${GREEN}http://localhost:3000${NC}"
echo -e "  📚 Swagger Docs:     ${GREEN}http://localhost:3000/api/docs${NC}"
echo -e "  🎨 Frontend:         ${GREEN}http://localhost:5173${NC}"
echo -e "  💳 POS:              ${GREEN}http://localhost:5174${NC}"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

# Mantener el script corriendo
wait
