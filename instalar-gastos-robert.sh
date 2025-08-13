#!/bin/bash

# =============================================================================
# INSTALADOR AUTOMÁTICO - GASTOS ROBERT
# =============================================================================
# Este script instala automáticamente la aplicación "Gastos Robert" en un 
# servidor Ubuntu 22.04 (Oracle Cloud VPS)
# 
# Autor: Robert Fenyiner
# Fecha: $(date)
# Versión: 1.0
# =============================================================================

set -e  # Salir en caso de error

# Colores para la salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

# Configuración del proyecto
APP_NAME="gastos-robert"
APP_DIR="/opt/$APP_NAME"
REPO_URL="https://github.com/robertfenyiner/gastos.git"
LOG_FILE="/var/log/$APP_NAME-install.log"
VPS_IP="167.234.215.122"
DOMAIN=""  # Se configurará durante la instalación

# Banner de bienvenida
mostrar_banner() {
    clear
    echo -e "${PURPLE}"
    echo "═══════════════════════════════════════════════════════════════════════"
    echo "                          GASTOS ROBERT v1.0                         "
    echo "                    Instalador Automático para Ubuntu 22.04           "
    echo "═══════════════════════════════════════════════════════════════════════"
    echo -e "${CYAN}Sistema de Gestión de Gastos Personales${NC}"
    echo -e "${GREEN}VPS Oracle Cloud - IP: $VPS_IP${NC}"
    echo -e "${YELLOW}Autor: Robert Fenyiner${NC}"
    echo "═══════════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

# Funciones de logging
log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

log_info() {
    log "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    log "${YELLOW}[ADVERTENCIA]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

log_paso() {
    log "${BLUE}[PASO]${NC} $1"
}

log_exito() {
    log "${GREEN}[✓]${NC} $1"
}

# Verificar que se ejecuta como root
verificar_permisos() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script debe ejecutarse como root (usar sudo)"
        echo -e "${RED}Uso correcto: sudo ./instalar-gastos-robert.sh${NC}"
        exit 1
    fi
    
    if [ -z "$SUDO_USER" ]; then
        log_error "No se pudo detectar el usuario original. Ejecute con sudo desde una cuenta de usuario."
        exit 1
    fi
    
    log_info "Ejecutándose como root, usuario original: $SUDO_USER"
}

# Recopilar información del usuario
recopilar_configuracion() {
    log_paso "Recopilando información de configuración..."
    
    echo -e "${CYAN}Configuración del servidor:${NC}"
    echo -e "VPS IP: ${GREEN}$VPS_IP${NC}"
    echo -e "Usuario: ${GREEN}$SUDO_USER${NC}"
    echo -e "Sistema: ${GREEN}Ubuntu 22.04${NC}"
    echo ""
    
    # Preguntar por dominio (opcional)
    echo -e "${YELLOW}¿Desea configurar un dominio personalizado?${NC}"
    echo -e "Si no tiene dominio, la aplicación será accesible por IP: http://$VPS_IP"
    read -p "Ingrese su dominio (opcional, presione Enter para omitir): " DOMAIN
    
    if [ -n "$DOMAIN" ]; then
        log_info "Dominio configurado: $DOMAIN"
        echo -e "${GREEN}La aplicación será accesible en: https://$DOMAIN${NC}"
    else
        log_info "Sin dominio configurado, usando IP del servidor"
        echo -e "${GREEN}La aplicación será accesible en: http://$VPS_IP${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}El instalador realizará las siguientes acciones:${NC}"
    echo "1. Actualizar el sistema Ubuntu 22.04"
    echo "2. Instalar Node.js 18.x LTS"
    echo "3. Instalar y configurar Nginx"
    echo "4. Instalar PM2 para gestión de procesos"
    echo "5. Configurar el firewall (UFW)"
    echo "6. Clonar y configurar la aplicación Gastos Robert"
    echo "7. Instalar dependencias del proyecto"
    echo "8. Construir la aplicación React"
    echo "9. Configurar y iniciar los servicios"
    if [ -n "$DOMAIN" ]; then
        echo "10. Configurar SSL con Let's Encrypt"
    fi
    echo "11. Configurar sistema de backup automático"
    echo "12. Configurar monitoreo y logs"
    echo ""
    
    read -p "¿Continuar con la instalación? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
        log_info "Instalación cancelada por el usuario"
        exit 0
    fi
}

# Actualizar el sistema
actualizar_sistema() {
    log_paso "Actualizando el sistema Ubuntu 22.04..."
    
    # Crear directorio de logs
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log_info "Actualizando lista de paquetes..."
    apt update >> "$LOG_FILE" 2>&1
    
    log_info "Actualizando paquetes del sistema..."
    DEBIAN_FRONTEND=noninteractive apt upgrade -y >> "$LOG_FILE" 2>&1
    
    log_info "Instalando herramientas básicas..."
    apt install -y curl wget git unzip software-properties-common build-essential >> "$LOG_FILE" 2>&1
    
    # Configurar zona horaria (Colombia como ejemplo, ajustar según necesidad)
    timedatectl set-timezone America/Bogota
    
    log_exito "Sistema actualizado correctamente"
}

# Instalar Node.js
instalar_nodejs() {
    log_paso "Instalando Node.js 18.x LTS..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js ya está instalado: $NODE_VERSION"
        
        # Verificar si es la versión correcta
        if [[ $NODE_VERSION == v18* ]]; then
            log_info "Versión de Node.js correcta"
        else
            log_warn "Versión de Node.js diferente a 18.x, continuando..."
        fi
    else
        log_info "Descargando e instalando Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >> "$LOG_FILE" 2>&1
        apt-get install -y nodejs >> "$LOG_FILE" 2>&1
    fi
    
    # Actualizar npm a la última versión
    log_info "Actualizando npm..."
    npm install -g npm@latest >> "$LOG_FILE" 2>&1
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    
    log_exito "Node.js instalado: $NODE_VERSION"
    log_exito "NPM instalado: $NPM_VERSION"
}

# Instalar PM2
instalar_pm2() {
    log_paso "Instalando PM2 para gestión de procesos..."
    
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        log_info "PM2 ya está instalado: $PM2_VERSION"
    else
        log_info "Instalando PM2 globalmente..."
        npm install -g pm2 >> "$LOG_FILE" 2>&1
        PM2_VERSION=$(pm2 --version)
        log_exito "PM2 instalado: $PM2_VERSION"
    fi
}

# Instalar Nginx
instalar_nginx() {
    log_paso "Instalando y configurando Nginx..."
    
    if systemctl is-active --quiet nginx; then
        log_info "Nginx ya está funcionando"
    else
        log_info "Instalando Nginx..."
        apt install -y nginx >> "$LOG_FILE" 2>&1
        systemctl start nginx
        systemctl enable nginx
        log_exito "Nginx instalado y configurado"
    fi
    
    # Verificar estado
    if systemctl is-active --quiet nginx; then
        log_exito "Nginx está funcionando correctamente"
    else
        log_error "Error al iniciar Nginx"
        exit 1
    fi
}

# Instalar herramientas SSL (si se configuró dominio)
instalar_herramientas_ssl() {
    if [ -n "$DOMAIN" ]; then
        log_paso "Instalando herramientas SSL (Certbot)..."
        apt install -y certbot python3-certbot-nginx >> "$LOG_FILE" 2>&1
        log_exito "Certbot instalado para SSL"
    fi
}

# Configurar firewall
configurar_firewall() {
    log_paso "Configurando firewall (UFW)..."
    
    # Verificar si UFW ya está habilitado
    if ufw status | grep -q "Status: active"; then
        log_info "UFW ya está activo"
    else
        log_info "Configurando reglas de firewall..."
        ufw --force reset >> "$LOG_FILE" 2>&1
        ufw default deny incoming >> "$LOG_FILE" 2>&1
        ufw default allow outgoing >> "$LOG_FILE" 2>&1
        ufw allow ssh >> "$LOG_FILE" 2>&1
        ufw allow 'Nginx Full' >> "$LOG_FILE" 2>&1
        ufw --force enable >> "$LOG_FILE" 2>&1
        log_exito "Firewall configurado correctamente"
    fi
    
    # Mostrar estado del firewall
    log_info "Estado del firewall:"
    ufw status numbered | tee -a "$LOG_FILE"
}

# Clonar y configurar la aplicación
configurar_aplicacion() {
    log_paso "Clonando y configurando Gastos Robert..."
    
    # Crear directorio de aplicación
    mkdir -p "$APP_DIR"
    
    # Clonar repositorio
    if [ -d "$APP_DIR/.git" ]; then
        log_info "Repositorio ya existe, actualizando..."
        cd "$APP_DIR"
        sudo -u $SUDO_USER git pull origin main >> "$LOG_FILE" 2>&1
    else
        log_info "Clonando repositorio desde GitHub..."
        sudo -u $SUDO_USER git clone "$REPO_URL" "$APP_DIR" >> "$LOG_FILE" 2>&1
    fi
    
    # Configurar permisos
    chown -R $SUDO_USER:$SUDO_USER "$APP_DIR"
    
    cd "$APP_DIR"
    
    log_exito "Aplicación clonada correctamente"
}

# Instalar dependencias
instalar_dependencias() {
    log_paso "Instalando dependencias del proyecto..."
    
    cd "$APP_DIR"
    
    # Instalar dependencias del servidor
    log_info "Instalando dependencias del servidor..."
    cd server
    sudo -u $SUDO_USER npm install --production >> "$LOG_FILE" 2>&1
    
    # Instalar dependencias del cliente
    log_info "Instalando dependencias del cliente..."
    cd ../client
    sudo -u $SUDO_USER npm install >> "$LOG_FILE" 2>&1
    
    log_exito "Dependencias instaladas correctamente"
}

# Construir la aplicación React
construir_aplicacion() {
    log_paso "Construyendo aplicación React para producción..."
    
    cd "$APP_DIR/client"
    
    log_info "Ejecutando build de React..."
    sudo -u $SUDO_USER npm run build >> "$LOG_FILE" 2>&1
    
    # Verificar que el build se completó
    if [ ! -d "build" ] || [ -z "$(ls -A build)" ]; then
        log_error "Error en el build - directorio build vacío"
        exit 1
    fi
    
    log_exito "Aplicación React construida exitosamente"
}

# Configurar variables de entorno
configurar_environment() {
    log_paso "Configurando variables de entorno..."
    
    ENV_FILE="$APP_DIR/server/.env"
    
    if [ ! -f "$ENV_FILE" ]; then
        # Copiar archivo de ejemplo
        if [ -f "$APP_DIR/server/.env.example" ]; then
            cp "$APP_DIR/server/.env.example" "$ENV_FILE"
        else
            log_error "Archivo .env.example no encontrado"
            exit 1
        fi
        
        # Generar JWT secret seguro
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        
        # Actualizar archivo de entorno
        sed -i "s/change-this-to-a-very-long-secure-secret-key-at-least-64-characters-long/$JWT_SECRET/" "$ENV_FILE"
        
        # Configurar URL de la aplicación
        if [ -n "$DOMAIN" ]; then
            sed -i "s|APP_URL=http://localhost:3000|APP_URL=https://$DOMAIN|" "$ENV_FILE"
            sed -i "s|ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com|ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN|" "$ENV_FILE"
        else
            sed -i "s|APP_URL=http://localhost:3000|APP_URL=http://$VPS_IP|" "$ENV_FILE"
            sed -i "s|ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com|ALLOWED_ORIGINS=http://$VPS_IP|" "$ENV_FILE"
        fi
        
        # Configurar entorno de producción
        sed -i "s/NODE_ENV=development/NODE_ENV=production/" "$ENV_FILE"
        
        # Configurar permisos de archivo
        chmod 600 "$ENV_FILE"
        chown $SUDO_USER:$SUDO_USER "$ENV_FILE"
        
        log_exito "Archivo .env configurado"
    else
        log_info "Archivo .env ya existe"
    fi
}

# Configurar sistema de logging
configurar_logging() {
    log_paso "Configurando sistema de logging..."
    
    LOG_DIR="/var/log/$APP_NAME"
    mkdir -p "$LOG_DIR"
    chown $SUDO_USER:$SUDO_USER "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    
    # Configurar rotación de logs
    cat > "/etc/logrotate.d/$APP_NAME" << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $SUDO_USER $SUDO_USER
    postrotate
        pm2 reload gastos-robert-api 2>/dev/null || true
    endscript
}
EOF

    log_exito "Sistema de logging configurado"
}

