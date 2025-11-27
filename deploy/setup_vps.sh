#!/bin/bash
set -e

# Cores para logs
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}>>> Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}>>> Instalando dependências (Docker, Node.js, Nginx)...${NC}"
sudo apt install -y docker.io docker-compose-v2 nodejs npm nginx git

echo -e "${GREEN}>>> Configurando Backend...${NC}"
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    # Ajustar CORS para aceitar o IP do servidor (ou * para simplificar)
    sed -i 's/CORS_ORIGINS=.*/CORS_ORIGINS=["*"]/' .env
fi

# Parar containers antigos se houver
sudo docker compose down || true
# Subir novos containers
sudo docker compose up -d --build

# Aguardar API subir
echo -e "${GREEN}>>> Aguardando API iniciar...${NC}"
sleep 10

cd ..

echo -e "${GREEN}>>> Configurando Frontend...${NC}"
cd frontend
# Instalar dependências e buildar
npm install
npm run build

# Configurar diretório do Nginx
sudo mkdir -p /var/www/civicgit/dist
sudo cp -r dist/* /var/www/civicgit/dist/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/civicgit
cd ..

echo -e "${GREEN}>>> Configurando Nginx...${NC}"
sudo cp deploy/nginx.conf /etc/nginx/sites-available/civicgit
sudo ln -sf /etc/nginx/sites-available/civicgit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo -e "${GREEN}>>> Instalação Concluída!${NC}"
echo "Acesse seu servidor pelo IP no navegador."
