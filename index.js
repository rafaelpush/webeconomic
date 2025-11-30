import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// importa a rota do validate-coupon
import validateCouponRoute from "./validate-coupon.js"; // ajuste o caminho se necessário

const app = express();
app.use(cors());
app.use(express.json());

// rota raiz
app.get("/", (req, res) => {
  res.send("API WebEconomia ativa!");
});

// usa a rota de validação de cupom
app.use("/api/validate-coupon", validateCouponRoute);

// porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
