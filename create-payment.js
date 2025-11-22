import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { uid, plano, valor } = req.body;

    // ✅ Correção da verificação
    if (!uid || !plano || !valor)
      return res.status(400).json({ error: "Dados insuficientes" });

    if (!process.env.MP_ACCESS_TOKEN)
      return res.status(500).json({ error: "MP_ACCESS_TOKEN ausente" });

    const preference = {
      items: [
        {
          title: `Plano ${plano}`, // ✅ template string
          quantity: 1,
          unit_price: Number(valor),
        },
      ],
      external_reference: `${uid}|${plano}`, // ✅ template string
      notification_url: "https://webeconomic.onrender.com/webhook",
    };

    const result = await mercadopago.preferences.create(preference);

    return res.status(200).json({ init_point: result.body.init_point });
  } catch (err) {
    console.error("Erro MercadoPago:", err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
