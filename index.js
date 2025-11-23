import express from "express";
import cors from "cors";
import createPayment from "./api/create-payment.js";
import webhook from "./api/webhook.js";

const app = express();
app.use(express.json());
app.use(cors());

// Rotas reais
app.post("/api/create-payment", createPayment);
app.post("/api/webhook", webhook);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
