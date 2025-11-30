// ================================
// BACKEND OFICIAL WEB ECONOMY
// Google Login + Discord OAuth
// ================================

require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const axios = require("axios");

// Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(express.json());
app.use(cors());

// =======================================
// 1. RECEBE CONFIRMAÇÃO DO LOGIN GOOGLE
// =======================================
app.post("/api/accept-login", async (req, res) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email)
      return res.status(400).json({ error: "Missing UID or email." });

    await db.collection("users").doc(uid).set(
      {
        email,
        acceptedTerms: true,
        updatedAt: new Date()
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// =======================================
// 2. REDIRECIONA PARA LOGIN DO DISCORD
// =======================================
app.get("/api/login-discord", (req, res) => {
  const redirect = encodeURIComponent(process.env.DISCORD_REDIRECT);

  const url = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${redirect}&scope=identify`;

  return res.redirect(url);
});

// =======================================
// 3. RETORNO DO DISCORD (OAuth callback)
// =======================================
app.get("/api/discord/callback", async (req, res) => {
  const code = req.query.code;
  const uid = req.query.state; // Usuário logado no site

  if (!code || !uid)
    return res.status(400).send("Missing OAuth code or state.");

  try {
    // ================================
    // 3.1 TROCA CODE POR TOKEN
    // ================================
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // ================================
    // 3.2 BUSCA ID DO USUÁRIO
    // ================================
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const discordUser = userRes.data;

    // ================================
    // 3.3 SALVA NO FIRESTORE
    // ================================
    await db.collection("discord_users").doc(discordUser.id).set({
      uid,
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      avatar: discordUser.avatar,
      linkedAt: new Date()
    });

    return res.send(`
      <h1>Discord vinculado com sucesso!</h1>
      <p>Agora você pode fechar esta aba.</p>
    `);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send("Erro ao vincular Discord.");
  }
});

// ============================
// 4. PORTA DO SERVIDOR
// ============================
app.listen(3000, () => {
  console.log("Backend rodando em http://localhost:3000");
});
