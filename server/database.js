const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Usar variable de entorno para el path de la base de datos si existe
const dbPath = process.env.DB_PATH || path.join(__dirname, 'gastos_robert.db');

// Crear archivo de base de datos si no existe
if (!fs.existsSync(dbPath)) {
  try {
    fs.writeFileSync(dbPath, '');
    console.log(`[${new Date().toISOString()}] Archivo de base de datos creado en: ${dbPath}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error creando archivo de base de datos:`, err.message);
    process.exit(1);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`[${new Date().toISOString()}] Error al abrir la base de datos:`, err.message);
    process.exit(1);
  } else {
    console.log(`[${new Date().toISOString()}] Base de datos abierta en: ${dbPath}`);
  }
});

// Inicializar base de datos con tablas
db.serialize(() => {
  // Tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add is_admin column to existing users table (migration)
  db.run(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding is_admin column:', err);
    }
  });

  // Tabla de categorías
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      color VARCHAR(7) DEFAULT '#3B82F6',
      icon VARCHAR(50) DEFAULT 'shopping-cart',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Tabla de monedas
  db.run(`
    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(3) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      symbol VARCHAR(5) NOT NULL,
      exchange_rate DECIMAL(10,6) DEFAULT 1.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de gastos
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      currency_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      amount_cop DECIMAL(10,2) DEFAULT NULL,
      exchange_rate DECIMAL(10,6) DEFAULT NULL,
      description TEXT,
      date DATE NOT NULL,
      is_recurring BOOLEAN DEFAULT FALSE,
      recurring_frequency VARCHAR(20),
      next_due_date DATE,
      reminder_days_advance INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
      FOREIGN KEY (currency_id) REFERENCES currencies (id) ON DELETE CASCADE
    )
  `);

  // Add new columns to existing tables (migration)
  db.run(`ALTER TABLE expenses ADD COLUMN reminder_days_advance INTEGER DEFAULT 1`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding reminder_days_advance column:', err);
    }
  });

  db.run(`ALTER TABLE expenses ADD COLUMN amount_cop DECIMAL(10,2) DEFAULT NULL`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding amount_cop column:', err);
    }
  });

  db.run(`ALTER TABLE expenses ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT NULL`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding exchange_rate column:', err);
    }
  });

  // Tabla de recordatorios de email
  db.run(`
    CREATE TABLE IF NOT EXISTS email_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      expense_id INTEGER NOT NULL,
      reminder_date DATE NOT NULL,
      is_sent BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE
    )
  `);

  // Insertar monedas por defecto
  const currencies = [
    ['USD', 'Dólar Americano', '$'],
    ['EUR', 'Euro', '€'],
    ['COP', 'Peso Colombiano', '$'],
    ['CAD', 'Dólar Canadiense', 'C$'],
    ['GBP', 'Libra Esterlina', '£'],
    ['JPY', 'Yen Japonés', '¥'],
    ['MXN', 'Peso Mexicano', '$'],
    ['NGN', 'Naira Nigeriana', '₦'],
    ['TRY', 'Lira Turca', '₺']
  ];

  const insertCurrency = db.prepare(`
    INSERT OR IGNORE INTO currencies (code, name, symbol) VALUES (?, ?, ?)
  `);

  currencies.forEach(currency => {
    insertCurrency.run(currency);
  });

  insertCurrency.finalize();

  // Tabla de plantillas de email
  db.run(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_name VARCHAR(50) UNIQUE NOT NULL,
      subject VARCHAR(255) NOT NULL,
      html_content TEXT NOT NULL,
      text_content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear usuario administrador por defecto
  const bcrypt = require('bcryptjs');
  const adminPassword = '@Nina0217';
  
  bcrypt.hash(adminPassword, 12, (err, hash) => {
    if (err) {
      console.error('Error hashing admin password:', err);
      return;
    }
    
    db.run(`
      INSERT OR IGNORE INTO users (username, email, password_hash, is_admin) 
      VALUES (?, ?, ?, ?)
    `, ['Robert', 'admin@gastosrobert.com', hash, true], function(err) {
      if (err) {
        console.error('Error creating admin user:', err);
      } else if (this.changes > 0) {
        console.log(`[${new Date().toISOString()}] Usuario administrador 'Robert' creado exitosamente`);
      }
    });
  });

  // Insertar plantillas de email por defecto
  const defaultTemplates = [
    {
      name: 'expense_reminder',
      subject: 'Recordatorio: {expense_description} vence en {days_advance} días',
      html: `<!DOCTYPE html><html><head><title>Recordatorio de Gasto</title></head><body><h1>💰 Recordatorio de Gasto</h1><p>Hola {user_name},</p><p>Este es un recordatorio sobre tu próximo gasto recurrente:</p><h3>{expense_description}</h3><p><strong>Monto:</strong> {expense_amount}</p><p><strong>Fecha de vencimiento:</strong> {due_date}</p><p>¡No olvides realizar este pago!</p></body></html>`,
      text: 'Recordatorio de Gasto\n\nHola {user_name},\n\nEste es un recordatorio sobre tu próximo gasto recurrente:\n\n{expense_description}\nMonto: {expense_amount}\nFecha de vencimiento: {due_date}\n\n¡No olvides realizar este pago!'
    },
    {
      name: 'test_email',
      subject: 'Prueba de correo - Gastos Robert',
      html: `<!DOCTYPE html><html><head><title>Prueba de Correo</title></head><body><h1>✅ Prueba de Correo</h1><p>Hola {user_name},</p><p>¡Excelente! El servicio de correo electrónico de Gastos Robert está funcionando correctamente.</p></body></html>`,
      text: 'Prueba de Correo - Gastos Robert\n\nHola {user_name},\n\n¡Excelente! El servicio de correo electrónico está funcionando correctamente.'
    }
  ];

  const insertTemplate = db.prepare(`
    INSERT OR IGNORE INTO email_templates (template_name, subject, html_content, text_content) 
    VALUES (?, ?, ?, ?)
  `);

  defaultTemplates.forEach(template => {
    insertTemplate.run([template.name, template.subject, template.html, template.text]);
  });

  insertTemplate.finalize();
});

module.exports = db;