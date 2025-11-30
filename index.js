import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import vincularRouter from "./api/vincular.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- AGORA A ROTA BASE É /api/vincular ---
app.use("/api/vincular", vincularRouter);

app.get("/", (req, res) => {
  res.send("API WebEconomia ativa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
