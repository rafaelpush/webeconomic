import express from "express";
import cors from "cors";
import createPayment from "./api/create-payment.js";
import webhook from "./api/webhook.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "https://webeconomia.vercel.app/valores.html" // frontend hospedado na Vercel
}));

// Rotas
app.post("/create-payment", createPayment);
app.post("/webhook", webhook);

// Start do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
