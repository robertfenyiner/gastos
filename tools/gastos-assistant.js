#!/usr/bin/env node

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
  return { cmd, opts, rest };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function detectDate(text) {
  const lower = text.toLowerCase();
  if (lower.includes('ayer')) return yesterday();
  if (lower.includes('hoy')) return today();
  const m = lower.match(/(20\d{2}-\d{2}-\d{2})/);
  return m ? m[1] : today();
}

function detectCurrency(text) {
  const upper = text.toUpperCase();
  if (upper.includes('TRY') || text.toLowerCase().includes('lira')) return 'TRY';
  if (upper.includes('USD') || text.toLowerCase().includes('dolar')) return 'USD';
  if (upper.includes('NGN') || text.toLowerCase().includes('naira')) return 'NGN';
  if (upper.includes('COP') || text.toLowerCase().includes('peso')) return 'COP';
  return 'COP';
}

function detectRecurring(text) {
  const lower = text.toLowerCase();
  if (lower.includes('mensual')) return 'monthly';
  if (lower.includes('semanal')) return 'weekly';
  if (lower.includes('anual')) return 'yearly';
  if (lower.includes('diario')) return 'daily';
  return null;
}

function parseAmount(text) {
  const lower = text.toLowerCase().replace(/[,]/g, '.');
  const mil = lower.match(/(\d+(?:\.\d+)?)\s*mil\b/);
  if (mil) return Number(mil[1]) * 1000;
  const plain = lower.match(/(\d+(?:[\.,]\d+)?)/);
  if (plain) return Number(String(plain[1]).replace(/,/g, '.'));
  return null;
}

function inferCategory(description, categories) {
  const d = description.toLowerCase();
  const rules = [
    [/youtube|spotify|disney|netflix|amazon|stream|prime/, ['Entretenimiento', 'Suscripciones']],
    [/uber|taxi|bus|gasolina|transporte|peaje/, ['Transporte']],
    [/almuerzo|comida|restaurante|cafe|mercado|super/, ['Alimentación']],
    [/medico|farmacia|salud|eps/, ['Salud']],
    [/arriendo|servicio|internet|luz|agua/, ['Servicios', 'Hogar']],
  ];
  for (const [regex, names] of rules) {
    if (regex.test(d)) {
      const found = categories.find(c => names.some(n => c.name.toLowerCase() === n.toLowerCase()));
      if (found) return found;
    }
  }
  return categories[0];
}

async function getCategories(token) {
  return api(token, 'GET', '/categories');
}

async function getCurrencies(token) {
  return api(token, 'GET', '/currencies');
}

async function getCategoryId(token, name) {
  const categories = await getCategories(token);
  const found = categories.find(c => c.name.toLowerCase() === String(name).toLowerCase());
  if (!found) {
    const available = categories.map(c => c.name).join(', ');
    throw new Error(`Categoría no encontrada: ${name}. Disponibles: ${available}`);
  }
  return found.id;
}

async function getCurrencyId(token, code) {
  const currencies = await getCurrencies(token);
  const found = currencies.find(c => c.code.toLowerCase() === String(code).toLowerCase());
  if (!found) throw new Error(`Moneda no encontrada: ${code}`);
  return found.id;
}

async function getRecentExpenses(token, limit = 20) {
  return api(token, 'GET', `/expenses?limit=${limit}`);
}

async function deleteExpense(token, id) {
  return api(token, 'DELETE', `/expenses/${id}`);
}

async function updateExpense(token, id, payload) {
  return api(token, 'PUT', `/expenses/${id}`, payload);
}

async function addExpense(token, opts) {
  const categoryId = await getCategoryId(token, opts.category);
  const currencyId = await getCurrencyId(token, opts.currency || 'COP');
  const payload = {
    categoryId,
    currencyId,
    amount: Number(opts.amount),
    description: opts.description,
    date: opts.date || today()
  };
  if (opts.recurringFrequency) {
    payload.isRecurring = true;
    payload.recurringFrequency = opts.recurringFrequency;
    payload.reminderDaysAdvance = 1;
  }
  return api(token, 'POST', '/expenses', payload);
}

function summarizeExpense(expense) {
  return {
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency_code,
    amount_cop: expense.amount_cop,
    category: expense.category_name,
    date: expense.date,
    recurring: Boolean(expense.is_recurring),
    recurring_frequency: expense.recurring_frequency || null
  };
}

