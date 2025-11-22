import mercadopago from "mercadopago";
import admin from "firebase-admin";

// Inicializa Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN)),
  });
}

export default async function handler(req, res) {
  try {
    const data = req.body;

    if (data.type !== "payment") return res.status(200).send("ignored");

    const paymentId = data.data.id;

    // Cria instância do MercadoPago compatível com v2.x
    const mp = new mercadopago(process.env.MP_ACCESS_TOKEN, {
      locale: "pt-BR",
    });

    // Buscar pagamento usando a instância
    const info = await mp.payment.findById(paymentId);
    const payment = info.body;

    if (payment.status === "approved") {
      const [uid, plano] = payment.external_reference.split("|");

      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set({ plan: plano }, { merge: true });
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("Erro webhook:", err);
    res.status(500).send("erro");
  }
}
