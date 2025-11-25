import express from "express";
import cors from "cors";
import fetch from "node-fetch";
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
  const { userId, saldo, historico, message } = req.body;

  if (!message) return res.status(400).json({ error: "Mensagem não enviada" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  model: "gpt-3.5-turbo", // trocar gpt-4 -> gpt-3.5-turbo
  messages: [
    {
      role: "system",
      content: `Você é uma IA financeira que controla apenas a parte financeira do usuário. 
      Você mantém saldo, histórico de transações, permite adicionar/remover dinheiro, fazer PIX, emitir alertas e sugestões de finanças. 
      Responda apenas com instruções financeiras.`
    },
    { role: "user", content: message }
  ],
  temperature: 0.3
})
    });

    const data = await response.json();

    // Verificação segura
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Resposta inesperada da OpenAI:", data);
      return res.status(500).json({
        reply: "Erro: resposta inválida da IA",
        updated: false,
        saldo,
        historico
      });
    }

    let gptReply;
    try {
      gptReply = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA:", data.choices[0].message.content);
      gptReply = {
        reply: "Erro ao processar resposta da IA.",
        updated: false,
        saldo,
        historico
      };
    }

    res.json(gptReply);

  } catch (err) {
    console.error("Erro ao conectar com a OpenAI:", err);
    res.status(500).json({ error: "Erro ao conectar com a OpenAI" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