async function handleNatural(token, text) {
  const lower = text.toLowerCase().trim();

  if (lower.startsWith('cuanto me gaste') || lower.startsWith('cuánto me gasté') || lower.startsWith('cuanto gaste') || lower.startsWith('gastos de')) {
    const date = detectDate(text);
    const data = await api(token, 'GET', `/expenses?startDate=${date}&endDate=${date}&limit=200`);
    const expenses = data.expenses || [];
    const total = expenses.reduce((sum, e) => sum + Number(e.amount_cop || e.amount || 0), 0);
    return { action: 'spent-on-date', date, count: expenses.length, total_cop: total, expenses: expenses.map(summarizeExpense) };
  }

  if (lower.includes('gastos recientes')) {
    const data = await getRecentExpenses(token, 10);
    return { action: 'recent-expenses', expenses: (data.expenses || []).map(summarizeExpense) };
  }

  if (lower.startsWith('borra el ultimo') || lower.startsWith('borra el último')) {
    const data = await getRecentExpenses(token, 1);
    const last = data.expenses?.[0];
    if (!last) throw new Error('No hay gastos para borrar');
    await deleteExpense(token, last.id);
    return { action: 'delete-last', deleted: summarizeExpense(last) };
  }

  if (lower.startsWith('corrige el ultimo a ') || lower.startsWith('corrige el último a ')) {
    const amount = parseAmount(lower);
    if (amount == null) throw new Error('No pude detectar el nuevo monto');
    const data = await getRecentExpenses(token, 1);
    const last = data.expenses?.[0];
    if (!last) throw new Error('No hay gastos para corregir');
    const updated = await updateExpense(token, last.id, {
      categoryId: last.category_id || last.categoryId || last.category_id,
      currencyId: last.currency_id || last.currencyId || last.currency_id,
      amount,
      description: last.description,
      date: last.date,
      isRecurring: Boolean(last.is_recurring),
      recurringFrequency: last.recurring_frequency || null,
      reminderDaysAdvance: last.reminder_days_advance || 1
    });
    return { action: 'update-last-amount', expense: updated.expense ? summarizeExpense(updated.expense) : updated };
  }

  const amount = parseAmount(text);
  if (amount != null) {
    const categories = await getCategories(token);
    const currency = detectCurrency(text);
    const recurringFrequency = detectRecurring(text);
    const date = detectDate(text);
    let description = text
      .replace(/\b(hoy|ayer|mensual|semanal|anual|diario)\b/gi, '')
      .replace(/\b(cop|usd|try|ngn|peso|dolar|lira|naira)\b/gi, '')
      .replace(/\b(agrega|añade|anota|registra|gasto|de)\b/gi, '')
      .replace(/\d+(?:[\.,]\d+)?\s*mil\b/gi, '')
      .replace(/\d+(?:[\.,]\d+)?/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!description) description = 'Gasto registrado por chat';
    const category = inferCategory(description, categories);
    const data = await addExpense(token, { description, amount, category: category.name, currency, date, recurringFrequency });
    return { action: 'add-expense', expense: summarizeExpense(data.expense) };
  }

  throw new Error('No pude interpretar la instrucción');
}

(async () => {
  const { cmd, opts, rest } = parseArgs(process.argv.slice(2));
  const token = await login();

  if (cmd === 'categories') {
    console.log(JSON.stringify(await getCategories(token), null, 2));
    return;
  }

  if (cmd === 'currencies') {
    console.log(JSON.stringify(await getCurrencies(token), null, 2));
    return;
  }

  if (cmd === 'add-expense') {
    const data = await addExpense(token, opts);
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
    console.log(JSON.stringify(await getRecentExpenses(token, 20), null, 2));
    return;
  }

  if (cmd === 'delete-expense') {
    console.log(JSON.stringify(await deleteExpense(token, opts.id), null, 2));
    return;
  }

  if (cmd === 'natural') {
    const text = rest.join(' ');
    console.log(JSON.stringify(await handleNatural(token, text), null, 2));
    return;
  }

  console.error('Uso:');
  console.error('  node tools/gastos-assistant.js natural "agrega 20 mil de netflix mensual"');
  console.error('  node tools/gastos-assistant.js natural "cuánto me gasté hoy"');
  console.error('  node tools/gastos-assistant.js natural "borra el último"');
  console.error('  node tools/gastos-assistant.js natural "corrige el último a 25 mil"');
  console.error('  node tools/gastos-assistant.js add-expense --description "almuerzo" --amount 25000 --category "Alimentación" --currency COP --date 2026-03-15');
  console.error('  node tools/gastos-assistant.js spent-on-date --date 2026-03-15');
  console.error('  node tools/gastos-assistant.js recent-expenses');
  process.exit(1);
})().catch(err => {
  console.error(err.message || String(err));
  process.exit(1);
});
