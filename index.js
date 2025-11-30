// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ===============================
// IMPORTA ARQUIVOS DA PASTA /api
// ===============================
import vincularRouter from "./api/vincular.js";

// ===============================
// ROTAS
// ===============================
app.use("/api", vincularRouter);   // Google login + Discord OAuth
app.use("/api", financeRouter);    // Chat financeiro

// ===============================
// PORTA DO SERVIDOR
// ===============================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
