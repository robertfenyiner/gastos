require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar base de datos para inicializar tablas
require('./database');

// Inicializar servicio de email
require('./services/emailService');

// Inicializar servicio de monedas
require('./services/currencyService');

// Importar rutas
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');
const currencyRoutes = require('./routes/currencies');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet());

// Limitación de velocidad (Rate limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limitar cada IP a 100 requests por ventana de tiempo
  message: 'Demasiadas peticiones desde esta IP, intente de nuevo más tarde.'
});
app.use('/api/', limiter);

// Limitación más estricta para endpoints de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // limitar cada IP a 5 requests por ventana para auth
  message: 'Demasiados intentos de autenticación, intente de nuevo más tarde.'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Configuración CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
      : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`CORS bloqueó petición desde origen: ${origin}`);
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Soporte para navegadores legacy
};

app.use(cors(corsOptions));

// Middleware de parseo de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/reports', reportRoutes);

// Endpoint de verificación de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    app: 'Gastos Robert'
  });
});

// Servir archivos estáticos de React en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Algo salió mal!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// Manejador 404 para rutas de API
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Endpoint de API no encontrado' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Aplicación: Gastos Robert v1.0`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API disponible en: http://localhost:${PORT}/api`);
    console.log(`Verificación de salud: http://localhost:${PORT}/api/health`);
  }
});

module.exports = app;