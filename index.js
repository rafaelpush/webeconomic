import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(cors());

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // ⚠️ Certifique-se de definir no Render
});

// Chat financeiro
app.post("/api/finance", async (req, res) => {
  const { userId, saldo, historico, message } = req.body;

  if (!message) return res.status(400).json({ error: "Mensagem não enviada" });

  try {
    const prompt = `
Você é uma IA financeira que controla apenas finanças do usuário.
Saldo atual: R$${saldo.toFixed(2)}
Histórico: ${historico.join(", ")}
Mensagem do usuário: "${message}"
Retorne JSON: { "reply": "mensagem da IA", "updated": true|false, "saldo": novoSaldo, "historico": novoHistorico }
`;

    const response = await client.responses.create({
      model: "gpt-5.1",
      input: prompt,
    });

    // A resposta principal
    const outputText = response.output_text?.trim() || "Erro: resposta inválida da IA";

    // Tenta converter JSON
    let jsonReply = {};
    try {
      jsonReply = JSON.parse(outputText);
    } catch {
      jsonReply = { reply: outputText, updated: false, saldo, historico };
    }

    res.json(jsonReply);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao conectar com a OpenAI" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
