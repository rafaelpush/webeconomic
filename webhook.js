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

    // Buscar pagamento passando o access_token na chamada
    const info = await mercadopago.payment.findById(paymentId, {
      access_token: process.env.MP_ACCESS_TOKEN,
    });

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
