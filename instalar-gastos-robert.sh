#!/bin/bash

set -e

APP_NAME="gastos-robert"
REPO_URL="https://github.com/robertfenyiner/gastos.git"
APP_DIR="/home/ubuntu/$APP_NAME"
DB_PATH="$APP_DIR/server/gastos_robert.db"
PORT=5000

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}==== Instalador Automático Gastos Robert ====${NC}"

check_node() {
    if command -v node >/dev/null 2>&1; then
        echo -e "${YELLOW}Node.js ya está instalado: $(node --version)${NC}"
    else
        echo -e "${GREEN}Instalando Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
}

check_npm() {
    if command -v npm >/dev/null 2>&1; then
        echo -e "${YELLOW}npm ya está instalado: $(npm --version)${NC}"
        echo -e "${GREEN}Actualizando npm...${NC}"
        sudo npm install -g npm@latest
    else
        echo -e "${RED}npm no está instalado, instalando Node.js primero...${NC}"
        check_node
        sudo npm install -g npm@latest
    fi
}

check_nginx() {
    if systemctl is-active --quiet nginx; then
        echo -e "${YELLOW}Nginx ya está corriendo.${NC}"
    else
        echo -e "${GREEN}Instalando y arrancando Nginx...${NC}"
        sudo apt install -y nginx
        sudo systemctl enable nginx
        sudo systemctl start nginx
    fi
}

check_pm2() {
    if command -v pm2 >/dev/null 2>&1; then
        echo -e "${YELLOW}PM2 ya está instalado: $(pm2 --version)${NC}"
    else
        echo -e "${GREEN}Instalando PM2...${NC}"
        sudo npm install -g pm2
    fi
    # Detener y eliminar procesos PM2 previos
    if pm2 list | grep -q "$APP_NAME"; then
        echo -e "${YELLOW}Deteniendo y eliminando procesos PM2 previos de $APP_NAME...${NC}"
        pm2 stop "$APP_NAME" || true
        pm2 delete "$APP_NAME" || true
    fi
    # Detener todos los procesos PM2 si hay alguno corriendo
    if [ "$(pm2 list | grep -c 'online')" -gt 0 ]; then
        echo -e "${YELLOW}Deteniendo todos los procesos PM2 previos...${NC}"
        pm2 stop all || true
        pm2 delete all || true
    fi
}

# 1. Actualizar sistema y herramientas básicas
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common build-essential

# 2. Verificar/instalar Node.js y npm
check_node
check_npm

# 3. Verificar/instalar Nginx
check_nginx

# 4. Verificar/instalar PM2 y limpiar procesos previos
check_pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 5. Clonar el repositorio
if [ ! -d "$APP_DIR" ]; then
    sudo -u ubuntu git clone "$REPO_URL" "$APP_DIR"
else
    cd "$APP_DIR"
    sudo -u ubuntu git pull origin main
fi
sudo chown -R ubuntu:ubuntu "$APP_DIR"

# 6. Configurar variables de entorno
cd "$APP_DIR/server"
if [ ! -f ".env" ]; then
    cp .env.example .env
fi
sed -i "s|^DB_PATH=.*|DB_PATH=./gastos_robert.db|" .env
if ! grep -q "^JWT_SECRET=" .env; then
    echo "JWT_SECRET=$(openssl rand -hex 48)" >> .env
fi
chmod 600 .env
sudo chown ubuntu:ubuntu .env

# 7. Crear base de datos si no existe
if [ ! -f "$DB_PATH" ]; then
    sudo -u ubuntu touch "$DB_PATH"
    sudo chown ubuntu:ubuntu "$DB_PATH"
    chmod 600 "$DB_PATH"
    echo -e "${GREEN}Base de datos creada en $DB_PATH${NC}"
fi

# 8. Instalar dependencias y construir frontend
cd "$APP_DIR/server"
sudo -u ubuntu npm install --production
cd "$APP_DIR/client"
sudo -u ubuntu npm install
sudo -u ubuntu npm run build

# 9. Configurar Nginx
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"
sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    root $APP_DIR/client/build;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$APP_NAME"
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 10. Iniciar la aplicación con PM2
cd "$APP_DIR"
sudo -u ubuntu pm2 start ecosystem.config.js --env production
sudo -u ubuntu pm2 save

echo -e "${GREEN}==== Instalación completada ====${NC}"
echo -e "${YELLOW}Accede a la app en: http://$(curl -s http://checkip.amazonaws.com)/${NC}"
echo -e "${YELLOW}API health: http://$(curl -s http://checkip.amazonaws.com):$PORT/api/health${NC}"