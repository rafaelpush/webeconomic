import MercadoPago from "mercadopago";

const mercadopago = new MercadoPago({
  access_token: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { uid, plano, valor } = req.body;

    if (!uid || !plano || !valor)
      return res.status(400).json({ error: "Dados insuficientes" });

    const preference = {
      items: [
        {
          title: `Plano ${plano}`,
          quantity: 1,
          unit_price: Number(valor),
        },
      ],
      external_reference: `${uid}|${plano}`,
      notification_url: "https://webeconomic.onrender.com/webhook",
    };

    const result = await mercadopago.preferences.create(preference);

    return res.status(200).json({ init_point: result.body.init_point });
  } catch (err) {
    console.error("Erro MercadoPago:", err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
