// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Rotas
import vincularRouter from "./api/vincular.js";

app.use("/api", vincularRouter);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend ativo na porta " + PORT));
