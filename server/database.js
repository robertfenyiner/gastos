const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'expense_tracker.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
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

  // Currencies table
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

  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      currency_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT NOT NULL,
      date DATE NOT NULL,
      is_recurring BOOLEAN DEFAULT FALSE,
      recurring_frequency VARCHAR(20),
      next_due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
      FOREIGN KEY (currency_id) REFERENCES currencies (id) ON DELETE CASCADE
    )
  `);

  // Email reminders table
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

  // Insert default currencies
  const currencies = [
    ['USD', 'US Dollar', '$'],
    ['EUR', 'Euro', '€'],
    ['COP', 'Colombian Peso', '$'],
    ['CAD', 'Canadian Dollar', 'C$'],
    ['GBP', 'British Pound', '£'],
    ['JPY', 'Japanese Yen', '¥'],
    ['MXN', 'Mexican Peso', '$']
  ];

  const insertCurrency = db.prepare(`
    INSERT OR IGNORE INTO currencies (code, name, symbol) VALUES (?, ?, ?)
  `);

  currencies.forEach(currency => {
    insertCurrency.run(currency);
  });

  insertCurrency.finalize();
});

module.exports = db;