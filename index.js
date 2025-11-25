import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // se Node >=18, pode usar global fetch
import createPayment from "./api/create-payment.js";
import webhook from "./api/webhook.js";

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Rotas de pagamento
app.post("/api/create-payment", createPayment);
app.post("/api/webhook", webhook);

// 🔹 Nova rota para o chat financeiro
app.post("/api/finance", async (req, res) => {
  const { userId, saldo = 0, historico = [], message } = req.body;

  if (!message) return res.status(400).json({ error: "Mensagem não enviada" });

  try {
    const systemPrompt = `
Você é uma IA financeira avançada.
O usuário tem saldo: R$${saldo.toFixed(2)} e histórico: ${historico.join(", ")}.
Com base na mensagem do usuário: "${message}", decida se deve adicionar/remover saldo, registrar movimentação ou apenas responder.
Responda **apenas em JSON** no seguinte formato:

{
  "reply": "mensagem para usuário",
  "updated": true|false,
  "saldo": novoSaldo,
  "historico": novoHistorico
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    // tenta parsear JSON retornado pelo GPT
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
    console.error(err);
    res.status(500).json({ error: "Erro ao conectar com a OpenAI" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
