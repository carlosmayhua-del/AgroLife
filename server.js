import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const { CLIENT_ID, CLIENT_SECRET, THING_ID } = process.env;
const BASE = "https://api2.arduino.cc/iot/v2";

if (!CLIENT_ID || !CLIENT_SECRET || !THING_ID) {
  console.warn("Faltan variables de entorno: CLIENT_ID, CLIENT_SECRET, THING_ID");
}

// Token con cache (Arduino lo da por ~5 min)
let token = null;
let tokenExp = 0;

async function getToken() {
  if (token && Date.now() < tokenExp) return token;

  const res = await fetch("https://api2.arduino.cc/iot/v1/clients/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: "https://api2.arduino.cc/iot",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error("No se pudo obtener el token: " + JSON.stringify(data));
  }

  token = data.access_token;
  tokenExp = Date.now() + (data.expires_in - 60) * 1000;
  return token;
}

// Leer todas las variables del Thing
app.get("/api/properties", async (req, res) => {
  try {
    const t = await getToken();
    const r = await fetch(`${BASE}/things/${THING_ID}/properties`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Modificar una variable
app.put("/api/properties/:pid", async (req, res) => {
  try {
    const t = await getToken();
    const r = await fetch(
      `${BASE}/things/${THING_ID}/properties/${req.params.pid}/publish`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: req.body.value }),
      }
    );
    const text = await r.text();
    res.status(r.status).send(text || "{}");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
