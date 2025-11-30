import express from "express";
import cors from "cors";
import discordRouter from "./api/discord.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", discordRouter);   

app.get("/", (req, res) => {
  res.send("API WebEconomia ativa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
