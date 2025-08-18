# 💰 Gastos Robert

**Aplicación web completa para gestión personal de gastos con soporte para múltiples monedas, recordatorios por email y generación de reportes.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📋 Tabla de Contenidos

- [🚀 Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📋 Prerrequisitos](#-prerrequisitos)
- [⚡ Instalación Rápida (VPS)](#-instalación-rápida-vps)
- [🔧 Instalación Manual](#-instalación-manual)
- [⚙️ Configuración](#️-configuración)
- [🐳 Despliegue en Producción](#-despliegue-en-producción)
- [📊 Uso de la Aplicación](#-uso-de-la-aplicación)
- [🔐 Seguridad](#-seguridad)
- [🛠️ Desarrollo](#️-desarrollo)
- [📈 Monitoreo y Mantenimiento](#-monitoreo-y-mantenimiento)
- [🐛 Solución de Problemas](#-solución-de-problemas)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

---

## 🚀 Características

### ✨ Funcionalidades Principales
- **👤 Gestión de Usuarios**: Sistema completo de registro y autenticación
- **💸 Gestión de Gastos**: Crear, editar, eliminar y categorizar gastos
- **🏷️ Categorías Personalizadas**: Organiza gastos con categorías y colores customizables
- **💱 Múltiples Monedas**: Soporte para diferentes divisas con tasas actualizadas automáticamente
- **🔄 Gastos Recurrentes**: Configura pagos que se repiten (mensual, semanal, etc.)
- **📧 Recordatorios por Email**: Notificaciones automáticas para gastos próximos a vencer
- **📄 Reportes PDF**: Genera extractos detallados de gastos en formato PDF
- **📱 Responsive Design**: Optimizado para dispositivos móviles
- **🔒 Seguridad Avanzada**: Autenticación JWT, encriptación bcrypt, y protección XSS

### 🛡️ Características de Seguridad
- **JWT Authentication**: Tokens seguros con expiración configurable
- **Password Hashing**: Encriptación bcrypt con 12 salt rounds
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS Protection**: Configuración restrictiva de orígenes
- **XSS Prevention**: Validación y sanitización de inputs
- **SQL Injection Protection**: Consultas parametrizadas
- **Security Headers**: Headers de seguridad con Helmet.js

---

## 🛠️ Tecnologías

### Backend
- **Node.js** 18.x - Runtime de JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Helmet.js** - Security headers
- **Express Rate Limit** - Rate limiting
- **Nodemailer** - Envío de emails
- **PDFKit** - Generación de PDFs

### Frontend
- **React** 18 - Librería UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS
- **React Hook Form** - Manejo de formularios
- **React Router** - Navegación
- **Axios** - Cliente HTTP

### DevOps & Deployment
- **PM2** - Gestión de procesos
- **Nginx** - Reverse proxy
- **Let's Encrypt** - Certificados SSL
- **UFW** - Firewall
- **Ubuntu 22.04** - Sistema operativo

---

## 📋 Prerrequisitos

### Para Instalación Automática (Recomendado)
- **Ubuntu 22.04** (VPS Oracle Cloud u otro proveedor)
- **Acceso root/sudo** al servidor
- **Conexión a internet** estable
- **Mínimo 2GB RAM** y 10GB espacio libre
- **Git** instalado

### Para Desarrollo Local
- **Node.js** v18.x o superior
- **npm** v9.x o superior
- **Git**

---

## ⚡ Instalación Rápida (VPS)

### 🚀 Instalación con Un Solo Comando

Para instalar **Gastos Robert** en tu VPS Ubuntu 22.04 (Oracle Cloud):

```bash
git clone https://github.com/robertfenyiner/gastos.git
cd gastos



# 2. Crear usuario recomendado (si no existe)
sudo adduser nina
sudo usermod -aG sudo nina
su - nina

# 3. Hacer ejecutable el instalador y configurar .env
chmod +x instalar-gastos-robert.sh
cp ~/gastos/server/.env.example ~/gastos/server/.env

# 4. Ejecutar instalador automático como usuario nina
bash instalar-gastos-robert.sh
```

### 🎯 ¿Qué hace el instalador automático?

El script `instalar-gastos-robert.sh` realiza automáticamente todos estos pasos:

**Notas importantes del instalador:**
- Valida que se ejecute como usuario 'nina' y muestra instrucciones para crearlo si no existe.
- Elimina node_modules y package-lock.json antes de instalar dependencias del frontend.
- Instala la versión correcta de react-scripts (5.0.1) antes de construir el frontend.
- Configura Nginx con el bloque /api/ y proxy_pass http://localhost:5000/api/;
- Recomienda no ejecutar como root y explica cómo evitar errores de permisos.

#### 📦 **Paso 1: Preparación del Sistema**
- ✅ Actualiza Ubuntu 22.04 a la última versión
- ✅ Instala herramientas básicas (curl, wget, git, build-essential)
- ✅ Configura zona horaria
- ✅ Verifica permisos y usuario

#### 🟢 **Paso 2: Instalación de Node.js**
- ✅ Descarga e instala Node.js 18.x LTS
- ✅ Actualiza npm a la última versión
- ✅ Verifica instalación correcta

#### ⚡ **Paso 3: Instalación de PM2**
- ✅ Instala PM2 globalmente para gestión de procesos
- ✅ Configura PM2 para inicio automático con el sistema

#### 🌐 **Paso 4: Configuración de Nginx**
- ✅ Instala y configura Nginx como reverse proxy
- ✅ Configura headers de seguridad
- ✅ Habilita compresión Gzip
- ✅ Configura rate limiting

#### 🔥 **Paso 5: Configuración de Firewall**
- ✅ Configura UFW (Uncomplicated Firewall)
- ✅ Permite solo tráfico SSH, HTTP y HTTPS
- ✅ Bloquea todo el tráfico no autorizado

#### 📁 **Paso 6: Clonación y Configuración de la App**
- ✅ Clona el repositorio desde GitHub
- ✅ Configura permisos correctos
- ✅ Instala dependencias del servidor y cliente
- ✅ Construye la aplicación React para producción

#### ⚙️ **Paso 7: Configuración de Variables de Entorno**
- ✅ Genera JWT secret criptográficamente seguro
- ✅ Configura archivo .env con valores por defecto seguros
- ✅ Establece permisos restrictivos (600) para archivos sensibles

#### 🚀 **Paso 8: Inicio de Servicios**
- ✅ Inicia la aplicación con PM2
- ✅ Configura reinicio automático
- ✅ Configura Nginx con configuración optimizada
- ✅ Verifica que todos los servicios funcionen correctamente

#### 🔒 **Paso 9: Configuración SSL (Opcional)**
- ✅ Instala Certbot para Let's Encrypt
- ✅ Configura certificados SSL automáticamente (si se proporciona dominio)
- ✅ Configura renovación automática

#### 💾 **Paso 10: Sistema de Backup**
- ✅ Instala script de backup automático
- ✅ Configura backup diario a las 2:00 AM
- ✅ Configura limpieza automática de backups antiguos

#### 📊 **Paso 11: Monitoreo y Logs**
- ✅ Configura rotación automática de logs
- ✅ Configura directorio de logs con permisos correctos
- ✅ Establece monitoreo básico de la aplicación

### 📋 Información Post-Instalación

Después de la instalación automática, tendrás:

- **🌐 Aplicación web** funcionando en tu IP del servidor
- **🔐 Seguridad** configurada con firewall y headers de seguridad  
- **💾 Backup automático** configurado
- **📊 Logs** organizados y con rotación automática
- **🚀 PM2** gestionando la aplicación
- **🌐 Nginx** como reverse proxy optimizado

### ✅ Configuración Preconfigurada

La aplicación viene **preconfigurada** para la IP **167.234.215.122** con:

**✅ Email configurado** con registro.lat.team@gmail.com
**✅ JWT Secret configurado** 
**✅ CORS configurado** para la IP del servidor
**✅ Base de datos configurada** (gastos_robert.db)
**✅ Entorno de producción** habilitado
**✅ Instalación recomendada en /home/nina/gastos-robert**

**Configuración opcional adicional:**

```bash
# Solo si necesitas cambiar la configuración de email
sudo nano ~/gastos/server/.env

# Para habilitar API de tasas de cambio:
EXCHANGE_API_KEY=tu-clave-api-de-exchangerate-api

# Reiniciar aplicación después de cambios
sudo pm2 restart gastos-robert-api
```

---

## 🔧 Instalación Manual

Si prefieres instalar paso a paso o necesitas personalizar la instalación:

### 1. Preparar el Sistema

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y curl wget git unzip software-properties-common build-essential

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 y Nginx
sudo npm install -g pm2
sudo apt install -y nginx
```

### 2. Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/robertfenyiner/gastos.git
cd gastos

# Configurar permisos
sudo chown -R nina:nina ~/gastos
```

### 3. Instalar Dependencias

```bash
# Instalar dependencias del servidor
cd server
npm install --production

# Instalar y construir cliente
cd ../client
rm -rf node_modules package-lock.json
npm install
npm install react-scripts@5.0.1 --save
npm run build
```

### 4. Configurar Variables de Entorno

```bash
cd ~/gastos/server
cp .env.example .env

# Editar configuración
nano .env
```

### 5. Iniciar Servicios

```bash
# Iniciar con PM2
cd ~/gastos
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Configurar Nginx
sudo tee /etc/nginx/sites-available/gastos-robert > /dev/null <<EOF
server {
  listen 80;
  server_name _;
  root /home/nina/gastos-robert/client/build;
  location / {
    try_files $uri $uri/ /index.html;
  }
  location /api/ {
    proxy_pass http://localhost:5000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
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
sudo ln -sf /etc/nginx/sites-available/gastos-robert /etc/nginx/sites-enabled/gastos-robert
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## ⚙️ Configuración

### 🔐 Variables de Entorno Requeridas

Edita el archivo `~/gastos/server/.env`:

```bash
# === CONFIGURACIÓN BÁSICA ===
NODE_ENV=production
PORT=5000

# === SEGURIDAD JWT ===
# CRÍTICO: Cambiar en producción por una clave de al menos 64 caracteres
JWT_SECRET=genera-una-clave-muy-larga-y-segura-aqui
JWT_EXPIRES_IN=7d

# === CONFIGURACIÓN CORS ===
# Lista de orígenes permitidos separados por coma
ALLOWED_ORIGINS=https://tu-dominio.com,http://167.234.215.122

# === CONFIGURACIÓN EMAIL ===
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicación
EMAIL_FROM=tu-email@gmail.com

# === API TASAS DE CAMBIO (OPCIONAL) ===
EXCHANGE_API_KEY=tu-clave-de-exchangerate-api

# === CONFIGURACIÓN APLICACIÓN ===
APP_URL=http://167.234.215.122
DB_PATH=./gastos_robert.db
```

### 📧 Configuración de Gmail

Para habilitar el envío de emails:

1. **Activar 2FA** en tu cuenta Gmail
2. **Generar App Password**:
   - Ve a Google Account Settings > Security > App passwords
   - Genera una contraseña específica para la aplicación
3. **Usar App Password** en `EMAIL_PASS`

### 💱 Configuración API de Tasas de Cambio

Para tasas de cambio actualizadas automáticamente:

1. **Regístrate** en [exchangerate-api.com](https://exchangerate-api.com)
2. **Obtén tu API key** gratuita
3. **Configura** `EXCHANGE_API_KEY` en `.env`

---

## 🐳 Despliegue en Producción

### 🌐 Configuración con Dominio

Si tienes un dominio, puedes configurar SSL automáticamente:

```bash
# Durante la instalación, ingresa tu dominio cuando se solicite
# O configurar manualmente:
sudo certbot --nginx -d tu-dominio.com
```

### 🔒 Configuración de Seguridad Adicional

```bash
# Configurar Fail2Ban para protección adicional
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Configurar actualizaciones automáticas
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 🔄 Actualización de la Aplicación

```bash
# Script de actualización automática incluido
cd ~/gastos
sudo ./scripts/update-application.sh
```

---

## 📊 Uso de la Aplicación

### 👤 Registro e Inicio de Sesión

1. **Acceder** a la aplicación en tu navegador:
   - Con dominio: `https://tu-dominio.com`
   - Sin dominio: `http://167.234.215.122`

2. **Crear cuenta** nueva o iniciar sesión
3. El sistema creará **categorías por defecto** automáticamente

### 💸 Gestión de Gastos

#### ➕ Agregar Gastos
- Clic en botón **"+"** en dashboard
- Completar formulario con:
  - **Descripción** del gasto
  - **Monto** y moneda
  - **Categoría** (crear nuevas si es necesario)
  - **Fecha** del gasto
  - **Recurrencia** (opcional)

#### 🏷️ Gestión de Categorías
- **Crear categorías** personalizadas
- **Asignar colores** e iconos
- **Organizar gastos** por categoría

#### 💱 Múltiples Monedas
- **Soporte nativo** para USD, EUR, COP, CAD, GBP, JPY, MXN
- **Tasas actualizadas** automáticamente
- **Conversión automática** en reportes

### 📄 Generación de Reportes

1. **Navegar** a sección de reportes
2. **Seleccionar período** y filtros
3. **Generar PDF** con resumen detallado
4. **Descargar** o ver en línea

### 📧 Recordatorios Automáticos

Los recordatorios se envían automáticamente:
- **Gastos recurrentes** próximos a vencer
- **Resumen semanal** los domingos
- **Notificaciones** de gastos importantes

---

## 🔐 Seguridad

### 🛡️ Medidas de Seguridad Implementadas

- **✅ Autenticación JWT** segura con tokens de larga duración
- **✅ Encriptación bcrypt** con 12 salt rounds para contraseñas
- **✅ Protección XSS** con validación y sanitización de inputs
- **✅ Protección SQL Injection** with consultas parametrizadas
- **✅ Rate Limiting** contra ataques de fuerza bruta
- **✅ CORS restrictivo** con orígenes configurables
- **✅ Security Headers** con Helmet.js
- **✅ Firewall UFW** configurado automáticamente
- **✅ SSL/TLS** con Let's Encrypt (opcional)

### 🔍 Auditoría de Seguridad

El proyecto ha sido auditado y las vulnerabilidades críticas han sido corregidas:

- **Score de Seguridad**: 9.1/10
- **Vulnerabilidades Críticas**: 0
- **Vulnerabilidades Altas**: 0
- **Ver detalles**: [SECURITY_FIXES_APPLIED.md](./SECURITY_FIXES_APPLIED.md)

### 📋 Checklist de Seguridad

Antes del despliegue, verificar:

- [ ] JWT_SECRET configurado con clave segura (64+ caracteres)
- [ ] CORS origins configurados correctamente para producción
- [ ] Firewall UFW activo
- [ ] SSL configurado (si se usa dominio)
- [ ] Backups funcionando
- [ ] Logs configurados y rotando
- [ ] Actualizaciones automáticas habilitadas

---

## 🛠️ Desarrollo

### 🚀 Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/robertfenyiner/gastos.git
cd gastos

# Instalar dependencias
npm run install-deps

# Configurar variables de entorno
cp server/.env.example server/.env
# Editar server/.env con configuración de desarrollo

# Ejecutar en modo desarrollo
npm run dev
```

Esto iniciará:
- **Backend API** en `http://localhost:5000`
- **Frontend React** en `http://localhost:3000`

### 📁 Estructura del Proyecto

```
gastos-robert/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── contexts/      # Contextos React (Auth, etc.)
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── utils/         # Utilidades y helpers
│   │   └── types/         # Tipos TypeScript
│   └── public/            # Archivos públicos
├── server/                # Backend Node.js
│   ├── routes/           # Rutas de la API
│   ├── middleware/       # Middlewares (auth, etc.)
│   ├── services/         # Servicios (email, currency, etc.)
│   └── database.js       # Configuración de base de datos
├── scripts/              # Scripts de instalación y mantenimiento
├── config/               # Archivos de configuración
└── docs/                 # Documentación
```

### 🧪 Testing

```bash
# Ejecutar tests (cuando estén disponibles)
npm test

# Linting
npm run lint

# Build para producción
npm run build
```

---

## 📈 Monitoreo y Mantenimiento

### 📊 Comandos de Monitoreo

```bash
# Ver estado de la aplicación
sudo pm2 status

# Ver logs en tiempo real
sudo pm2 logs gastos-robert-api

# Ver logs de Nginx
sudo tail -f /var/log/nginx/gastos-robert-access.log

# Ver uso del sistema
htop
df -h
```

### 🔄 Comandos de Mantenimiento

```bash
# Reiniciar aplicación
sudo pm2 restart gastos-robert-api

# Recargar aplicación (sin downtime)
sudo pm2 reload gastos-robert-api

# Backup manual
sudo /usr/local/bin/backup-gastos-robert.sh

# Ver backups
ls -la /backup/gastos-robert/

# Actualizar sistema
sudo apt update && sudo apt upgrade -y
```

### 📅 Tareas de Mantenimiento Regulares

#### **Semanales**
- [ ] Revisar logs de errores
- [ ] Verificar estado de certificados SSL
- [ ] Comprobar espacio en disco
- [ ] Revisar backups

#### **Mensuales**
- [ ] Actualizar dependencias: `npm audit fix`
- [ ] Actualizar sistema: `sudo apt update && sudo apt upgrade -y`
- [ ] Revisar y limpiar logs antiguos
- [ ] Verificar performance de la aplicación

#### **Trimestrales**
- [ ] Auditoría de seguridad completa
- [ ] Revisar configuración de firewall
- [ ] Actualizar documentación
- [ ] Backup de configuración completa

---

## 🐛 Solución de Problemas

### ❌ Problemas Comunes

#### **Problema**: La aplicación no inicia
```bash
# Verificar logs de PM2
sudo pm2 logs gastos-robert-api

# Verificar configuración
cd ~/gastos/server
node index.js
```

#### **Problema**: Error 502 Bad Gateway
```bash
# Verificar que la API esté funcionando
curl http://localhost:5000/api/health

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar configuración de Nginx
sudo nginx -t
```

#### **Problema**: Base de datos no accesible
```bash
# Verificar permisos de archivo
ls -la ~/gastos/server/gastos_robert.db

# Corregir permisos si es necesario
sudo chown ubuntu:ubuntu ~/gastos/server/gastos_robert.db
chmod 600 ~/gastos/server/gastos_robert.db
```

#### **Problema**: Emails no se envían
```bash
# Verificar configuración de email
cd ~/gastos/server
node -e "
  require('dotenv').config();
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[CONFIGURED]' : '[NOT SET]');
"

# Verificar logs para errores de email
sudo pm2 logs gastos-robert-api | grep -i email
```

#### **Problema**: Tasas de cambio no se actualizan
```bash
# Verificar API key
grep EXCHANGE_API_KEY ~/gastos/server/.env

# Ver logs específicos
sudo pm2 logs gastos-robert-api | grep -i "exchange\|currency"
```

### 🆘 Obtener Ayuda

Si necesitas ayuda adicional:

1. **📧 Email**: robert@gastosrobert.com
2. **🐛 Issues**: [GitHub Issues](https://github.com/robertfenyiner/gastos/issues)
3. **📖 Documentación**: Revisar archivos en `/docs/`
4. **🔐 Seguridad**: [SECURITY.md](./SECURITY.md)

Al reportar un problema, incluye:
- **Sistema operativo** y versión
- **Logs relevantes** (sin información sensible)
- **Pasos para reproducir** el problema
- **Configuración** (sin contraseñas ni tokens)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Para contribuir:

1. **Fork** del repositorio
2. **Crear** una rama para tu feature: `git checkout -b feature/nueva-caracteristica`
3. **Commit** tus cambios: `git commit -am 'Agregar nueva característica'`
4. **Push** a la rama: `git push origin feature/nueva-caracteristica`
5. **Crear** Pull Request

### 📝 Guías de Contribución

- **Código**: Seguir las convenciones existentes
- **Commits**: Usar mensajes descriptivos en español
- **Tests**: Agregar tests para nuevas funcionalidades
- **Documentación**: Actualizar documentación según sea necesario

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Ver [LICENSE](./LICENSE) para más detalles.

```
MIT License

Copyright (c) 2024 Robert Fenyiner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🎯 Estado del Proyecto

- **✅ Versión**: 1.0.0
- **✅ Estado**: Producción Ready
- **✅ Seguridad**: Auditada (9.1/10)
- **✅ Tests**: En desarrollo
- **✅ Documentación**: Completa
- **✅ Soporte**: Activo

---

## 🔗 Enlaces Útiles

- **🌐 Demo**: `http://167.234.215.122` (después de instalación)
- **📚 Documentación**: [/docs](./docs/)
- **🔐 Seguridad**: [SECURITY.md](./SECURITY.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/robertfenyiner/gastos/issues)
- **📧 Contacto**: robert@gastosrobert.com

---

<div align="center">

**⭐ Si este proyecto te es útil, no olvides darle una estrella en GitHub ⭐**

Hecho con ❤️ por [Robert Fenyiner](https://github.com/robertfenyiner)

</div>