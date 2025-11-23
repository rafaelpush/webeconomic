import mercadopago from "mercadopago";

// Rota para criar pagamento compatível com MercadoPago v2.x
export default async function createPayment(req, res) {

  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "https://webeconomia.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responde rapidamente ao preflight OPTIONS
  if (req.method === "OPTIONS") return res.status(200).end();

  // Permitir apenas POST
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { uid, plano, valor } = req.body;

    // Validação básica
    if (!uid || !plano || !valor) {
      return res.status(400).json({ error: "Dados insuficientes" });
    }

    // Configura os itens do pagamento
    const preference = {
      items: [
        {
          title: `Plano ${plano}`,
          quantity: 1,
          unit_price: Number(valor),
        },
      ],
      external_reference: `${uid}|${plano}`,
      notification_url: "https://webeconomic-1fy7.onrender.com/api/webhook", // webhook
    };

    // Cria a preferência usando MercadoPago v2.x
    const result = await mercadopago.preferences.create(preference, {
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    // Retorna link de pagamento
    return res.status(200).json({ init_point: result.body.init_point });
  } catch (err) {
    console.error("Erro MercadoPago:", err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
