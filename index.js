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

// 🔹 Nova rota para o chat financeiro
app.post("/api/finance", async (req, res) => {
  const { userId, message } = req.body; // frontend envia o usuário + mensagem

  if (!message) return res.status(400).json({ error: "Mensagem não enviada" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`, // variável de ambiente
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Você é uma IA financeira que controla apenas a parte financeira do usuário. 
            Você mantém saldo, histórico de transações, permite adicionar/remover dinheiro, fazer PIX, emitir alertas e sugestões de finanças. 
            Responda apenas com instruções financeiras.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao conectar com a OpenAI" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
