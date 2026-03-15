#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE = process.env.GASTOS_BASE_URL || 'http://127.0.0.1:5000/api';
const EMAIL = process.env.GASTOS_EMAIL || 'admin@gastosrobert.com';
const PASSWORD = process.env.GASTOS_PASSWORD || '02170217';

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data.token;
}

async function api(token, method, endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
  return data;
}

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const opts = {};
  for (let i = 0; i < rest.length; i++) {
    const k = rest[i];
    if (k.startsWith('--')) {
      opts[k.slice(2)] = rest[i + 1];
      i++;
    }
  }
  return { cmd, opts };
}

async function getCategoryId(token, name) {
  const categories = await api(token, 'GET', '/categories');
  const found = categories.find(c => c.name.toLowerCase() === String(name).toLowerCase());
  if (!found) {
    const available = categories.map(c => c.name).join(', ');
    throw new Error(`Categoría no encontrada: ${name}. Disponibles: ${available}`);
  }
  return found.id;
}

async function getCurrencyId(token, code) {
  const currencies = await api(token, 'GET', '/currencies');
  const found = currencies.find(c => c.code.toLowerCase() === String(code).toLowerCase());
  if (!found) throw new Error(`Moneda no encontrada: ${code}`);
  return found.id;
}

(async () => {
  const { cmd, opts } = parseArgs(process.argv.slice(2));
  const token = await login();

  if (cmd === 'categories') {
    const data = await api(token, 'GET', '/categories');
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (cmd === 'currencies') {
    const data = await api(token, 'GET', '/currencies');
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (cmd === 'add-expense') {
    const categoryId = await getCategoryId(token, opts.category);
    const currencyId = await getCurrencyId(token, opts.currency || 'COP');
    const payload = {
      categoryId,
      currencyId,
      amount: Number(opts.amount),
      description: opts.description,
      date: opts.date || new Date().toISOString().slice(0, 10)
    };
    const data = await api(token, 'POST', '/expenses', payload);
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (cmd === 'spent-on-date') {
    const date = opts.date;
    const data = await api(token, 'GET', `/expenses?startDate=${date}&endDate=${date}&limit=200`);
    const expenses = data.expenses || [];
    const total = expenses.reduce((sum, e) => sum + Number(e.amount_cop || e.amount || 0), 0);
    console.log(JSON.stringify({ date, count: expenses.length, total_cop: total, expenses }, null, 2));
    return;
  }

  if (cmd === 'recent-expenses') {
    const data = await api(token, 'GET', '/expenses?limit=20');
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.error('Uso:');
  console.error('  node tools/gastos-assistant.js categories');
  console.error('  node tools/gastos-assistant.js currencies');
  console.error('  node tools/gastos-assistant.js add-expense --description "almuerzo" --amount 25000 --category "Comida" --currency COP --date 2026-03-15');
  console.error('  node tools/gastos-assistant.js spent-on-date --date 2026-03-15');
  console.error('  node tools/gastos-assistant.js recent-expenses');
  process.exit(1);
})().catch(err => {
  console.error(err.message || String(err));
  process.exit(1);
});
