# Expense Tracker

Una aplicación web completa para gestión personal de gastos con soporte para múltiples monedas, recordatorios por email y generación de reportes.

## 🚀 Características

- **Gestión de Gastos**: Crear, editar, eliminar y categorizar gastos
- **Múltiples Monedas**: Soporte para diferentes divisas con tasas de cambio actualizadas automáticamente
- **Gastos Recurrentes**: Configurar pagos que se repiten (mensual, semanal, etc.)
- **Recordatorios por Email**: Notificaciones automáticas para gastos próximos a vencer
- **Reportes PDF**: Generar extractos detallados de gastos en formato PDF
- **Responsive Design**: Optimizado para dispositivos móviles
- **Autenticación Segura**: Sistema de login con JWT y encriptación bcrypt
- **Dashboard Interactivo**: Visualización de estadísticas y tendencias de gastos

## 📋 Prerrequisitos

- Node.js v16 o superior
- npm o yarn
- Servidor Ubuntu 24.04 (para producción)

## 🛠️ Instalación Local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Gastos\ Robert
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la carpeta `server`:

```bash
cd ../server
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:

```env
PORT=5000
JWT_SECRET=tu_clave_jwt_muy_segura_y_larga_aqui
JWT_EXPIRES_IN=7d

# Configuración de email para recordatorios
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
EMAIL_FROM=tu_email@gmail.com

# API de tasas de cambio (opcional)
EXCHANGE_API_KEY=tu_clave_de_exchangerate_api

# URL de la aplicación (para emails)
APP_URL=http://localhost:3000
```

### 4. Inicializar base de datos

La base de datos SQLite se crea automáticamente al iniciar el servidor por primera vez.

### 5. Ejecutar en desarrollo

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Servidor backend en `http://localhost:5000`
- Cliente React en `http://localhost:3000`

## 🌐 Despliegue en Producción (Ubuntu 24.04)

### 1. Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y

# Instalar certificados SSL (opcional)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Clonar y configurar la aplicación

```bash
# Clonar en el servidor
cd /opt
sudo git clone <url-del-repositorio> expense-tracker
cd expense-tracker

# Cambiar permisos
sudo chown -R $USER:$USER /opt/expense-tracker

# Instalar dependencias
npm run install-deps

# Construir aplicación React
cd client
npm run build
cd ..
```

### 3. Configurar variables de entorno para producción

```bash
cd server
sudo nano .env
```

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=clave_super_segura_para_produccion
JWT_EXPIRES_IN=7d

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=tu_email@gmail.com

# Exchange rate API
EXCHANGE_API_KEY=tu_clave_api

# Production URL
APP_URL=https://tu-dominio.com
```

### 4. Configurar PM2

```bash
# Crear archivo ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'expense-tracker',
    script: 'server/index.js',
    cwd: '/opt/expense-tracker',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/expense-tracker/error.log',
    out_file: '/var/log/expense-tracker/output.log',
    log_file: '/var/log/expense-tracker/combined.log',
    time: true
  }]
};
EOF

# Crear directorio de logs
sudo mkdir -p /var/log/expense-tracker
sudo chown $USER:$USER /var/log/expense-tracker

# Iniciar aplicación con PM2
pm2 start ecosystem.config.js

# Configurar PM2 para iniciarse con el sistema
pm2 startup
pm2 save
```

### 5. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/expense-tracker
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Servir archivos estáticos de React
    location / {
        root /opt/expense-tracker/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Seguridad adicional
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/expense-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Configurar SSL (opcional pero recomendado)

```bash
# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### 7. Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 📧 Configuración de Email

### Gmail con App Password

1. Habilitar autenticación de 2 factores en tu cuenta de Gmail
2. Ir a Google Account Settings > Security > App passwords
3. Generar una contraseña específica para la aplicación
4. Usar esa contraseña en `EMAIL_PASS`

### Otros proveedores

La aplicación funciona con cualquier servidor SMTP. Ajusta las configuraciones según tu proveedor:

- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Configurar según tu proveedor

## 💱 Configuración de Tasas de Cambio

### Opción 1: ExchangeRate-API (Recomendado)

1. Registrarse en [exchangerate-api.com](https://exchangerate-api.com)
2. Obtener clave API gratuita
3. Configurar `EXCHANGE_API_KEY` en `.env`

### Opción 2: Fixer.io (Fallback)

1. Registrarse en [fixer.io](https://fixer.io)
2. Configurar `FIXER_API_KEY` en `.env`

## 🔧 Mantenimiento

### Logs

```bash
# Ver logs de la aplicación
pm2 logs expense-tracker

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Actualizaciones

```bash
# Actualizar código
cd /opt/expense-tracker
git pull origin main

# Reinstalar dependencias si es necesario
npm run install-deps

# Reconstruir frontend
cd client
npm run build
cd ..

# Reiniciar aplicación
pm2 restart expense-tracker
```

### Backup de Base de Datos

```bash
# Crear backup
cp /opt/expense-tracker/server/expense_tracker.db /backup/expense_tracker_$(date +%Y%m%d_%H%M%S).db

# Automatizar backup diario
echo "0 2 * * * cp /opt/expense-tracker/server/expense_tracker.db /backup/expense_tracker_\$(date +\\%Y\\%m\\%d_\\%H\\%M\\%S).db" | crontab -
```

## 🔒 Seguridad

### Recomendaciones importantes:

1. **Cambiar JWT_SECRET**: Usar una clave larga y compleja
2. **HTTPS**: Siempre usar SSL en producción
3. **Firewall**: Configurar UFW correctamente
4. **Updates**: Mantener el sistema actualizado
5. **Monitoring**: Configurar alertas de monitoreo

### Límites de Rate

La aplicación incluye límites de rate automáticos:
- API general: 100 requests/15min por IP
- Autenticación: 5 attempts/15min por IP

## 📱 Uso de la Aplicación

### Registro e Inicio de Sesión

1. Acceder a la aplicación
2. Crear una cuenta nueva o iniciar sesión
3. El sistema creará categorías por defecto

### Gestión de Gastos

1. **Agregar Gasto**: Botón "+" en dashboard o página de gastos
2. **Gastos Recurrentes**: Marcar checkbox y seleccionar frecuencia
3. **Múltiples Monedas**: Seleccionar divisa en el formulario

### Reportes

1. Ir a la sección de reportes
2. Seleccionar período y filtros
3. Generar y descargar PDF

### Recordatorios

Los recordatorios se envían automáticamente:
- Gastos recurrentes próximos a vencer
- Resumen semanal (domingos)

## 🐛 Solución de Problemas

### Error de conexión a base de datos

```bash
# Verificar permisos
ls -la /opt/expense-tracker/server/
sudo chown $USER:$USER /opt/expense-tracker/server/expense_tracker.db
```

### Emails no se envían

```bash
# Verificar configuración
cd /opt/expense-tracker/server
node -e "console.log(require('dotenv').config()); console.log(process.env.EMAIL_USER)"
```

### Tasas de cambio no se actualizan

```bash
# Verificar logs
pm2 logs expense-tracker | grep -i "exchange"
```

## 📞 Soporte

Para reportar problemas o solicitar nuevas características, crear un issue en el repositorio del proyecto.

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.