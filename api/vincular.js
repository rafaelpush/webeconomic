// /api/vincular.js
import express from "express";
import admin from "firebase-admin";
import axios from "axios";
import fs from "fs";

const router = express.Router();

// =======================================
// Firebase Admin
// =======================================
let serviceAccount;

// tenta pegar do env (Render)
if (process.env.FIREBASE_KEY_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);
} else {
  // fallback local
  serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// =======================================
// 1. ACEITA LOGIN GOOGLE
// =======================================
router.post("/accept-login", async (req, res) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email)
      return res.status(400).json({ error: "Missing UID or email." });

    await db.collection("users").doc(uid).set(
      {
        email,
        acceptedTerms: true,
        updatedAt: new Date(),
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
// 2. REDIRECIONA PARA DISCORD OAUTH
// =======================================
router.get("/login-discord", (req, res) => {
  const redirect = encodeURIComponent(process.env.DISCORD_REDIRECT);

  const url = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${redirect}&scope=identify&state=${req.query.uid}`;

  return res.redirect(url);
});

// =======================================
// 3. CALLBACK DO DISCORD
// =======================================
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  const uid = req.query.state;

  if (!code || !uid)
    return res.status(400).send("Missing OAuth code or state.");

  try {
    // troca code por token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // dados do usuário
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const discordUser = userRes.data;

    // grava no Firestore
    await db.collection("discord_users").doc(discordUser.id).set({
      uid,
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      avatar: discordUser.avatar,
      linkedAt: new Date(),
    });

    return res.send(`
      <h1>Discord vinculado com sucesso!</h1>
      <p>Você já pode fechar esta aba.</p>
    `);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send("Erro ao vincular Discord.");
  }
});

export default router;
