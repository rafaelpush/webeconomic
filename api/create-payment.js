import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function createPayment(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://webeconomia.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { uid, plano, valor, coupon } = req.body;

    if (!uid || !plano || !valor) return res.status(400).json({ error: "Dados insuficientes" });

    let finalPrice = Number(valor);
    if (coupon) {
      if (coupon.type === "percent") finalPrice *= (1 - coupon.value/100);
      else finalPrice = Math.max(0, finalPrice - coupon.value);
    }

    const preference = {
      items: [
        {
          title: `Plano ${plano}`,
          quantity: 1,
          unit_price: finalPrice,
        }
      ],
      external_reference: `${uid}|${plano}`,
      notification_url: "https://webeconomic-1fy7.onrender.com/api/webhook"
    };

    const result = await mercadopago.preferences.create(preference);

    return res.status(200).json({ init_point: result.body.init_point });

  } catch (err) {
    console.error("Erro MercadoPago:", err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
