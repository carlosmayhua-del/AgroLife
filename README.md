# Arduino Panel

Panel web que lee y modifica las variables de un Thing de Arduino Cloud.
Muestra todas las variables automaticamente: interruptor para booleanos,
campo numerico para numeros y campo de texto para strings.

## Correr en tu PC

```bash
npm install
CLIENT_ID=xxx CLIENT_SECRET=xxx THING_ID=xxx node server.js
```

Abre http://localhost:3000

## Subir a Render

- Tipo: Web Service
- Build Command: `npm install`
- Start Command: `node server.js`
- Variables de entorno: `CLIENT_ID`, `CLIENT_SECRET`, `THING_ID`

Nunca subas tu `client_secret` a GitHub.