# Configurar PM2
configurar_pm2() {
    log_paso "Configurando PM2 y iniciando aplicación..."
    
    cd "$APP_DIR"
    
    # Iniciar aplicación con PM2
    sudo -u $SUDO_USER pm2 start ecosystem.config.js --env production >> "$LOG_FILE" 2>&1
    
    # Guardar configuración PM2
    sudo -u $SUDO_USER pm2 save >> "$LOG_FILE" 2>&1
    
    # Configurar inicio automático
    PM2_STARTUP_CMD=$(sudo -u $SUDO_USER pm2 startup ubuntu | tail -n 1)
    if [[ $PM2_STARTUP_CMD == sudo* ]]; then
        eval $PM2_STARTUP_CMD >> "$LOG_FILE" 2>&1
    fi
    
    # Verificar que la aplicación esté funcionando
    sleep 5
    if sudo -u $SUDO_USER pm2 list | grep -q "gastos-robert-api.*online"; then
        log_exito "Aplicación PM2 iniciada correctamente"
    else
        log_error "Error al iniciar la aplicación con PM2"
        sudo -u $SUDO_USER pm2 logs gastos-robert-api --lines 20
        exit 1
    fi
}

# Configurar Nginx
configurar_nginx() {
    log_paso "Configurando Nginx..."
    
    NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"
    
    # Crear configuración de Nginx
    cat > "$NGINX_CONFIG" << EOF
# Configuración Nginx para Gastos Robert
server {
    listen 80;
    server_name ${DOMAIN:-$VPS_IP};
    
    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Compresión Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Servir archivos estáticos de React
    location / {
        root $APP_DIR/client/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:5000;
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

    # Bloquear archivos sensibles
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~* \\.(env|log|conf)\$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Logs de acceso
    access_log /var/log/nginx/gastos-robert-access.log;
    error_log /var/log/nginx/gastos-robert-error.log;
}
EOF

    # Habilitar sitio
    ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$APP_NAME"
    
    # Deshabilitar sitio por defecto
    rm -f "/etc/nginx/sites-enabled/default"
    
    # Probar configuración
    nginx -t >> "$LOG_FILE" 2>&1
    
    # Recargar Nginx
    systemctl reload nginx
    
    log_exito "Nginx configurado correctamente"
}

# Configurar SSL (si se especificó dominio)
configurar_ssl() {
    if [ -n "$DOMAIN" ]; then
        log_paso "Configurando SSL con Let's Encrypt..."
        
        log_info "Obteniendo certificado SSL para $DOMAIN..."
        
        # Obtener certificado SSL
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "robert@$DOMAIN" --redirect >> "$LOG_FILE" 2>&1
        
        # Configurar renovación automática
        if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
            (crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/certbot renew --quiet") | crontab -
        fi
        
        log_exito "SSL configurado correctamente"
    else
        log_info "Sin dominio configurado, omitiendo SSL"
    fi
}

# Configurar sistema de backup
configurar_backup() {
    log_paso "Configurando sistema de backup automático..."
    
    BACKUP_SCRIPT_SRC="$APP_DIR/scripts/backup-expense-tracker.sh"
    BACKUP_SCRIPT_DEST="/usr/local/bin/backup-gastos-robert.sh"
    
    # Actualizar script de backup con nuevos nombres
    if [ -f "$BACKUP_SCRIPT_SRC" ]; then
        # Copiar y adaptar script
        sed "s/expense-tracker/gastos-robert/g" "$BACKUP_SCRIPT_SRC" > "$BACKUP_SCRIPT_DEST"
        sed -i "s|/opt/expense-tracker|$APP_DIR|g" "$BACKUP_SCRIPT_DEST"
        sed -i "s|/var/log/expense-tracker|/var/log/gastos-robert|g" "$BACKUP_SCRIPT_DEST"
        
        chmod +x "$BACKUP_SCRIPT_DEST"
        
        # Crear directorio de backup
        mkdir -p "/backup/$APP_NAME"
        chown $SUDO_USER:$SUDO_USER "/backup/$APP_NAME"
        
        # Configurar tarea cron para backup diario
        if ! crontab -u $SUDO_USER -l 2>/dev/null | grep -q "backup-gastos-robert"; then
            (crontab -u $SUDO_USER -l 2>/dev/null; echo "0 2 * * * $BACKUP_SCRIPT_DEST >> /var/log/$APP_NAME/backup.log 2>&1") | crontab -u $SUDO_USER -
        fi
        
        log_exito "Sistema de backup configurado"
    else
        log_warn "Script de backup no encontrado, creando backup básico..."
        # Crear backup básico
        cat > "$BACKUP_SCRIPT_DEST" << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/gastos-robert"
mkdir -p "$BACKUP_DIR"
cp /opt/gastos-robert/server/gastos_robert.db "$BACKUP_DIR/gastos_robert_$DATE.db" 2>/dev/null || echo "Base de datos no encontrada"
find "$BACKUP_DIR" -name "*.db" -mtime +7 -delete
echo "Backup completado: $DATE"
EOF
        chmod +x "$BACKUP_SCRIPT_DEST"
    fi
}

# Verificación final del sistema
verificar_instalacion() {
    log_paso "Verificando instalación..."
    
    echo -e "\n${CYAN}=== VERIFICACIÓN DE SERVICIOS ===${NC}"
    
    # Verificar Nginx
    if systemctl is-active --quiet nginx; then
        log_exito "Nginx está funcionando"
    else
        log_error "Nginx no está funcionando"
    fi
    
    # Verificar PM2
    if sudo -u $SUDO_USER pm2 status | grep -q "gastos-robert-api.*online"; then
        log_exito "Aplicación está funcionando en PM2"
    else
        log_error "Aplicación no está funcionando en PM2"
    fi
    
    # Verificar API
    sleep 2
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        log_exito "API responde correctamente"
    else
        log_warn "API no responde (puede necesitar unos segundos más)"
    fi
    
    # Verificar espacio en disco
    ESPACIO_DISPONIBLE=$(df /opt | awk 'NR==2 {print $4}')
    if [ "$ESPACIO_DISPONIBLE" -gt 1048576 ]; then  # Más de 1GB
        log_exito "Espacio en disco suficiente"
    else
        log_warn "Espacio en disco bajo"
    fi
    
    # Verificar firewall
    if ufw status | grep -q "Status: active"; then
        log_exito "Firewall activo"
    else
        log_warn "Firewall no está activo"
    fi
}

# Mostrar información final
mostrar_informacion_final() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════${NC}"
    
    echo -e "\n${CYAN}📍 INFORMACIÓN DE LA APLICACIÓN:${NC}"
    echo -e "   📁 Directorio de instalación: ${GREEN}$APP_DIR${NC}"
    echo -e "   ⚙️  Archivo de configuración: ${GREEN}$APP_DIR/server/.env${NC}"
    echo -e "   📊 Directorio de logs: ${GREEN}/var/log/$APP_NAME${NC}"
    echo -e "   💾 Directorio de backups: ${GREEN}/backup/$APP_NAME${NC}"
    
    echo -e "\n${CYAN}🌐 ACCESO A LA APLICACIÓN:${NC}"
    if [ -n "$DOMAIN" ]; then
        echo -e "   🔗 URL principal: ${GREEN}https://$DOMAIN${NC}"
        echo -e "   🔗 URL alternativa: ${GREEN}http://$VPS_IP${NC}"
    else
        echo -e "   🔗 URL de acceso: ${GREEN}http://$VPS_IP${NC}"
    fi
    
    echo -e "\n${CYAN}🔧 COMANDOS ÚTILES:${NC}"
    echo -e "   Ver logs de aplicación:    ${YELLOW}sudo pm2 logs gastos-robert-api${NC}"
    echo -e "   Reiniciar aplicación:      ${YELLOW}sudo pm2 restart gastos-robert-api${NC}"
    echo -e "   Estado de aplicación:      ${YELLOW}sudo pm2 status${NC}"
    echo -e "   Ver logs de Nginx:         ${YELLOW}sudo tail -f /var/log/nginx/gastos-robert-access.log${NC}"
    echo -e "   Ejecutar backup manual:    ${YELLOW}sudo /usr/local/bin/backup-gastos-robert.sh${NC}"
    
    echo -e "\n${YELLOW}⚠️  CONFIGURACIÓN PENDIENTE:${NC}"
    echo -e "   ${RED}IMPORTANTE:${NC} Debe configurar las siguientes variables en:"
    echo -e "   ${GREEN}$APP_DIR/server/.env${NC}"
    echo ""
    echo -e "   📧 ${YELLOW}Configuración de Email:${NC}"
    echo -e "      EMAIL_HOST=smtp.gmail.com"
    echo -e "      EMAIL_PORT=587"
    echo -e "      EMAIL_USER=tu-email@gmail.com"
    echo -e "      EMAIL_PASS=tu-contraseña-de-aplicación"
    echo -e "      EMAIL_FROM=tu-email@gmail.com"
    echo ""
    echo -e "   💱 ${YELLOW}API de Tasas de Cambio (opcional):${NC}"
    echo -e "      EXCHANGE_API_KEY=tu-clave-api"
    echo -e "      (Obtener en: https://exchangerate-api.com)"
    echo ""
    
    echo -e "${CYAN}📝 PASOS SIGUIENTES:${NC}"
    echo -e "   1. ${GREEN}Editar configuración:${NC} sudo nano $APP_DIR/server/.env"
    echo -e "   2. ${GREEN}Reiniciar aplicación:${NC} sudo pm2 restart gastos-robert-api"
    echo -e "   3. ${GREEN}Acceder a la aplicación${NC} en tu navegador"
    echo -e "   4. ${GREEN}Crear tu primera cuenta${NC} de usuario"
    
    if [ -z "$DOMAIN" ]; then
        echo -e "\n${YELLOW}💡 SUGERENCIA:${NC}"
        echo -e "   Para mejorar la seguridad, considere configurar un dominio y SSL"
    fi
    
    echo -e "\n${CYAN}📞 SOPORTE:${NC}"
    echo -e "   📧 Email: robert@gastosrobert.com"
    echo -e "   🔗 GitHub: https://github.com/robertfenyiner/gastos"
    
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Instalación completada en: $(date)${NC}"
    echo -e "${GREEN}Log de instalación: $LOG_FILE${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════${NC}"
}

# Función principal de instalación
main() {
    # Mostrar banner
    mostrar_banner
    
    # Verificar permisos
    verificar_permisos
    
    # Recopilar configuración
    recopilar_configuracion
    
    echo -e "\n${GREEN}Iniciando instalación de Gastos Robert...${NC}\n"
    
    # Ejecutar pasos de instalación
    actualizar_sistema
    instalar_nodejs
    instalar_pm2
    instalar_nginx
    instalar_herramientas_ssl
    configurar_firewall
    configurar_aplicacion
    instalar_dependencias
    construir_aplicacion
    configurar_environment
    configurar_logging
    configurar_pm2
    configurar_nginx
    configurar_ssl
    configurar_backup
    verificar_instalacion
    mostrar_informacion_final
    
    echo -e "\n${GREEN}¡Gastos Robert ha sido instalado exitosamente!${NC}\n"
}

# Manejo de errores
manejar_error() {
    log_error "Instalación fallida en la línea $1"
    echo -e "\n${RED}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}                        ERROR EN LA INSTALACIÓN${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}La instalación ha fallado. Consulte el log para más detalles:${NC}"
    echo -e "${GREEN}$LOG_FILE${NC}"
    echo ""
    echo -e "${YELLOW}Para obtener soporte:${NC}"
    echo -e "📧 Email: robert@gastosrobert.com"
    echo -e "🔗 GitHub: https://github.com/robertfenyiner/gastos/issues"
    exit 1
}

# Función de ayuda
mostrar_ayuda() {
    echo -e "${CYAN}Instalador Automático - Gastos Robert${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo -e "  sudo ./instalar-gastos-robert.sh"
    echo ""
    echo -e "${YELLOW}Descripción:${NC}"
    echo -e "  Este script instala automáticamente la aplicación Gastos Robert"
    echo -e "  en un servidor Ubuntu 22.04 (Oracle Cloud VPS)."
    echo ""
    echo -e "${YELLOW}Requisitos:${NC}"
    echo -e "  - Ubuntu 22.04"
    echo -e "  - Permisos de sudo/root"
    echo -e "  - Conexión a internet"
    echo -e "  - Mínimo 2GB de RAM y 10GB de espacio libre"
    echo ""
    echo -e "${YELLOW}Opciones:${NC}"
    echo -e "  -h, --help    Mostrar esta ayuda"
    echo ""
}

# Configurar manejo de errores
trap 'manejar_error $LINENO' ERR

# Procesar argumentos de línea de comandos
case "${1:-}" in
    -h|--help)
        mostrar_ayuda
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac