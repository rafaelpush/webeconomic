import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/finance", async (req,res)=>{
  const { uid, saldo, historico, message } = req.body;

  // Prompt para GPT controlar finanças
  const prompt = `
  Você é uma IA financeira avançada. O usuário tem saldo: R$${saldo.toFixed(2)} e histórico: ${historico.join(', ')}.
  Com base na mensagem do usuário: "${message}", decida se deve adicionar/remover saldo, registrar movimentação ou apenas responder. 
  Retorne JSON: { reply: "mensagem para usuário", updated:true|false, saldo:novoSaldo, historico:novoHistorico }
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers: {
    "Authorization": `Bearer ${process.env.OPENAI_KEY}`, // ✅ chave segura
    "Content-Type": "application/json"
  },
    body: JSON.stringify({
      model:"gpt-4",
      messages:[{role:"system", content:prompt}],
      temperature:0.5
    })
  });

  const data = await response.json();
  // Assumimos que GPT retorna JSON válido
  const gptReply = JSON.parse(data.choices[0].message.content);
  res.json(gptReply);
});

app.listen(3000,()=>console.log("Backend GPT financeiro rodando em :3000"));
