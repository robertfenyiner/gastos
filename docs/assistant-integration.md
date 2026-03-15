# Integración conversacional de gastos

Se dejó una utilidad local para operar la app `gastos` desde este servidor sin depender de la UI web.

## Archivo

```bash
node tools/gastos-assistant.js
```

## Credenciales usadas

Por defecto usa:
- email: `admin@gastosrobert.com`
- password: `02170217`
- base URL: `http://127.0.0.1:5000/api`

Se pueden sobrescribir con variables de entorno:

- `GASTOS_BASE_URL`
- `GASTOS_EMAIL`
- `GASTOS_PASSWORD`

## Comandos disponibles

### Listar categorías
```bash
node tools/gastos-assistant.js categories
```

### Listar monedas
```bash
node tools/gastos-assistant.js currencies
```

### Agregar gasto
```bash
node tools/gastos-assistant.js add-expense \
  --description "almuerzo" \
  --amount 25000 \
  --category "Comida" \
  --currency COP \
  --date 2026-03-15
```

### Consultar gasto de un día
```bash
node tools/gastos-assistant.js spent-on-date --date 2026-03-15
```

### Ver gastos recientes
```bash
node tools/gastos-assistant.js recent-expenses
```

## Limitaciones actuales

La app hoy soporta bien **gastos**.
No existe todavía un módulo formal de **ingresos**.

## Multi-moneda e histórico COP

La app quedó ajustada para guardar gastos en moneda extranjera conservando:

- monto original
- moneda original
- `exchange_rate` usado al momento del registro
- `amount_cop` histórico guardado en la base

Eso permite registrar, por ejemplo:
- `50 TRY`
- `10 USD`
- `150 NGN`

y consultar después el equivalente histórico en COP sin recalcular con la tasa del día actual.

### Fuente de tasas actual

La conversión usa actualmente **open.er-api.com** con base **USD**.

La app actualiza tasas:
- automáticamente todos los días a las **06:00**
- y también intenta una actualización al iniciar el servicio

### Criterio del proyecto

Por ahora se mantiene esta fuente porque ofrece un comportamiento estable y consistente para el histórico.
No se migrará a scraping de Google salvo que más adelante Robert lo pida explícitamente.

Si se quiere soportar:
- “agrega un ingreso de X”
- “cuánto me ingresó el día X”

entonces toca extender la app con un tipo de movimiento (`gasto|ingreso`) o un módulo de ingresos separado.

## Uso esperado desde chat

Con esta utilidad, el siguiente paso natural es que el asistente traduzca instrucciones como:

- “añade un gasto de 18.000 en comida hoy”
- “agrega un gasto de 40.000 en transporte ayer”
- “cuánto me gasté hoy”
- “cuánto me gasté el 14 de marzo”

al comando/API correspondiente.
