# Gastos Robert

Aplicación web para gestión personal de gastos, con autenticación, categorías, reportes y panel administrativo.

## Estado actual

Este proyecto quedó **operativo** en el servidor de Robert y validado manualmente en estas secciones:

- Dashboard ✅
- Gastos ✅
- Categorías ✅
- Perfil ✅
- Reportes ✅
- Administración ✅
- Login / Logout ✅

## Acceso actual

### Red local (casa)
- `http://192.168.18.16:5000`

### Tailscale
- `http://100.102.78.64:5000`

## Stack

### Backend
- Node.js
- Express
- SQLite
- JWT
- bcryptjs

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router
- React Hook Form

## Estructura

```text
gastos/
├── client/     # Frontend React
├── server/     # API Express + SQLite
├── .env        # Configuración activa del despliegue
└── README.md
```

## Cómo correrlo en este servidor

### Servicio activo
La app corre como servicio de usuario systemd:

```bash
systemctl --user status gastos-robert.service
```

### Reiniciar
```bash
systemctl --user restart gastos-robert.service
```

### Ver logs
```bash
journalctl --user -u gastos-robert.service -n 100 --no-pager
```

## Build / despliegue manual

Desde la raíz del repo:

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
npm run build
systemctl --user restart gastos-robert.service
```

## Variables importantes

El despliegue actual usa un archivo `.env` en la raíz del proyecto.

Variables relevantes:

- `NODE_ENV=production`
- `PORT=5000`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `ALLOWED_ORIGINS=*`
- `APP_URL=http://100.102.78.64:5000`
- `DB_PATH=./gastos_robert.db`

## Notas operativas actuales

### CORS
Quedó configurado para aceptar cualquier origen:

```env
ALLOWED_ORIGINS=*
```

Y el backend fue ajustado para respetar `*` de verdad.

### Red
La app se usa de dos maneras:

- por **LAN** cuando Robert está en casa
- por **Tailscale** cuando está fuera

### Firewall
Se abrió `5000/tcp` solo para la red local cuando hizo falta probar por LAN.
La exposición externa real recomendada sigue siendo por **Tailscale**.

## Git y repositorio remoto

Este repo quedó configurado para trabajar con GitHub por HTTPS y token en esta máquina.

### Flujo normal
```bash
git status
git add .
git commit -m "mensaje"
git push origin main
```

## Cambios importantes que ya se hicieron

Durante la puesta en marcha se corrigieron, entre otras cosas:

- despliegue por Tailscale
- rutas internas del frontend
- flujo de login y logout
- bucles en autenticación
- manejo del cliente API
- carga del dashboard
- endpoint de actualización de perfil
- compatibilidad de frontend para móvil
- README desactualizado

## Commits relevantes recientes

- `6472a61` — Fix gastos frontend auth flow and dashboard loading
- `f5f9a71` — Restore full app routes
- `c7fe22f` — Fix profile update endpoint and mobile spacing

## Credenciales

No documentes contraseñas reales en este archivo.

Si necesitas cambiar la contraseña del admin, hazlo desde la app o directamente en la base de datos con hash bcrypt.

## Pendientes recomendados

No bloquean operación, pero serían buenos siguientes pasos:

- endurecer CORS si algún día se deja de usar LAN/Tailscale mixto
- revisar responsive móvil de algunos formularios/modales
- cambiar la contraseña admin por una más fuerte
- documentar backup de la base SQLite
- revisar email/SMTP si se quiere activar esa parte

## Troubleshooting rápido

### La app no abre
Verifica servicio:

```bash
systemctl --user status gastos-robert.service
```

### Cambié frontend y no veo cambios
Reconstruye y reinicia:

```bash
npm run build
systemctl --user restart gastos-robert.service
```

### Error de autenticación o sesión
Revisa logs:

```bash
journalctl --user -u gastos-robert.service -n 100 --no-pager
```

### Error de base de datos
Verifica que exista:

```bash
ls -lh gastos_robert.db
```

## Mantenimiento

Para revisar salud general:

```bash
systemctl --user status gastos-robert.service
journalctl --user -u gastos-robert.service -n 50 --no-pager
git status
```
