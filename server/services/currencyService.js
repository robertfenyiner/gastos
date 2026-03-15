const axios = require('axios');
const cron = require('node-cron');
const db = require('../database');

class CurrencyService {
  constructor() {
    this.scheduleExchangeRateUpdates();
  }

  scheduleExchangeRateUpdates() {
    cron.schedule('0 6 * * *', () => {
      this.updateExchangeRates();
    });

    setTimeout(() => {
      this.updateExchangeRates();
    }, 10000);

    console.log('Programador del servicio de divisas inicializado');
  }

  async updateExchangeRates() {
    try {
      console.log('Actualizando tasas de cambio (open.er-api.com)...');

      const response = await axios.get('https://open.er-api.com/v6/latest/USD', {
        timeout: 10000,
      });

      if (response.data?.result !== 'success' || !response.data?.rates) {
        throw new Error('Respuesta inválida del servicio de tasas');
      }

      const rates = response.data.rates;
      rates.USD = 1;

      let updatedCount = 0;

      for (const [currencyCode, rate] of Object.entries(rates)) {
        try {
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE currencies SET exchange_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE code = ?',
              [rate, currencyCode],
              function (err) {
                if (err) return reject(err);
                if (this.changes > 0) updatedCount++;
                resolve();
              }
            );
          });
        } catch (error) {
          console.error(`Error al actualizar la tasa para ${currencyCode}:`, error.message || error);
        }
      }

      console.log(`Tasas de cambio actualizadas correctamente. ${updatedCount} monedas actualizadas.`);
    } catch (error) {
      console.error('Error al actualizar las tasas de cambio:', error.message);
    }
  }

  async convertCurrency(amount, fromCurrency, toCurrency) {
    return new Promise((resolve, reject) => {
      if (fromCurrency === toCurrency) {
        resolve({
          originalAmount: amount,
          convertedAmount: amount,
          fromCurrency,
          toCurrency,
          exchangeRate: 1,
        });
        return;
      }

      db.all(
        'SELECT code, exchange_rate FROM currencies WHERE code IN (?, ?)',
        [fromCurrency, toCurrency],
        (err, currencies) => {
          if (err) {
            reject(new Error('Error de base de datos'));
            return;
          }

          if (currencies.length !== 2) {
            reject(new Error('Una o ambas monedas no fueron encontradas'));
            return;
          }

          const fromRate = Number(currencies.find(c => c.code === fromCurrency)?.exchange_rate || 1);
          const toRate = Number(currencies.find(c => c.code === toCurrency)?.exchange_rate || 1);

          if (!fromRate || !toRate) {
            reject(new Error('Tasa de cambio inválida'));
            return;
          }

          const usdAmount = amount / fromRate;
          const convertedAmount = usdAmount * toRate;
          const exchangeRate = toRate / fromRate;

          resolve({
            originalAmount: parseFloat(amount),
            convertedAmount: Math.round(convertedAmount * 100) / 100,
            fromCurrency,
            toCurrency,
            exchangeRate: Math.round(exchangeRate * 1000000) / 1000000,
          });
        }
      );
    });
  }

  async convertToCOP(amount, fromCurrency) {
    if (fromCurrency === 'COP') {
      return {
        originalAmount: amount,
        copAmount: amount,
        exchangeRate: 1,
      };
    }

    try {
      const result = await this.convertCurrency(amount, fromCurrency, 'COP');
      return {
        originalAmount: result.originalAmount,
        copAmount: result.convertedAmount,
        exchangeRate: result.exchangeRate,
      };
    } catch (error) {
      console.error(`Error converting ${fromCurrency} to COP:`, error);
      throw error;
    }
  }

  async addCurrency(code, name, symbol) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id FROM currencies WHERE code = ?', [code], (err, existingCurrency) => {
        if (err) {
          reject(new Error('Error de base de datos'));
          return;
        }

        if (existingCurrency) {
          reject(new Error('La moneda ya existe'));
          return;
        }

        db.run(
          'INSERT INTO currencies (code, name, symbol) VALUES (?, ?, ?)',
          [code, name, symbol],
          function (err) {
            if (err) {
              reject(new Error('Error al agregar la moneda'));
              return;
            }

            db.get('SELECT * FROM currencies WHERE id = ?', [this.lastID], (err, currency) => {
              if (err) {
                reject(new Error('Error al obtener la moneda creada'));
                return;
              }

              resolve(currency);
            });
          }
        );
      });
    });
  }

  async getAllCurrencies() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM currencies ORDER BY code ASC', (err, currencies) => {
        if (err) {
          reject(new Error('Error de base de datos'));
          return;
        }

        resolve(currencies);
      });
    });
  }

  async getCurrencyUsageStats(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          cur.code,
          cur.name,
          cur.symbol,
          COUNT(e.id) as expense_count,
          SUM(e.amount) as total_amount
        FROM currencies cur
        LEFT JOIN expenses e ON cur.id = e.currency_id AND e.user_id = ?
        GROUP BY cur.id
        HAVING expense_count > 0
        ORDER BY total_amount DESC
      `;

      db.all(query, [userId], (err, stats) => {
        if (err) {
          reject(new Error('Error de base de datos'));
          return;
        }

        resolve(stats);
      });
    });
  }

  async getExchangeRateHistory(currencyCode, days = 30) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT exchange_rate, updated_at FROM currencies WHERE code = ?',
        [currencyCode],
        (err, currency) => {
          if (err) {
            reject(new Error('Error de base de datos'));
            return;
          }

          if (!currency) {
            reject(new Error('Moneda no encontrada'));
            return;
          }

          const history = [{
            date: currency.updated_at,
            rate: currency.exchange_rate,
          }];

          resolve(history);
        }
      );
    });
  }

  async getPopularCurrencies(limit = 10) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          cur.*,
          COUNT(e.id) as usage_count
        FROM currencies cur
        LEFT JOIN expenses e ON cur.id = e.currency_id
        GROUP BY cur.id
        ORDER BY usage_count DESC, cur.code ASC
        LIMIT ?
      `;

      db.all(query, [limit], (err, currencies) => {
        if (err) {
          reject(new Error('Error de base de datos'));
          return;
        }

        resolve(currencies);
      });
    });
  }
}

module.exports = new CurrencyService();
